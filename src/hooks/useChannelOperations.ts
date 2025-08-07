"use client"

import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { createChannel, updateChannel, deleteChannel, joinChannel, searchPublicChannels } from '@/store/slices/databaseSlice';

export function useChannelOperations() {
  const dispatch = useAppDispatch();

  const handleCreateChannel = useCallback(
    async (userId: string, name: string, type: 'text' | 'voice' = 'text') => {
      if (!name.trim()) {
        throw new Error('Channel name cannot be empty');
      }
      
      try {
        const result = await dispatch(createChannel({ userId, name, type })).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to create channel:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const handleUpdateChannel = useCallback(
    async (channelId: string, name: string, userId: string) => {
      if (!name.trim()) {
        throw new Error('Channel name cannot be empty');
      }
      
      try {
        const result = await dispatch(updateChannel({ channelId, name, userId })).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to update channel:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const handleDeleteChannel = useCallback(
    async (channelId: string, userId: string) => {
      try {
        const result = await dispatch(deleteChannel({ channelId, userId })).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to delete channel:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const handleJoinChannel = useCallback(
    async (channelId: string, userId: string) => {
      try {
        const result = await dispatch(joinChannel({ channelId, userId })).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to join channel:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const handleSearchChannels = useCallback(
    async (query: string, userId: string) => {
      try {
        const result = await dispatch(searchPublicChannels({ query, userId })).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to search channels:', error);
        throw error;
      }
    },
    [dispatch]
  );

  return {
    createChannel: handleCreateChannel,
    updateChannel: handleUpdateChannel,
    deleteChannel: handleDeleteChannel,
    joinChannel: handleJoinChannel,
    searchChannels: handleSearchChannels,
  };
}
