import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function SignIn() {
  const router = useRouter();
  const { signin, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signin({ email, password });
      toast.success('Connected successfully');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2">Validateur</h1>
          <p className="text-center text-gray-600 mb-8">
            Plateforme de validation de tickets et cartes
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2 mt-6"
            >
              {isLoading ? 'Connecting...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up here
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>User: user@example.com / user123!</p>
            <p>Admin: admin@validateur.com / admin123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
