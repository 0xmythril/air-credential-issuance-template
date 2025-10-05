"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type AuthMethod = "wallet" | "airkit" | "spotify" | "twitter" | "discord" | "linkedin";

interface AuthMethodContextType {
  authMethod: AuthMethod;
  setAuthMethod: (method: AuthMethod) => void;
}

const AuthMethodContext = createContext<AuthMethodContextType | undefined>(undefined);

export function AuthMethodProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authMethod, setAuthMethod] = useState<AuthMethod>(() => {
    // Determine initial auth method from pathname
    return getAuthMethodFromPath(pathname);
  });

  useEffect(() => {
    // Update auth method when route changes
    const method = getAuthMethodFromPath(pathname);
    setAuthMethod(method);
  }, [pathname]);

  return (
    <AuthMethodContext.Provider value={{ authMethod, setAuthMethod }}>
      {children}
    </AuthMethodContext.Provider>
  );
}

export function useAuthMethod() {
  const context = useContext(AuthMethodContext);
  if (context === undefined) {
    throw new Error('useAuthMethod must be used within an AuthMethodProvider');
  }
  return context;
}

function getAuthMethodFromPath(pathname: string): AuthMethod {
  // Remove leading slash and get first path segment
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment === 'spotify') {
    return 'spotify';
  }
  if (firstSegment === 'twitter') {
    return 'twitter';
  }
  if (firstSegment === 'discord') {
    return 'discord';
  }
  if (firstSegment === 'linkedin') {
    return 'linkedin';
  }
  if (firstSegment === 'ethos' || firstSegment === 'wallet') {
    return 'wallet';
  }
  if (firstSegment === 'airkit') {
    return 'airkit';
  }
  
  // Default to wallet for root/home page
  return 'wallet';
}
