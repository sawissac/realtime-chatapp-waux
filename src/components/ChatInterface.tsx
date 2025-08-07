import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  IconSend, 
  IconPaperclip, 
  IconMoodSmile,
  IconHash,
  IconUsers,
  IconPin
} from '@tabler/icons-react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useChat } from '@/hooks/useChat';
import { useChannels } from '@/hooks/useChannels';
import { useUserPresence } from '@/hooks/useUserPresence';
import UserListSidebar from './UserListSidebar';



interface ChatInterfaceProps {
  channelId?: string;
  channelName?: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ channelId, channelName = 'general', onMobileMenuToggle, isMobileMenuOpen }) => {
  const { authUser } = useAuthRedux();
  const [message, setMessage] = useState('');
  const [userListOpen, setUserListOpen] = useState(false);
  
  // Hooks for chat functionality
  const { messages, loading: messagesLoading, sendMessage } = useChat(channelId);
  const { channels } = useChannels(authUser?.uid);
  const { isUserOnline, getUserDisplayName, presenceData } = useUserPresence(authUser?.uid);

  // Get current channel data
  const currentChannel = channels.find(ch => ch.id === channelId);
  const channelMembers = currentChannel?.members ? Object.keys(currentChannel.members) : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !authUser) return;

    try {
      await sendMessage(
        message,
        authUser.uid,
        authUser.displayName || authUser.email?.split('@')[0] || 'User',
        authUser.photoURL || undefined
      );
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex h-full bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-2"
                onClick={onMobileMenuToggle}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              
              <IconHash size={20} className="text-gray-500" />
              <h1 className="text-lg font-semibold text-gray-900 truncate">{channelName}</h1>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <p className="text-sm text-gray-500 hidden sm:block">
                {channelMembers.length} member{channelMembers.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`text-gray-500 hover:text-gray-700 transition-colors duration-200 ${
                  userListOpen ? 'bg-gray-100' : ''
                }`}
                onClick={() => setUserListOpen(!userListOpen)}
              >
                <IconUsers size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" id="messages-container">
            <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500 animate-fade-in">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500 animate-bounce-in">
                  <div className="text-center">
                    <IconHash size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Welcome to #{channelName}</p>
                    <p className="text-sm text-gray-500 px-4">This is the beginning of the #{channelName} channel.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isCurrentUser = msg.userId === authUser?.uid;
                  return (
                    <div 
                      key={msg.id} 
                      className="flex space-x-2 sm:space-x-3 group hover:bg-gray-50 px-1 sm:px-2 py-1 rounded transition-colors duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mt-1 transition-transform duration-200 hover:scale-105">
                          <AvatarImage src={msg.userAvatar} />
                          <AvatarFallback className="bg-blue-500 text-white text-sm">
                            {msg.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online status indicator */}
                        <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white transition-colors duration-200 ${
                          isUserOnline(msg.userId) ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-1 sm:space-x-2 flex-wrap">
                          <span className={`font-medium text-sm sm:text-base transition-colors duration-200 ${
                            isCurrentUser ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {msg.userName}
                            {isCurrentUser && <span className="text-blue-500 ml-1">(You)</span>}
                          </span>
                          <span className="text-xs text-gray-500 hidden sm:inline">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-gray-700 mt-1 break-words text-sm sm:text-base leading-relaxed">{msg.content}</p>
                        <span className="text-xs text-gray-400 sm:hidden mt-1 block">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="p-2 sm:p-4 border-t border-gray-200 bg-white animate-slide-up">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Message #${channelName}`}
                  className="pr-4 min-h-[40px] sm:min-h-[44px] text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!authUser}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || !authUser}
              className="h-10 sm:h-11 px-3 sm:px-4 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
            >
              <IconSend size={14} className="sm:w-4 sm:h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* User List Sidebar */}
      <UserListSidebar
        channelId={channelId}
        isOpen={userListOpen}
        onClose={() => setUserListOpen(false)}
        channelMembers={channelMembers}
        isUserOnline={isUserOnline}
        getUserDisplayName={getUserDisplayName}
        presenceData={presenceData}
      />
    </div>
  );
};

export default ChatInterface;
