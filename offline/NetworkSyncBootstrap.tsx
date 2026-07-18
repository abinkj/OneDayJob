import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { setDeviceOnline } from './networkState';
import { setSyncDispatch } from './syncBridge';
import { processOfflineQueue } from './processOfflineQueue';
import { AppDispatch, RootState } from '../redux/store';
import { storage, initializeStorage } from '../utilities/mmkvStore';
import { hydrateQueue } from '../redux/slices/offlineSyncSlice';

const OFFLINE_QUEUE_STORAGE_KEY = 'OFFLINE_SYNC_QUEUE';

/**
 * Root-level component to bootstrap the offline synchronization system.
 */
const NetworkSyncBootstrap: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queue = useSelector((state: RootState) => state.offlineSync.queue);

  // 1. Initial Setup
  useEffect(() => {
    setSyncDispatch(dispatch);

    // Load queue from storage (Hydration)
    const hydrate = async () => {
      try {
        await initializeStorage();
        const storedQueue = storage.getString(OFFLINE_QUEUE_STORAGE_KEY);
        if (storedQueue) {
          const parsedQueue = JSON.parse(storedQueue);
          if (Array.isArray(parsedQueue) && parsedQueue.length > 0) {
            console.log(`📦 Hydrating offline queue with ${parsedQueue.length} requests`);
            dispatch(hydrateQueue(parsedQueue));
          }
        }
      } catch (error) {
        console.error('Failed to hydrate offline queue:', error);
      }
    };

    hydrate();

    // Setup NetInfo listener
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = !!(state.isConnected && state.isInternetReachable !== false);
      setDeviceOnline(isOnline);
      
      console.log(`📡 Network is ${isOnline ? 'ONLINE' : 'OFFLINE'}`);

      if (isOnline) {
        processOfflineQueue();
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // 2. Persistence Layer
  // Save queue to MMKV whenever it changes
  useEffect(() => {
    const persist = async () => {
      try {
        await initializeStorage();
        storage.set(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
      } catch (error) {
        console.error('Failed to persist offline queue:', error);
      }
    };

    persist();
  }, [queue]);

  return null; // This is a logic-only component
};

export default NetworkSyncBootstrap;
