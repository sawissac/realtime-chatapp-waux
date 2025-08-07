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

interface ChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  title: string;
  confirmText: string;
  initialValue?: string;
  loading?: boolean;
}

const ChannelDialog: React.FC<ChannelDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  initialValue = '',
  loading = false,
}) => {
  const [channelName, setChannelName] = useState(initialValue);

  useEffect(() => {
    setChannelName(initialValue);
  }, [initialValue, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelName.trim()) {
      onConfirm(channelName.trim());
    }
  };

  const handleClose = () => {
    setChannelName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Channel name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                disabled={loading}
                autoFocus
                className="bg-white border-gray-300 text-black placeholder-gray-500"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!channelName.trim() || loading}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {loading ? 'Loading...' : confirmText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelDialog;
