import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { loadAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadAuth();
  }, []);

  // Skip layout for auth pages
  if (router.pathname === '/signin' || router.pathname === '/signup' || router.pathname === '/') {
    return (
      <>
        {children}
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
