import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ref, set, onValue, off, DatabaseReference, get, push } from 'firebase/database';
import { database } from '@/lib/firebase';

// Types
interface DatabaseState {
  data: Record<string, any>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  listeners: Record<string, DatabaseReference>;
}

interface WriteDataPayload {
  path: string;
  value: any;
}

interface SubscribePayload {
  path: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  createdAt: number;
  createdBy: string;
  members: Record<string, boolean>;
}

interface CheckUserChannelsPayload {
  userId: string;
}

interface CreateChannelPayload {
  userId: string;
  name: string;
  type?: 'text' | 'voice';
}

interface UpdateChannelPayload {
  channelId: string;
  name: string;
  userId: string;
}

interface DeleteChannelPayload {
  channelId: string;
  userId: string;
}

interface JoinChannelPayload {
  channelId: string;
  userId: string;
}

interface SearchChannelsPayload {
  query: string;
  userId: string;
}

interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: number;
  displayName?: string;
  email?: string;
}

interface Message {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
}

interface SendMessagePayload {
  channelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
}

// Initial state
const initialState: DatabaseState = {
  data: {},
  loading: {},
  error: {},
  listeners: {},
};

// Async thunks
export const writeData = createAsyncThunk(
  'database/writeData',
  async ({ path, value }: WriteDataPayload, { rejectWithValue }) => {
    try {
      await set(ref(database, path), value);
      return { path, value };
    } catch (error) {
      console.error('Write failed: ', error);
      return rejectWithValue({
        path,
        error: error instanceof Error ? error.message : 'Write failed'
      });
    }
  }
);

export const subscribeToPath = createAsyncThunk(
  'database/subscribeToPath',
  async ({ path }: SubscribePayload, { dispatch, getState, rejectWithValue }) => {
    try {
      const dbRef = ref(database, path);
      
      // Set loading state
      dispatch(setLoading({ path, loading: true }));
      
      // Create listener
      const unsubscribe = onValue(
        dbRef,
        (snapshot) => {
          const data = snapshot.val();
          dispatch(setData({ path, data }));
          dispatch(setLoading({ path, loading: false }));
          dispatch(clearError({ path }));
        },
        (error) => {
          console.error('Database read failed: ', error);
          dispatch(setError({ 
            path, 
            error: error instanceof Error ? error.message : 'Database read failed' 
          }));
          dispatch(setLoading({ path, loading: false }));
        }
      );

      // Store the reference for cleanup
      dispatch(setListener({ path, ref: dbRef }));
      
      return { path, ref: dbRef };
    } catch (error) {
      return rejectWithValue({
        path,
        error: error instanceof Error ? error.message : 'Subscription failed'
      });
    }
  }
);

export const unsubscribeFromPath = createAsyncThunk(
  'database/unsubscribeFromPath',
  async ({ path }: SubscribePayload, { getState, dispatch }) => {
    const state = getState() as { database: DatabaseState };
    const dbRef = state.database.listeners[path];
    
    if (dbRef) {
      off(dbRef);
      dispatch(removeListener({ path }));
      dispatch(clearData({ path }));
      dispatch(setLoading({ path, loading: false }));
    }
    
    return { path };
  }
);

export const checkUserChannels = createAsyncThunk(
  'database/checkUserChannels',
  async ({ userId }: CheckUserChannelsPayload, { dispatch, rejectWithValue }) => {
    try {
      // Check if user has any channels
      const userChannelsRef = ref(database, `userChannels/${userId}`);
      const snapshot = await get(userChannelsRef);
      
      if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
        // User has no channels, create a default one
        const defaultChannel = await dispatch(createDefaultChannel({ userId })).unwrap();
        return { hasChannels: false, defaultChannel };
      }
      
      // User has channels, subscribe to them
      dispatch(subscribeToPath({ path: `userChannels/${userId}` }));
      return { hasChannels: true, channels: snapshot.val() };
    } catch (error) {
      console.error('Error checking user channels:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to check user channels');
    }
  }
);

