"use client"

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { subscribeToPath, unsubscribeFromPath } from '@/store/slices/databaseSlice';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  createdAt: number;
  createdBy: string;
  members: Record<string, boolean>;
  unreadCount?: number;
}

export function useChannels(userId?: string) {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.database);

  // Get user's channel IDs
  const userChannelsPath = userId ? `userChannels/${userId}` : null;
  const userChannelIds = userChannelsPath ? data[userChannelsPath] : null;

  // Get channels data
  const channels = useMemo(() => {
    if (!userChannelIds) return [];
    
    const channelList: Channel[] = [];
    Object.keys(userChannelIds).forEach(channelId => {
      const channelPath = `channels/${channelId}`;
      const channelData = data[channelPath];
      if (channelData) {
        channelList.push({
          ...channelData,
          id: channelId,
          unreadCount: 0 // TODO: Implement unread count logic
        });
      }
    });
    
    // Sort by creation date
    return channelList.sort((a, b) => a.createdAt - b.createdAt);
  }, [userChannelIds, data]);

  // Subscribe to channels when user channel IDs are available
  useEffect(() => {
    if (!userChannelIds) return;

    const channelIds = Object.keys(userChannelIds);
    
    // Subscribe to each channel's data
    channelIds.forEach(channelId => {
      const channelPath = `channels/${channelId}`;
      dispatch(subscribeToPath({ path: channelPath }));
    });

    // Cleanup function
    return () => {
      channelIds.forEach(channelId => {
        const channelPath = `channels/${channelId}`;
        dispatch(unsubscribeFromPath({ path: channelPath }));
      });
    };
  }, [userChannelIds, dispatch]);

  const isLoading = loading[userChannelsPath || ''] || false;
  const channelError = error[userChannelsPath || ''] || null;

  return {
    channels,
    loading: isLoading,
    error: channelError,
  };
}
