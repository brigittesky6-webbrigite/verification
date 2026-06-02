import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center px-4 max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">Validateur</h1>
        <p className="text-xl text-gray-700 mb-8">
          Plateforme sécurisée pour la validation de tickets et cartes prépayées
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-bold mb-2">Sécurité</h3>
            <p className="text-sm text-gray-600">
              Chiffrement des codes et authentification sécurisée
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold mb-2">Mobile First</h3>
            <p className="text-sm text-gray-600">
              Interface optimisée pour tous les appareils
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold mb-2">Rapide</h3>
            <p className="text-sm text-gray-600">
              PWA performante et réactive en ligne ou hors ligne
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <Link href="/signin" className="btn-primary px-8 py-3">
            Sign In
          </Link>
          <Link href="/signup" className="btn-secondary px-8 py-3">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
