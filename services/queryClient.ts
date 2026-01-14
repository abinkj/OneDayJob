import { QueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// Track network status
let isOnline = true;
NetInfo.fetch().then(state => {
  isOnline = state.isConnected ?? false;
});
NetInfo.addEventListener(state => {
  isOnline = state.isConnected ?? false;
});

// Network-aware retry function
const networkAwareRetry = (failureCount: number, error: any) => {
  // Don't retry if we've already tried 3 times
  if (failureCount >= 3) {
    return false;
  }

  // Don't retry network errors when offline
  if (!isOnline && (error?.message?.includes('Network') || error?.code === 'ECONNABORTED')) {
    return false;
  }

  // Retry other errors (like 500, 503, etc.)
  return failureCount < 3;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: networkAwareRetry,
      // Refetch when network reconnects
      refetchOnReconnect: true,
      // Don't refetch on window focus in mobile apps
      refetchOnWindowFocus: false,
      // Network mode: only fetch when online
      networkMode: 'online',
    },
    mutations: {
      // Mutations should also respect network status
      networkMode: 'online',
      retry: 1,
    },
  },
});

