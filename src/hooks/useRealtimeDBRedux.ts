import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  subscribeToPath,
  unsubscribeFromPath,
  writeData,
} from '@/store/slices/databaseSlice';

/**
 * Redux-based hook for Firebase Realtime Database operations
 * Replaces the original useRealtimeDB hook with centralized Redux state management
 */
export function useRealtimeDBRedux(path: string) {
  const dispatch = useAppDispatch();
  
  // Select data from Redux store
  const data = useAppSelector((state) => state.database.data[path] || null);
  const loading = useAppSelector((state) => state.database.loading[path] || false);
  const error = useAppSelector((state) => state.database.error[path] || null);

  // Subscribe to the path when component mounts or path changes
  useEffect(() => {
    if (path) {
      dispatch(subscribeToPath({ path }));
    }

    // Cleanup: unsubscribe when component unmounts or path changes
    return () => {
      if (path) {
        dispatch(unsubscribeFromPath({ path }));
      }
    };
  }, [dispatch, path]);

  // Write data function
  const writeDataToPath = useCallback(
    async (value: any) => {
      if (path) {
        return dispatch(writeData({ path, value }));
      }
    },
    [dispatch, path]
  );

  return {
    data,
    loading,
    error,
    writeData: writeDataToPath,
  };
}

/**
 * Hook for writing data to Firebase Realtime Database without subscribing
 * Useful for one-time write operations
 */
export function useWriteData() {
  const dispatch = useAppDispatch();

  const writeDataToPath = useCallback(
    async (path: string, value: any) => {
      return dispatch(writeData({ path, value }));
    },
    [dispatch]
  );

  return writeDataToPath;
}

/**
 * Hook for managing multiple database subscriptions
 * Useful when you need to subscribe to multiple paths simultaneously
 */
export function useMultipleRealtimeDB(paths: string[]) {
  const dispatch = useAppDispatch();
  
  // Select data for all paths
  const data = useAppSelector((state) => {
    const result: Record<string, any> = {};
    paths.forEach(path => {
      result[path] = state.database.data[path] || null;
    });
    return result;
  });

  const loading = useAppSelector((state) => {
    const result: Record<string, boolean> = {};
    paths.forEach(path => {
      result[path] = state.database.loading[path] || false;
    });
    return result;
  });

  const errors = useAppSelector((state) => {
    const result: Record<string, string | null> = {};
    paths.forEach(path => {
      result[path] = state.database.error[path] || null;
    });
    return result;
  });

  // Subscribe to all paths
  useEffect(() => {
    paths.forEach(path => {
      if (path) {
        dispatch(subscribeToPath({ path }));
      }
    });

    // Cleanup: unsubscribe from all paths
    return () => {
      paths.forEach(path => {
        if (path) {
          dispatch(unsubscribeFromPath({ path }));
        }
      });
    };
  }, [dispatch, paths]);

  // Write data function for specific path
  const writeDataToPath = useCallback(
    async (path: string, value: any) => {
      if (paths.includes(path)) {
        return dispatch(writeData({ path, value }));
      }
    },
    [dispatch, paths]
  );

  return {
    data,
    loading,
    errors,
    writeData: writeDataToPath,
  };
}