export const createDefaultChannel = createAsyncThunk(
  'database/createDefaultChannel',
  async ({ userId }: CheckUserChannelsPayload, { dispatch, rejectWithValue }) => {
    try {
      // Create a new channel in the channels collection
      const channelsRef = ref(database, 'channels');
      const newChannelRef = push(channelsRef);
      const channelId = newChannelRef.key;
      
      if (!channelId) {
        throw new Error('Failed to generate channel ID');
      }
      
      const defaultChannel: Channel = {
        id: channelId,
        name: 'general',
        type: 'text',
        createdAt: Date.now(),
        createdBy: userId,
        members: {
          [userId]: true
        }
      };
      
      // Write the channel data
      await set(newChannelRef, defaultChannel);
      
      // Add the channel to user's channel list
      await set(ref(database, `userChannels/${userId}/${channelId}`), true);
      
      // Subscribe to user's channels
      dispatch(subscribeToPath({ path: `userChannels/${userId}` }));
      
      return defaultChannel;
    } catch (error) {
      console.error('Error creating default channel:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create default channel');
    }
  }
);

export const createChannel = createAsyncThunk(
  'database/createChannel',
  async ({ userId, name, type = 'text' }: CreateChannelPayload, { dispatch, rejectWithValue }) => {
    try {
      // Create a new channel in the channels collection
      const channelsRef = ref(database, 'channels');
      const newChannelRef = push(channelsRef);
      const channelId = newChannelRef.key;
      
      if (!channelId) {
        throw new Error('Failed to generate channel ID');
      }
      
      const newChannel: Channel = {
        id: channelId,
        name: name.trim(),
        type,
        createdAt: Date.now(),
        createdBy: userId,
        members: {
          [userId]: true
        }
      };
      
      // Write the channel data
      await set(newChannelRef, newChannel);
      
      // Add the channel to user's channel list
      await set(ref(database, `userChannels/${userId}/${channelId}`), true);
      
      return newChannel;
    } catch (error) {
      console.error('Error creating channel:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create channel');
    }
  }
);

export const updateChannel = createAsyncThunk(
  'database/updateChannel',
  async ({ channelId, name, userId }: UpdateChannelPayload, { rejectWithValue }) => {
    try {
      // Update the channel name
      await set(ref(database, `channels/${channelId}/name`), name.trim());
      
      return { channelId, name: name.trim() };
    } catch (error) {
      console.error('Error updating channel:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update channel');
    }
  }
);

export const deleteChannel = createAsyncThunk(
  'database/deleteChannel',
  async ({ channelId, userId }: DeleteChannelPayload, { rejectWithValue }) => {
    try {
      // Remove the channel from channels collection
      await set(ref(database, `channels/${channelId}`), null);
      
      // Remove the channel from user's channel list
      await set(ref(database, `userChannels/${userId}/${channelId}`), null);
      
      // TODO: Remove channel from all members' channel lists
      // This would require getting all members first, then removing from each
      
      return { channelId };
    } catch (error) {
      console.error('Error deleting channel:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete channel');
    }
  }
);

export const joinChannel = createAsyncThunk(
  'database/joinChannel',
  async ({ channelId, userId }: JoinChannelPayload, { rejectWithValue }) => {
    try {
      // Check if channel exists
      const channelRef = ref(database, `channels/${channelId}`);
      const channelSnapshot = await get(channelRef);
      
      if (!channelSnapshot.exists()) {
        throw new Error('Channel not found');
      }
      
      // Add user to channel members
      await set(ref(database, `channels/${channelId}/members/${userId}`), true);
      
      // Add channel to user's channel list
      await set(ref(database, `userChannels/${userId}/${channelId}`), true);
      
      return { channelId, channel: channelSnapshot.val() };
    } catch (error) {
      console.error('Error joining channel:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to join channel');
    }
  }
);

