import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('auth_token')
        : null;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    });
  }

  // Auth
  async signup(data: any) {
    return this.client.post('/auth/signup', data);
  }

  async signin(data: any) {
    return this.client.post('/auth/signin', data);
  }

  async getProfile() {
    return this.client.get('/auth/profile');
  }

  async changePassword(data: any) {
    return this.client.post('/auth/change-password', data);
  }

  // Validation
  async submitValidation(data: any) {
    return this.client.post('/validation/submit', data);
  }

  async getUserRequests() {
    return this.client.get('/validation/my-requests');
  }

  async getAllRequests(filters?: any) {
    return this.client.get('/validation/all', { params: filters });
  }

  async validateRequest(requestId: string, data?: any) {
    return this.client.post(`/validation/${requestId}/validate`, data);
  }

  async rejectRequest(requestId: string, data: any) {
    return this.client.post(`/validation/${requestId}/reject`, data);
  }

  // Brands
  async getAllBrands() {
    return this.client.get('/brands');
  }

  async getBrandsByType(productType: string) {
    return this.client.get(`/brands/type/${productType}`);
  }

  async createBrand(data: any) {
    return this.client.post('/brands', data);
  }

  async updateBrand(brandId: string, data: any) {
    return this.client.patch(`/brands/${brandId}`, data);
  }

  async deleteBrand(brandId: string) {
    return this.client.delete(`/brands/${brandId}`);
  }
}

export default new APIClient();
