import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface UserListSidebarProps {
  channelId?: string;
  isOpen: boolean;
  onClose: () => void;
  channelMembers: string[];
  isUserOnline: (userId: string) => boolean;
  getUserDisplayName: (userId: string) => string;
  presenceData: Record<string, any>;
}

const UserListSidebar: React.FC<UserListSidebarProps> = ({
  channelId,
  isOpen,
  onClose,
  channelMembers,
  isUserOnline,
  getUserDisplayName,
  presenceData,
}) => {
  if (!isOpen) return null;

  // Separate online and offline users
  const onlineUsers = channelMembers.filter(userId => isUserOnline(userId));
  const offlineUsers = channelMembers.filter(userId => !isUserOnline(userId));

  const formatLastSeen = (timestamp: number) => {
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

  const UserItem: React.FC<{ userId: string; isOnline: boolean }> = ({ userId, isOnline }) => {
    const displayName = getUserDisplayName(userId);
    const userPresence = presenceData[userId];
    const email = userPresence?.email || '';

    return (
      <div className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md">
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userPresence?.avatar} />
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-400' : 'bg-gray-400'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </p>
          {!isOnline && userPresence?.lastSeen && (
            <p className="text-xs text-gray-500">
              Last seen {formatLastSeen(userPresence.lastSeen)}
            </p>
          )}
          {isOnline && (
            <p className="text-xs text-green-600">Online</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed md:relative inset-y-0 right-0 z-50 w-full md:w-64 bg-white border-l border-gray-200 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Members ({channelMembers.length})
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <IconX size={16} />
          </Button>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2">
            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                  Online — {onlineUsers.length}
                </h4>
                <div className="space-y-1">
                  {onlineUsers.map(userId => (
                    <UserItem key={userId} userId={userId} isOnline={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            {onlineUsers.length > 0 && offlineUsers.length > 0 && (
              <Separator className="my-4" />
            )}

            {/* Offline Users */}
            {offlineUsers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                  Offline — {offlineUsers.length}
                </h4>
                <div className="space-y-1">
                  {offlineUsers.map(userId => (
                    <UserItem key={userId} userId={userId} isOnline={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {channelMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No members in this channel</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      </div>
    </>
  );
};

export default UserListSidebar;
