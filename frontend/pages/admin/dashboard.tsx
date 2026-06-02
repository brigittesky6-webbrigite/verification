import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/signin');
      return;
    }

    loadRequests();
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    let filtered = requests;
    if (statusFilter) {
      filtered = requests.filter((r: any) => r.status === statusFilter);
    }
    setFilteredRequests(filtered);
  }, [requests, statusFilter]);

  const loadRequests = async () => {
    try {
      const response = await api.getAllRequests();
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async (requestId: string) => {
    try {
      await api.validateRequest(requestId);
      toast.success('Request validated');
      loadRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to validate');
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await api.rejectRequest(requestId, { rejectionReason: reason });
      toast.success('Request rejected');
      loadRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE':
        return 'bg-yellow-50 border-yellow-200';
      case 'VALIDEE':
        return 'bg-green-50 border-green-200';
      case 'REFUSEE':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container py-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage validation requests</p>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-3xl font-bold">{requests.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {requests.filter((r: any) => r.status === 'EN_ATTENTE').length}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Validated</p>
            <p className="text-3xl font-bold text-green-600">
              {requests.filter((r: any) => r.status === 'VALIDEE').length}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-3xl font-bold text-red-600">
              {requests.filter((r: any) => r.status === 'REFUSEE').length}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Requests</option>
            <option value="EN_ATTENTE">Pending</option>
            <option value="VALIDEE">Validated</option>
            <option value="REFUSEE">Rejected</option>
          </select>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">No requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request: any) => (
              <div
                key={request.id}
                className={`card border-2 ${getStatusColor(request.status)}`}
              >
                <div
                  onClick={() =>
                    setExpandedId(expandedId === request.id ? null : request.id)
                  }
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{request.brand.name}</h3>
                      <p className="text-sm text-gray-600">
                        From: {request.user.username} ({request.user.email})
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.submissionDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className={`badge ${
                        request.status === 'EN_ATTENTE'
                          ? 'badge-pending'
                          : request.status === 'VALIDEE'
                          ? 'badge-validated'
                          : 'badge-rejected'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Actions */}
                {expandedId === request.id && request.status === 'EN_ATTENTE' && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <button
                      onClick={() => handleValidate(request.id)}
                      className="btn-primary w-full"
                    >
                      ✓ Validate
                    </button>
                    <input
                      type="text"
                      placeholder="Rejection reason..."
                      id={`reason-${request.id}`}
                      className="input-field"
                    />
                    <button
                      onClick={() => {
                        const reason = (
                          document.getElementById(`reason-${request.id}`) as HTMLInputElement
                        )?.value;
                        handleReject(request.id, reason);
                      }}
                      className="btn-danger w-full"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}

                {/* Display Reason */}
                {request.rejectionReason && (
                  <div className="mt-4 pt-4 border-t p-3 bg-red-50 rounded">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {request.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
