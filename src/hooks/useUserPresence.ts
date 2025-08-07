"use client"

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserPresence, subscribeToPath, unsubscribeFromPath } from '@/store/slices/databaseSlice';
import { useAuthRedux } from '@/hooks/useAuthRedux';

interface UserPresenceData {
  isOnline: boolean;
  lastSeen: number;
  displayName?: string;
  email?: string;
}

export function useUserPresence(userId?: string) {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state) => state.database);
  const { user, authUser } = useAuthRedux();

  // Update user's own presence
  const updatePresence = useCallback(
    async (isOnline: boolean) => {
      if (!userId) return;
      
      // Get user data from auth
      const displayName = user?.user?.displayName || authUser?.displayName || '';
      const email = user?.user?.email || authUser?.email || '';
      
      try {
        await dispatch(updateUserPresence({
          userId,
          isOnline,
          lastSeen: Date.now(),
          displayName,
          email,
        })).unwrap();
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    },
    [dispatch, userId, user, authUser]
  );

  // Set user online when component mounts and offline when unmounts
  useEffect(() => {
    if (!userId) return;

    // Set online status
    updatePresence(true);

    // Subscribe to presence updates
    dispatch(subscribeToPath({ path: 'presence' }));

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    // Handle beforeunload (user leaving the page)
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      updatePresence(false);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      dispatch(unsubscribeFromPath({ path: 'presence' }));
    };
  }, [userId, updatePresence, dispatch]);

  // Get all users' presence data
  const presenceData: Record<string, UserPresenceData> = data.presence || {};

  // Helper function to check if a user is online
  const isUserOnline = useCallback((targetUserId: string): boolean => {
    const userPresence = presenceData[targetUserId];
    if (!userPresence) return false;
    
    // Consider user online if they were active in the last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return userPresence.isOnline && userPresence.lastSeen > fiveMinutesAgo;
  }, [presenceData]);

  // Get user's display name
  const getUserDisplayName = useCallback((targetUserId: string): string => {
    const userPresence = presenceData[targetUserId];
    console.log(userPresence);
    return userPresence?.displayName || userPresence?.email?.split('@')[0] || 'Unknown User';
  }, [presenceData]);

  return {
    presenceData,
    isUserOnline,
    getUserDisplayName,
    updatePresence,
  };
}
