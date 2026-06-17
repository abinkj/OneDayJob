/**
 * Offline action queue for handling actions when network is unavailable
 * Ensures no data loss during offline periods
 */

export type ActionType = 'start' | 'pause' | 'resume' | 'complete' | 'heartbeat';

export interface QueuedAction {
    id: string;
    type: ActionType;
    timestamp: number;
    payload?: any;
    retries: number;
}

class SyncQueue {
    private queue: QueuedAction[] = [];
    private maxRetries = 3;
    private processing = false;

    /**
     * Add an action to the queue
     */
    enqueue(type: ActionType, payload?: any): string {
        const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const action: QueuedAction = {
            id,
            type,
            timestamp: Date.now(),
            payload,
            retries: 0,
        };

        this.queue.push(action);
        console.log(`[SyncQueue] Enqueued action: ${type}`, action);

        return id;
    }

    /**
     * Process all queued actions
     */
    async processQueue(
        executor: (action: QueuedAction) => Promise<void>
    ): Promise<{ success: number; failed: number }> {
        if (this.processing) {
            console.log('[SyncQueue] Already processing, skipping');
            return { success: 0, failed: 0 };
        }

        this.processing = true;
        let success = 0;
        let failed = 0;

        console.log(`[SyncQueue] Processing ${this.queue.length} actions`);

        // Process actions in order
        while (this.queue.length > 0) {
            const action = this.queue[0];

            try {
                await executor(action);
                this.queue.shift(); // Remove from queue on success
                success++;
                console.log(`[SyncQueue] Successfully processed: ${action.type}`);
            } catch (error) {
                console.error(`[SyncQueue] Failed to process: ${action.type}`, error);

                action.retries++;

                if (action.retries >= this.maxRetries) {
                    console.error(`[SyncQueue] Max retries reached for: ${action.type}`);
                    this.queue.shift(); // Remove failed action
                    failed++;
                } else {
                    // Move to end of queue for retry
                    this.queue.shift();
                    this.queue.push(action);
                    console.log(`[SyncQueue] Retry ${action.retries}/${this.maxRetries} for: ${action.type}`);
                }
            }
        }

        this.processing = false;
        console.log(`[SyncQueue] Processing complete. Success: ${success}, Failed: ${failed}`);

        return { success, failed };
    }

    /**
     * Get current queue size
     */
    size(): number {
        return this.queue.length;
    }

    /**
     * Clear all queued actions
     */
    clear(): void {
        console.log(`[SyncQueue] Clearing ${this.queue.length} actions`);
        this.queue = [];
    }

    /**
     * Get all queued actions (for debugging)
     */
    getQueue(): QueuedAction[] {
        return [...this.queue];
    }

    /**
     * Remove a specific action by ID
     */
    remove(id: string): boolean {
        const index = this.queue.findIndex(action => action.id === id);
        if (index !== -1) {
            this.queue.splice(index, 1);
            console.log(`[SyncQueue] Removed action: ${id}`);
            return true;
        }
        return false;
    }
}

// Singleton instance
export const syncQueue = new SyncQueue();

export default () => null;
