"use client";

import React, { useState, useEffect } from "react";
import ChannelMenu from "@/components/ChannelMenu";
import ChatInterface from "@/components/ChatInterface";
import { useChannels } from "@/hooks/useChannels";
import { useAuthRedux } from "@/hooks/useAuthRedux";

export default function ChatPage() {
  const { authUser } = useAuthRedux();
  const { channels, loading: channelsLoading } = useChannels(authUser?.uid);
  
  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>(undefined);

  // Auto-select first channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  // Get selected channel data from database
  const selectedChannel = channels.find(channel => channel.id === selectedChannelId);
  const selectedChannelName = selectedChannel?.name || 'general';

  // Show loading state while channels are loading
  if (channelsLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChannelMenu 
        selectedChannelId={selectedChannelId}
        onChannelSelect={handleChannelSelect}
      />
      <ChatInterface 
        channelId={selectedChannelId}
        channelName={selectedChannelName}
      />
    </div>
  );
}
