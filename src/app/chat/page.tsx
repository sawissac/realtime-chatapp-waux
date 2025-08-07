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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-select first channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    // Close mobile menu when channel is selected
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get selected channel data from database
  const selectedChannel = channels.find(channel => channel.id === selectedChannelId);
  const selectedChannelName = selectedChannel?.name || 'general';

  // Show loading state while channels are loading
  if (channelsLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Channel Menu - Mobile Responsive */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 lg:w-64
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ChannelMenu 
          selectedChannelId={selectedChannelId}
          onChannelSelect={handleChannelSelect}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
      
      {/* Chat Interface - Mobile Responsive */}
      <div className="flex-1 flex flex-col min-w-0 animate-slide-in-right">
        <ChatInterface 
          channelId={selectedChannelId}
          channelName={selectedChannelName}
          onMobileMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      </div>
    </div>
  );
}
