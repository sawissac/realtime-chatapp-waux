import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconHash, IconUsers } from '@tabler/icons-react';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  createdAt: number;
  createdBy: string;
  members: Record<string, boolean>;
}

interface JoinChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (channelId: string) => void;
  onSearch: (query: string) => Promise<Channel[]>;
  loading?: boolean;
}

const JoinChannelDialog: React.FC<JoinChannelDialogProps> = ({
  isOpen,
  onClose,
  onJoin,
  onSearch,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedChannel(null);
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await onSearch(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleJoinChannel = () => {
    if (selectedChannel) {
      onJoin(selectedChannel);
      onClose();
    }
  };

  const getMemberCount = (members: Record<string, boolean>) => {
    return Object.keys(members || {}).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Join Channel</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Search for channels..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              disabled={loading}
              className="bg-white border-gray-300 text-black placeholder-gray-500"
            />
          </div>
          
          {/* Search Results */}
          <div className="max-h-64 min-h-[100px]">
            <ScrollArea className="h-full">
              {searching ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  Searching...
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  No channels found
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  Enter a channel name to search
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((channel) => (
                    <div
                      key={channel.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedChannel === channel.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedChannel(channel.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconHash size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {channel.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <IconUsers size={14} />
                          <span>{getMemberCount(channel.members)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleJoinChannel}
            disabled={!selectedChannel || loading}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {loading ? 'Joining...' : 'Join Channel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinChannelDialog;
