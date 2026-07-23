import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OfflineSyncState, QueuedRequest } from "../../offline/types";

const initialState: OfflineSyncState = {
  queue: [],
  isSyncing: false,
  lastError: null,
};

const offlineSyncSlice = createSlice({
  name: "offlineSync",
  initialState,
  reducers: {
    enqueueRequest: (state, action: PayloadAction<QueuedRequest>) => {
      // Avoid duplicate enqueuing if desired, or handle coalescing.
      // For simplicity, we just push. The queuePolicy handles selection.
      state.queue.push(action.payload);
    },
    popRequest: (state) => {
      state.queue.shift();
    },
    setSyncingStatus: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.lastError = action.payload;
    },
    clearQueue: (state) => {
      state.queue = [];
      state.isSyncing = false;
      state.lastError = null;
    },
    removeRequestById: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((req) => req.id !== action.payload);
    },
    hydrateQueue: (state, action: PayloadAction<QueuedRequest[]>) => {
      state.queue = action.payload;
    },
  },
});

export const {
  enqueueRequest,
  popRequest,
  setSyncingStatus,
  setSyncError,
  clearQueue,
  removeRequestById,
  hydrateQueue,
} = offlineSyncSlice.actions;

export default offlineSyncSlice.reducer;