export const searchPublicChannels = createAsyncThunk(
  'database/searchPublicChannels',
  async ({ query, userId }: SearchChannelsPayload, { rejectWithValue }) => {
    try {
      // Get all channels
      const channelsRef = ref(database, 'channels');
      const snapshot = await get(channelsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const allChannels = snapshot.val();
      const searchResults: Channel[] = [];
      
      Object.entries(allChannels).forEach(([channelId, channelData]: [string, any]) => {
        // Filter channels that match the query and user is not already a member
        if (
          channelData.name.toLowerCase().includes(query.toLowerCase()) &&
          !channelData.members?.[userId]
        ) {
          searchResults.push({
            ...channelData,
            id: channelId,
          });
        }
      });
      
      return searchResults;
    } catch (error) {
      console.error('Error searching channels:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search channels');
    }
  }
);

export const updateUserPresence = createAsyncThunk(
  'database/updateUserPresence',
  async ({ userId, isOnline, displayName, email }: UserPresence, { rejectWithValue }) => {
    try {
      const presenceData: any = {
        isOnline,
        lastSeen: Date.now(),
      };
      
      // Only include displayName and email if they have values
      if (displayName) {
        presenceData.displayName = displayName;
      }
      if (email) {
        presenceData.email = email;
      }
      
      await set(ref(database, `presence/${userId}`), presenceData);
      
      return { userId, ...presenceData };
    } catch (error) {
      console.error('Error updating user presence:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update presence');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'database/sendMessage',
  async ({ channelId, userId, userName, userAvatar, content }: SendMessagePayload, { rejectWithValue }) => {
    try {
      const messagesRef = ref(database, `messages/${channelId}`);
      const newMessageRef = push(messagesRef);
      const messageId = newMessageRef.key;
      
      if (!messageId) {
        throw new Error('Failed to generate message ID');
      }
      
      const message: Message = {
        id: messageId,
        channelId,
        userId,
        userName,
        content: content.trim(),
        timestamp: Date.now(),
      };
      
      // Only include userAvatar if it has a value
      if (userAvatar) {
        message.userAvatar = userAvatar;
      }
      
      await set(newMessageRef, message);
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send message');
    }
  }
);

// Database slice
const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<{ path: string; data: any }>) => {
      const { path, data } = action.payload;
      state.data[path] = data;
    },
    setLoading: (state, action: PayloadAction<{ path: string; loading: boolean }>) => {
      const { path, loading } = action.payload;
      state.loading[path] = loading;
    },
    setError: (state, action: PayloadAction<{ path: string; error: string }>) => {
      const { path, error } = action.payload;
      state.error[path] = error;
    },
    clearError: (state, action: PayloadAction<{ path: string }>) => {
      const { path } = action.payload;
      state.error[path] = null;
    },
    clearData: (state, action: PayloadAction<{ path: string }>) => {
      const { path } = action.payload;
      delete state.data[path];
      delete state.loading[path];
      delete state.error[path];
    },
    setListener: (state, action: PayloadAction<{ path: string; ref: DatabaseReference }>) => {
      const { path, ref } = action.payload;
      state.listeners[path] = ref;
    },
    removeListener: (state, action: PayloadAction<{ path: string }>) => {
      const { path } = action.payload;
      delete state.listeners[path];
    },
  },
  extraReducers: (builder) => {
    builder
      // Write data
      .addCase(writeData.pending, (state, action) => {
        const { path } = action.meta.arg;
        state.loading[path] = true;
        state.error[path] = null;
      })
      .addCase(writeData.fulfilled, (state, action) => {
        const { path } = action.payload;
        state.loading[path] = false;
      })
      .addCase(writeData.rejected, (state, action) => {
        const payload = action.payload as { path: string; error: string };
        state.loading[payload.path] = false;
        state.error[payload.path] = payload.error;
      })
      // Subscribe to path
      .addCase(subscribeToPath.pending, (state, action) => {
        const { path } = action.meta.arg;
        state.loading[path] = true;
        state.error[path] = null;
      })
      .addCase(subscribeToPath.fulfilled, (state, action) => {
        // Loading state is handled in the onValue callback
      })
      .addCase(subscribeToPath.rejected, (state, action) => {
        const payload = action.payload as { path: string; error: string };
        state.loading[payload.path] = false;
        state.error[payload.path] = payload.error;
      })
      // Unsubscribe from path
      .addCase(unsubscribeFromPath.fulfilled, (state, action) => {
        // Cleanup is handled in the thunk
      });
  },
});

// Export actions
export const {
  setData,
  setLoading,
  setError,
  clearError,
  clearData,
  setListener,
  removeListener,
} = databaseSlice.actions;

// Export reducer
export default databaseSlice.reducer;
