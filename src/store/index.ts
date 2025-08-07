import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import databaseReducer from "./slices/databaseSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    database: databaseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "user/setUser",
          "user/setAuthUser",
          "user/signupWithEmailAndPassword/fulfilled",
          "user/signinWithEmailAndPassword/fulfilled",
          "user/initializeAuthListener/fulfilled",
          "database/setListener",
          "database/writeData",
          "database/subscribeToPath/fulfilled",
          "database/writeData/fulfilled",
          "database/unsubscribeFromPath/fulfilled",
        ],
        ignoredPaths: ["user.user", "user.authUser", "database.listeners"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
