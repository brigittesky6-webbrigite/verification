export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  productType: 'TICKET_PAIEMENT' | 'CARTE_CADEAU' | 'CARTE_BANCAIRE';
  logoUrl?: string;
  description?: string;
}

export interface ValidationRequest {
  id: string;
  status: 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
  brand: string;
  brandLogo?: string;
  submissionDate: string;
  validationDate?: string;
  rejectionReason?: string;
}

export interface SignUpData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
