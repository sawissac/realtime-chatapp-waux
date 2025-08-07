"use client"

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendMessage, subscribeToPath, unsubscribeFromPath } from '@/store/slices/databaseSlice';

interface Message {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
}

export function useChat(channelId?: string) {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.database);

  // Get messages for the current channel
  const messagesPath = channelId ? `messages/${channelId}` : null;
  const messagesData = messagesPath ? data[messagesPath] : null;

  // Convert messages object to sorted array
  const messages = useMemo(() => {
    if (!messagesData) return [];
    
    const messageList: Message[] = Object.values(messagesData).map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp || Date.now(),
    }));
    
    // Sort by timestamp (oldest first)
    return messageList.sort((a, b) => a.timestamp - b.timestamp);
  }, [messagesData]);

  // Subscribe to messages when channel changes
  useEffect(() => {
    if (!channelId) return;

    const path = `messages/${channelId}`;
    dispatch(subscribeToPath({ path }));

    return () => {
      dispatch(unsubscribeFromPath({ path }));
    };
  }, [channelId, dispatch]);

  // Send message function
  const handleSendMessage = useCallback(
    async (content: string, userId: string, userName: string, userAvatar?: string) => {
      if (!channelId || !content.trim()) return;

      try {
        await dispatch(sendMessage({
          channelId,
          userId,
          userName,
          userAvatar,
          content: content.trim(),
        })).unwrap();
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [dispatch, channelId]
  );

  const isLoading = loading[messagesPath || ''] || false;
  const chatError = error[messagesPath || ''] || null;

  return {
    messages,
    loading: isLoading,
    error: chatError,
    sendMessage: handleSendMessage,
  };
}
