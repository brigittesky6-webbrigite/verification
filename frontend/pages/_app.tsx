import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const loadAuth = useAuthStore((state) => state.loadAuth);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
