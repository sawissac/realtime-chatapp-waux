"use client";

import { useEffect, ReactNode } from "react";
import { useAuthRedux } from "@/hooks/useAuthRedux";

interface AuthInitializerProps {
  children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { initializeAuth } = useAuthRedux();

  useEffect(() => initializeAuth(), [initializeAuth]);

  return <>{children}</>;
}
