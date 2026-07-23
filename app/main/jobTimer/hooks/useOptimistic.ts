/**
 * useOptimistic Hook
 *
 * Generic hook for optimistic UI updates with automatic rollback on error.
 * Provides instant feedback while waiting for server confirmation.
 */

import { useState, useCallback, useRef } from "react";

export interface OptimisticState<T> {
  data: T | null;
  isOptimistic: boolean;
  error: Error | null;
}

export interface UseOptimisticReturn<T> {
  state: OptimisticState<T>;
  updateOptimistic: (
    optimisticData: T,
    serverUpdate: () => Promise<T>
  ) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing optimistic updates
 *
 * @param initialData - Initial data state
 * @returns Optimistic state and update function
 */
export function useOptimistic<T>(
  initialData: T | null = null
): UseOptimisticReturn<T> {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    error: null,
  });

  const previousDataRef = useRef<T | null>(initialData);

  const updateOptimistic = useCallback(
    async (optimisticData: T, serverUpdate: () => Promise<T>) => {
      // Save current data for rollback
      previousDataRef.current = state.data;

      // Apply optimistic update immediately
      setState({
        data: optimisticData,
        isOptimistic: true,
        error: null,
      });

      try {
        // Execute server update
        const serverData = await serverUpdate();

        // Apply server response
        setState({
          data: serverData,
          isOptimistic: false,
          error: null,
        });

        previousDataRef.current = serverData;
      } catch (error) {
        // Rollback to previous data on error
        console.error(
          "[useOptimistic] Server update failed, rolling back",
          error
        );

        setState({
          data: previousDataRef.current,
          isOptimistic: false,
          error: error as Error,
        });
      }
    },
    [state.data]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isOptimistic: false,
      error: null,
    });
    previousDataRef.current = initialData;
  }, [initialData]);

  return {
    state,
    updateOptimistic,
    reset,
  };
}

export default () => null;
