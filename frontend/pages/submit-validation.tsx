import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SubmitValidation() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [productType, setProductType] = useState('TICKET_PAIEMENT');
  const [brandId, setBrandId] = useState('');
  const [code, setCode] = useState('');
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    loadBrands();
  }, [isAuthenticated, router, productType]);

  const loadBrands = async () => {
    try {
      const response = await api.getBrandsByType(productType);
      setBrands(response.data);
      setBrandId(response.data[0]?.id || '');
    } catch (error) {
      toast.error('Failed to load brands');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || code.length < 8) {
      toast.error('Code must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await api.submitValidation({
        code,
        brandId,
        productType,
      });

      toast.success('Validation request submitted successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Submit Validation Request</h1>
          <Link href="/dashboard" className="btn-secondary px-4 py-2">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="input-field"
                >
                  <option value="TICKET_PAIEMENT">Payment Tickets</option>
                  <option value="CARTE_CADEAU">Gift Cards</option>
                  <option value="CARTE_BANCAIRE">Prepaid Cards</option>
                </select>
              </div>

              {/* Brand Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a brand...</option>
                  {brands.map((brand: any) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field font-mono"
                  placeholder="Enter the code..."
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the unique code from your ticket or card
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !brandId}
                className="btn-primary w-full py-3 text-lg"
              >
                {isLoading ? 'Submitting...' : 'Submit for Validation'}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Select the product type and brand</li>
                <li>✓ Enter the unique code from your ticket or card</li>
                <li>✓ Submit and wait for validation</li>
                <li>✓ Receive email notification when processed</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
