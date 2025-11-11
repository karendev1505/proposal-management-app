'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: !!Cookies.get('accessToken'),
    retry: false,
  });

  useEffect(() => {
    if (profileError) {
      console.log('Profile error:', profileError);
    }
  }, [profileError]);

  useEffect(() => {
    if (profileData?.user) {
      setUser(profileData.user);
    }
    setIsLoading(profileLoading);
  }, [profileData, profileLoading]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      Cookies.set('accessToken', data.accessToken, { expires: 7 });
      Cookies.set('refreshToken', data.refreshToken, { expires: 30 });
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      authApi.register(name, email, password),
    onSuccess: (data) => {
      Cookies.set('accessToken', data.accessToken, { expires: 7 });
      Cookies.set('refreshToken', data.refreshToken, { expires: 30 });
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
      queryClient.clear();
      router.push('/login');
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      Cookies.set('accessToken', data.accessToken, { expires: 7 });
      Cookies.set('refreshToken', data.refreshToken, { expires: 30 });
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (name: string, email: string, password: string) => {
    await registerMutation.mutateAsync({ name, email, password });
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const refreshToken = async () => {
    const refreshTokenValue = Cookies.get('refreshToken');
    if (refreshTokenValue) {
      await refreshTokenMutation.mutateAsync(refreshTokenValue);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
