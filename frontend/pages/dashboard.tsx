import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    loadRequests();
  }, [isAuthenticated, router]);

  const loadRequests = async () => {
    try {
      const response = await api.getUserRequests();
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE':
        return <span className="badge-pending">⏳ Pending</span>;
      case 'VALIDEE':
        return <span className="badge-validated">✓ Validated</span>;
      case 'REFUSEE':
        return <span className="badge-rejected">✗ Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.username}!</p>
          </div>
          <div className="space-x-3">
            <Link href="/submit-validation" className="btn-primary px-4 py-2">
              Submit Validation
            </Link>
            <button
              onClick={logout}
              className="btn-secondary px-4 py-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600">
              {requests.length}
            </div>
            <p className="text-gray-600">Total Requests</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">
              {requests.filter((r: any) => r.status === 'VALIDEE').length}
            </div>
            <p className="text-gray-600">Validated</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {requests.filter((r: any) => r.status === 'EN_ATTENTE').length}
            </div>
            <p className="text-gray-600">Pending</p>
          </div>
        </div>

        {/* Requests List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Validation Requests</h2>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600 mb-4">No validation requests yet</p>
              <Link href="/submit-validation" className="btn-primary px-4 py-2">
                Submit Your First Request
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <div key={request.id} className="card flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{request.brand}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(request.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
