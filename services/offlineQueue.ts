import NetInfo from '@react-native-community/netinfo';
import { storage, initializeStorage } from '../utilities/mmkvStore';
import axios, { AxiosRequestConfig } from 'axios';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RequestMethod = 'POST' | 'PUT' | 'DELETE';
export type RequestStatus = 'pending' | 'processing' | 'failed' | 'success';

export interface QueuedRequest {
    id: string;                    // Unique request ID (UUID)
    idempotencyKey: string;        // Prevents duplicates (hash of action + params)
    endpoint: string;              // API endpoint (e.g., '/applications/jobs/123/apply')
    method: RequestMethod;         // HTTP method
    data?: any;                    // Request payload
    headers?: Record<string, string>; // Additional headers
    timestamp: number;             // When queued (ms since epoch)
    retryCount: number;            // Number of retry attempts
    maxRetries: number;            // Max retry limit
    status: RequestStatus;         // Current status
    lastError?: string;            // Last error message
}

export interface QueueStatus {
    totalRequests: number;
    pendingRequests: number;
    processingRequests: number;
    failedRequests: number;
    isOnline: boolean;
    isProcessing: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QUEUE_STORAGE_KEY = 'OFFLINE_REQUEST_QUEUE';
const PROCESSED_KEYS_STORAGE_KEY = 'PROCESSED_IDEMPOTENCY_KEYS';
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay
const PROCESSED_KEYS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ============================================================================
// OFFLINE QUEUE SERVICE
// ============================================================================

class OfflineQueueService {
    private queue: QueuedRequest[] = [];
    private processedKeys: Map<string, number> = new Map(); // key -> timestamp
    private isProcessing = false;
    private isOnline = false;
    private unsubscribeNetInfo: (() => void) | null = null;

    constructor() {
        this.initialize();
    }

    // --------------------------------------------------------------------------
    // INITIALIZATION
    // --------------------------------------------------------------------------

    private async initialize() {
        try {
            // Ensure MMKV storage is ready
            await initializeStorage();

            // Load queue from storage
            await this.loadQueue();

            // Load processed keys
            await this.loadProcessedKeys();

            // Clean up old processed keys
            this.cleanupProcessedKeys();

            // Setup network listener
            this.setupNetworkListener();

            console.log('✅ OfflineQueue initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize OfflineQueue:', error);
        }
    }

    // --------------------------------------------------------------------------
    // NETWORK DETECTION
    // --------------------------------------------------------------------------

