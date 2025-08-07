import { auth } from "@/lib/firebase";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  User,
} from "firebase/auth";

export const signupWithEmailAndPassword = createAsyncThunk(
  "user/signupWithEmailAndPassword",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } catch (error: any) {
      return rejectWithValue(`${error.code}: ${error.message}`);
    }
  }
);

export const signinWithEmailAndPassword = createAsyncThunk(
  "user/signinWithEmailAndPassword",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } catch (error: any) {
      return rejectWithValue(`${error.code}: ${error.message}`);
    }
  }
);

export const initializeAuthListener = createAsyncThunk(
  "user/initializeAuthListener",
  async (_, { dispatch }) => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          dispatch(setAuthUser(user));
          // Check and create channels for the user
          try {
            const { checkUserChannels } = await import('./databaseSlice');
            await dispatch(checkUserChannels({ userId: user.uid }));
          } catch (error) {
            console.error('Error checking user channels:', error);
          }
        } else {
          dispatch(clearUser());
        }
        dispatch(setLoading(false));
        resolve();
      });

      // Return unsubscribe function for cleanup
      return unsubscribe;
    });
  }
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return true;
    } catch (error: any) {
      return rejectWithValue(`${error.code}: ${error.message}`);
    }
  }
);

interface UserState {
  user: UserCredential | null;
  authUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  authUser: null,
  loading: true,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserCredential | null>) => {
      state.user = action.payload;
    },
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.authUser = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.authUser = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup cases
      .addCase(signupWithEmailAndPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupWithEmailAndPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signupWithEmailAndPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Signin cases
      .addCase(signinWithEmailAndPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signinWithEmailAndPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signinWithEmailAndPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Auth listener cases
      .addCase(initializeAuthListener.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuthListener.fulfilled, (state) => {
        state.loading = false;
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.authUser = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  setAuthUser,
  clearUser,
  setLoading,
  setError,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
