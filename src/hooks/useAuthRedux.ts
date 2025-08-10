"use client"

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  signupWithEmailAndPassword,
  signinWithEmailAndPassword,
  initializeAuthListener,
  logoutUser,
  clearError,
} from '@/store/slices/userSlice';
import { APP_ROUTES } from '@/routes';
import { usePathname } from 'next/navigation';

export function useAuthRedux() {
  const router = useRouter();
  const path = usePathname();
  const dispatch = useAppDispatch();
  
  const { user, authUser, loading, error } = useAppSelector((state) => state.user);

  const signup = useCallback(
    (email: string, password: string) => {
      dispatch(signupWithEmailAndPassword({ email, password }));
    },
    [dispatch]
  );

  const signin = useCallback(
    (email: string, password: string) => {
      dispatch(signinWithEmailAndPassword({ email, password }));
    },
    [dispatch]
  );

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const initializeAuth = useCallback(() => {
    dispatch(initializeAuthListener());
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  // Observer effect to redirect when user is not authenticated
  useEffect(() => {

    if(path === APP_ROUTES.SIGNUP && !authUser) {
      return;
    }

    if (!loading && !authUser) {
      router.push(APP_ROUTES.SIGNIN);
    }


  }, [authUser, loading, router]);

  return {
    user,
    authUser,
    loading,
    error,
    signup,
    signin,
    logout,
    clearAuthError,
    initializeAuth,
  };
}