    private setupNetworkListener() {
        this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            const wasOffline = !this.isOnline;
            this.isOnline = state.isConnected ?? false;

            console.log(`📡 Network status: ${this.isOnline ? 'Online' : 'Offline'}`);

            // If we just came online and have pending requests, process them
            if (wasOffline && this.isOnline && this.queue.length > 0) {
                console.log('🔄 Network restored, processing queue...');
                this.processQueue();
            }
        });
    }

    // --------------------------------------------------------------------------
    // QUEUE MANAGEMENT
    // --------------------------------------------------------------------------

    /**
     * Add a request to the offline queue
     */
    public async enqueue(
        endpoint: string,
        method: RequestMethod,
        data?: any,
        headers?: Record<string, string>,
        maxRetries: number = MAX_RETRIES
    ): Promise<string> {
        try {
            // Generate unique ID and idempotency key
            const id = this.generateUUID();
            const idempotencyKey = this.generateIdempotencyKey(endpoint, method, data);

            // Check if already processed (duplicate prevention)
            if (this.isAlreadyProcessed(idempotencyKey)) {
                console.log(`⚠️ Request already processed: ${idempotencyKey}`);
                throw new Error('Request already processed');
            }

            // Check if already in queue
            const existingRequest = this.queue.find(
                (req) => req.idempotencyKey === idempotencyKey && req.status !== 'failed'
            );

            if (existingRequest) {
                console.log(`⚠️ Request already in queue: ${idempotencyKey}`);
                return existingRequest.id;
            }

            // Create queued request
            const queuedRequest: QueuedRequest = {
                id,
                idempotencyKey,
                endpoint,
                method,
                data,
                headers,
                timestamp: Date.now(),
                retryCount: 0,
                maxRetries,
                status: 'pending',
            };

            // Add to queue
            this.queue.push(queuedRequest);

            // Persist to storage
            await this.saveQueue();

            console.log(`✅ Request queued: ${endpoint} (${id})`);

            // If online, try to process immediately
            if (this.isOnline) {
                this.processQueue();
            }

            return id;
        } catch (error) {
            console.error('❌ Failed to enqueue request:', error);
            throw error;
        }
    }

    /**
     * Process all pending requests in the queue (FIFO)
     */
    public async processQueue(): Promise<void> {
        // Prevent concurrent processing
        if (this.isProcessing) {
            console.log('⏳ Queue processing already in progress');
            return;
        }

        // Don't process if offline
        if (!this.isOnline) {
            console.log('📴 Offline - queue processing skipped');
            return;
        }

        // No pending requests
        const pendingRequests = this.queue.filter((req) => req.status === 'pending');
        if (pendingRequests.length === 0) {
            console.log('✅ No pending requests in queue');
            return;
        }

        this.isProcessing = true;
        console.log(`🔄 Processing ${pendingRequests.length} pending requests...`);

        // Process requests in FIFO order
        for (const request of pendingRequests) {
            await this.processRequest(request);
        }

        this.isProcessing = false;
        console.log('✅ Queue processing completed');
    }

    /**
     * Process a single request
     */
    private async processRequest(request: QueuedRequest): Promise<void> {
        try {
            // Mark as processing
            request.status = 'processing';
            await this.saveQueue();

            console.log(`🔄 Processing request: ${request.endpoint} (attempt ${request.retryCount + 1}/${request.maxRetries})`);

            // Import api instance dynamically to avoid circular dependency
            const { default: api } = await import('./api');

            // Execute the request
            const config: AxiosRequestConfig = {
                method: request.method,
                url: request.endpoint,
                data: request.data,
                headers: {
                    ...request.headers,
                    'X-Idempotency-Key': request.idempotencyKey,
                },
            };

            const response = await api.request(config);

            // Success - remove from queue and mark as processed
            console.log(`✅ Request succeeded: ${request.endpoint}`);
            this.markAsProcessed(request.idempotencyKey);
            this.removeFromQueue(request.id);

        } catch (error: any) {
            console.error(`❌ Request failed: ${request.endpoint}`, error.message);

            // Increment retry count
            request.retryCount++;
            request.lastError = error.message || 'Unknown error';

            // Check if we should retry
            if (request.retryCount < request.maxRetries) {
                // Calculate exponential backoff delay
                const delay = RETRY_DELAY_BASE * Math.pow(2, request.retryCount - 1);
                console.log(`⏳ Retrying in ${delay}ms...`);

                // Reset to pending for next retry
                request.status = 'pending';
                await this.saveQueue();

                // Wait before next retry
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                // Max retries reached - mark as failed
                console.error(`❌ Max retries reached for: ${request.endpoint}`);
                request.status = 'failed';
                await this.saveQueue();
            }
        }
    }

    /**
     * Remove a specific request from the queue
     */
    public async removeRequest(requestId: string): Promise<boolean> {
        const index = this.queue.findIndex((req) => req.id === requestId);
        if (index === -1) {
            return false;
        }

        this.queue.splice(index, 1);
        await this.saveQueue();
        console.log(`🗑️ Request removed: ${requestId}`);
        return true;
    }

    /**
     * Clear all requests from the queue
     */
    public async clearQueue(): Promise<void> {
        this.queue = [];
        await this.saveQueue();
        console.log('🗑️ Queue cleared');
    }

    /**
     * Clear only failed requests
     */
    public async clearFailedRequests(): Promise<void> {
        const beforeCount = this.queue.length;
        this.queue = this.queue.filter((req) => req.status !== 'failed');
        await this.saveQueue();
        console.log(`🗑️ Cleared ${beforeCount - this.queue.length} failed requests`);
    }

    /**
     * Retry a failed request
     */
    public async retryRequest(requestId: string): Promise<void> {
        const request = this.queue.find((req) => req.id === requestId);
        if (!request) {
            throw new Error('Request not found');
        }

        if (request.status !== 'failed') {
            throw new Error('Only failed requests can be retried');
        }

        // Reset retry count and status
        request.retryCount = 0;
        request.status = 'pending';
        request.lastError = undefined;
        await this.saveQueue();

        console.log(`🔄 Request reset for retry: ${requestId}`);

        // Process if online
        if (this.isOnline) {
            this.processQueue();
        }
    }

    /**
     * Get current queue status
     */
    public getQueueStatus(): QueueStatus {
        return {
            totalRequests: this.queue.length,
            pendingRequests: this.queue.filter((req) => req.status === 'pending').length,
            processingRequests: this.queue.filter((req) => req.status === 'processing').length,
            failedRequests: this.queue.filter((req) => req.status === 'failed').length,
            isOnline: this.isOnline,
            isProcessing: this.isProcessing,
        };
    }

    /**
     * Get all queued requests
     */
    public getQueuedRequests(): QueuedRequest[] {
        return [...this.queue];
    }

    // --------------------------------------------------------------------------
    // PERSISTENCE
    // --------------------------------------------------------------------------

    private async saveQueue(): Promise<void> {
        try {
            storage.set(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error('❌ Failed to save queue:', error);
        }
    }

    private async loadQueue(): Promise<void> {
        try {
            const queueData = storage.getString(QUEUE_STORAGE_KEY);
            if (queueData) {
                this.queue = JSON.parse(queueData);
                console.log(`📦 Loaded ${this.queue.length} requests from storage`);
            }
        } catch (error) {
            console.error('❌ Failed to load queue:', error);
            this.queue = [];
        }
    }

    private async saveProcessedKeys(): Promise<void> {
        try {
            const keysArray = Array.from(this.processedKeys.entries());
            storage.set(PROCESSED_KEYS_STORAGE_KEY, JSON.stringify(keysArray));
        } catch (error) {
            console.error('❌ Failed to save processed keys:', error);
        }
    }

    private async loadProcessedKeys(): Promise<void> {
        try {
            const keysData = storage.getString(PROCESSED_KEYS_STORAGE_KEY);
            if (keysData) {
                const keysArray = JSON.parse(keysData);
                this.processedKeys = new Map(keysArray);
                console.log(`📦 Loaded ${this.processedKeys.size} processed keys`);
            }
        } catch (error) {
            console.error('❌ Failed to load processed keys:', error);
            this.processedKeys = new Map();
        }
    }

    // --------------------------------------------------------------------------
    // DUPLICATE PREVENTION
    // --------------------------------------------------------------------------

    private generateIdempotencyKey(endpoint: string, method: string, data?: any): string {
        // Create a unique key based on endpoint, method, and critical data
        const payload = JSON.stringify({ endpoint, method, data });
        return this.simpleHash(payload);
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `idem_${Math.abs(hash).toString(36)}`;
    }

    private isAlreadyProcessed(idempotencyKey: string): boolean {
        return this.processedKeys.has(idempotencyKey);
    }

    private markAsProcessed(idempotencyKey: string): void {
        this.processedKeys.set(idempotencyKey, Date.now());
        this.saveProcessedKeys();
    }

    private removeFromQueue(requestId: string): void {
        const index = this.queue.findIndex((req) => req.id === requestId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            this.saveQueue();
        }
    }

    private cleanupProcessedKeys(): void {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, timestamp] of this.processedKeys.entries()) {
            if (now - timestamp > PROCESSED_KEYS_TTL) {
                this.processedKeys.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} old processed keys`);
            this.saveProcessedKeys();
        }
    }

    // --------------------------------------------------------------------------
    // UTILITIES
    // --------------------------------------------------------------------------

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Cleanup when service is destroyed
     */
    public destroy(): void {
        if (this.unsubscribeNetInfo) {
            this.unsubscribeNetInfo();
            this.unsubscribeNetInfo = null;
        }
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const offlineQueue = new OfflineQueueService();

// ============================================================================
// HELPER FUNCTIONS FOR EASY INTEGRATION
// ============================================================================

/**
 * Enqueue a request with automatic offline detection
 * Returns a promise that resolves immediately if online, or queues if offline
 */
export async function enqueueOrExecute<T>(
    axiosCall: () => Promise<T>,
    endpoint: string,
    method: RequestMethod,
    data?: any,
    headers?: Record<string, string>
): Promise<T | { queued: true; requestId: string }> {
    const status = offlineQueue.getQueueStatus();

    if (status.isOnline) {
        // Online - execute immediately
        try {
            return await axiosCall();
        } catch (error: any) {
            // If network error, queue it
            if (error.message?.includes('Network') || error.code === 'ECONNABORTED') {
                const requestId = await offlineQueue.enqueue(endpoint, method, data, headers);
                return { queued: true, requestId };
            }
            throw error;
        }
    } else {
        // Offline - queue it
        const requestId = await offlineQueue.enqueue(endpoint, method, data, headers);
        return { queued: true, requestId };
    }
}
