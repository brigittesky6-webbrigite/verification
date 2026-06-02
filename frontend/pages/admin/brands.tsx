import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function BrandManagement() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [brands, setBrands] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    productType: 'TICKET_PAIEMENT',
    description: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/signin');
      return;
    }

    loadBrands();
  }, [isAuthenticated, router, user]);

  const loadBrands = async () => {
    try {
      const response = await api.getAllBrands();
      setBrands(response.data);
    } catch (error) {
      toast.error('Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.createBrand(formData);
      toast.success('Brand created successfully');
      setFormData({
        name: '',
        productType: 'TICKET_PAIEMENT',
        description: '',
        logoUrl: '',
      });
      setShowForm(false);
      loadBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create brand');
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      await api.deleteBrand(brandId);
      toast.success('Brand deleted');
      loadBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete brand');
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Brand Management</h1>
          <Link href="/admin/dashboard" className="btn-secondary px-4 py-2">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Brands</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary px-4 py-2"
          >
            {showForm ? '✕ Cancel' : '+ Add Brand'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Brand Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Netflix"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Product Type</label>
                  <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="TICKET_PAIEMENT">Payment Ticket</option>
                    <option value="CARTE_CADEAU">Gift Card</option>
                    <option value="CARTE_BANCAIRE">Prepaid Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <button type="submit" className="btn-primary w-full py-2">
                Create Brand
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">No brands yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand: any) => (
              <div key={brand.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold">{brand.name}</h3>
                    <p className="text-xs text-gray-500">
                      {brand.productType.replace(/_/g, ' ')}
                    </p>
                    {brand.description && (
                      <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
