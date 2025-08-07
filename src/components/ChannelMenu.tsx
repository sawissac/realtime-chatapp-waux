import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  IconHash, 
  IconPlus, 
  IconSettings, 
  IconLogout,
  IconUsers,
  IconBell,
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch
} from '@tabler/icons-react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useChannels } from '@/hooks/useChannels';
import { useChannelOperations } from '@/hooks/useChannelOperations';
import { useUserPresence } from '@/hooks/useUserPresence';
import ChannelDialog from './ChannelDialog';
import JoinChannelDialog from './JoinChannelDialog';



interface ChannelMenuProps {
  selectedChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  onMobileMenuClose?: () => void;
}

const ChannelMenu: React.FC<ChannelMenuProps> = ({ selectedChannelId, onChannelSelect, onMobileMenuClose }) => {
  const { authUser, logout } = useAuthRedux();
  const { channels, loading: channelsLoading } = useChannels(authUser?.uid);
  const { createChannel, updateChannel, deleteChannel, joinChannel, searchChannels } = useChannelOperations();
  const { isUserOnline, updatePresence } = useUserPresence(authUser?.uid);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<{ id: string; name: string } | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [contextMenuChannel, setContextMenuChannel] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateChannel = async (name: string) => {
    if (!authUser?.uid) return;
    
    setOperationLoading(true);
    try {
      await createChannel(authUser.uid, name);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditChannel = async (name: string) => {
    if (!authUser?.uid || !selectedChannel) return;
    
    setOperationLoading(true);
    try {
      await updateChannel(selectedChannel.id, name, authUser.uid);
      setEditDialogOpen(false);
      setSelectedChannel(null);
    } catch (error) {
      console.error('Failed to update channel:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!authUser?.uid || !selectedChannel) return;
    
    setOperationLoading(true);
    try {
      await deleteChannel(selectedChannel.id, authUser.uid);
      setDeleteDialogOpen(false);
      setSelectedChannel(null);
      // If the deleted channel was selected, clear selection
      if (selectedChannelId === selectedChannel.id) {
        const remainingChannels = channels.filter(c => c.id !== selectedChannel.id);
        if (remainingChannels.length > 0) {
          onChannelSelect(remainingChannels[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to delete channel:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const openEditDialog = (channel: { id: string; name: string }) => {
    setSelectedChannel(channel);
    setEditDialogOpen(true);
    setContextMenuChannel(null);
  };

  const openDeleteDialog = (channel: { id: string; name: string }) => {
    setSelectedChannel(channel);
    setDeleteDialogOpen(true);
    setContextMenuChannel(null);
  };

  const handleJoinChannel = async (channelId: string) => {
    if (!authUser?.uid) return;
    
    setOperationLoading(true);
    try {
      await joinChannel(channelId, authUser.uid);
      setJoinDialogOpen(false);
    } catch (error) {
      console.error('Failed to join channel:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSearchChannels = async (query: string) => {
    if (!authUser?.uid) return [];
    
    try {
      return await searchChannels(query, authUser.uid);
    } catch (error) {
      console.error('Failed to search channels:', error);
      return [];
    }
  };

  // Update user presence when auth user changes
  React.useEffect(() => {
    if (authUser) {
      updatePresence(true);
    }
  }, [authUser, updatePresence]);

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-semibold text-lg">Chat App</h2>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2">
            {/* Text Channels Header */}
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Text Channels
              </span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-gray-400 hover:text-white"
                  onClick={() => setJoinDialogOpen(true)}
                  title="Join Channel"
                >
                  <IconSearch size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-gray-400 hover:text-white"
                  onClick={() => setCreateDialogOpen(true)}
                  title="Create Channel"
                >
                  <IconPlus size={12} />
                </Button>
              </div>
            </div>

            {/* Channel List */}
            <div className="space-y-1">
              {channelsLoading ? (
                <div className="px-2 py-4 text-center text-gray-400 text-sm">
                  Loading channels...
                </div>
              ) : channels.length === 0 ? (
                <div className="px-2 py-4 text-center text-gray-400 text-sm">
                  No channels found
                </div>
              ) : (
                channels.map((channel) => (
                  <div key={channel.id} className="relative group">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start px-2 py-1 h-8 text-gray-300 hover:text-white hover:bg-gray-700 ${
                        selectedChannelId === channel.id ? 'bg-gray-700 text-white' : ''
                      }`}
                      onClick={() => onChannelSelect(channel.id)}
                    >
                      <IconHash size={16} className="mr-2 text-gray-400" />
                      <span className="flex-1 text-left">{channel.name}</span>
                    </Button>
                    
                    {/* Context Menu Button */}
                    <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuChannel(contextMenuChannel === channel.id ? null : channel.id);
                        }}
                      >
                        <IconDots size={12} />
                      </Button>
                    </div>
                    
                    {/* Context Menu */}
                    {contextMenuChannel === channel.id && (
                      <div className="absolute right-0 top-8 z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 min-w-[120px]">
                        <button
                          className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                          onClick={() => openEditDialog({ id: channel.id, name: channel.name })}
                        >
                          <IconEdit size={14} />
                          Edit
                        </button>
                        <button
                          className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-2"
                          onClick={() => openDeleteDialog({ id: channel.id, name: channel.name })}
                        >
                          <IconTrash size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* User Section */}
      <div className="p-3 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authUser?.photoURL || undefined} />
              <AvatarFallback className="bg-blue-500 text-white text-sm">
                {authUser?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {authUser?.displayName || authUser?.email?.split('@')[0] || 'User'}
              </p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  authUser?.uid && isUserOnline(authUser.uid) ? 'bg-green-400' : 'bg-gray-500'
                }`} />
                <p className="text-xs text-gray-400">
                  {authUser?.uid && isUserOnline(authUser.uid) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={handleSignOut}
            >
              <IconLogout size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      <ChannelDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={handleCreateChannel}
        title="Create Channel"
        confirmText="Create"
        loading={operationLoading}
      />
      
      <ChannelDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedChannel(null);
        }}
        onConfirm={handleEditChannel}
        title="Edit Channel"
        confirmText="Save"
        initialValue={selectedChannel?.name || ''}
        loading={operationLoading}
      />
      
      <JoinChannelDialog
        isOpen={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        onJoin={handleJoinChannel}
        onSearch={handleSearchChannels}
        loading={operationLoading}
      />
      
      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && selectedChannel && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Channel</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "#{selectedChannel.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedChannel(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={operationLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteChannel}
                disabled={operationLoading}
                className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500"
              >
                {operationLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelMenu;
