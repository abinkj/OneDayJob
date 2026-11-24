import { AxiosRequestConfig } from "axios";

export type RequestMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export interface QueuedRequest {
  id: string;
  url: string;
  method: RequestMethod;
  data?: any;
  headers?: Record<string, string>;
  contentType?: string;
  createdAt: number;
  retryCount: number;
}

export interface OfflineSyncState {
  queue: QueuedRequest[];
  isSyncing: boolean;
  lastError: string | null;
}
