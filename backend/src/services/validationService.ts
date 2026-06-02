import prisma from '../db/prisma';
import EncryptionService from '../utils/encryption';
import EmailService from './emailService';
import AuditService from './auditService';
import logger from '../middleware/logger';

export interface SubmitValidationData {
  code: string;
  brandId: string;
  productType: 'TICKET_PAIEMENT' | 'CARTE_CADEAU' | 'CARTE_BANCAIRE';
  userId: string;
}

export interface ValidateRequestData {
  requestId: string;
  adminId: string;
  comments?: string;
}

export interface RejectRequestData {
  requestId: string;
  adminId: string;
  rejectionReason: string;
}

export class ValidationService {
  static async submitValidation(data: SubmitValidationData) {
    // Check if code has already been submitted
    const codeHash = EncryptionService.hashCode(data.code);
    const existingRequest = await prisma.validationRequest.findUnique({
      where: { codeHash },
    });

    if (existingRequest) {
      throw new Error('This code has already been submitted');
    }

    // Encrypt the code
    const encryptedCode = EncryptionService.encrypt(data.code);

    // Get brand info
    const brand = await prisma.brand.findUnique({
      where: { id: data.brandId },
    });

    if (!brand) {
      throw new Error('Brand not found');
    }

    // Create validation request
    const request = await prisma.validationRequest.create({
      data: {
        code: encryptedCode,
        codeHash,
        userId: data.userId,
        brandId: data.brandId,
        productType: data.productType,
        status: 'EN_ATTENTE',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours for reminder
      },
      include: {
        user: {
          select: { email: true, username: true },
        },
        brand: true,
      },
    });

    // Audit log
    await AuditService.log({
      action: 'CREATE',
      entityType: 'VALIDATION_REQUEST',
      entityId: request.id,
      userId: data.userId,
      changes: JSON.stringify({ status: 'EN_ATTENTE', brand: brand.name }),
    });

    logger.info('Validation request created', {
      requestId: request.id,
      userId: data.userId,
      brand: brand.name,
    });

    return {
      id: request.id,
      status: request.status,
      submissionDate: request.submissionDate,
      brand: request.brand.name,
    };
  }

  static async validateRequest(data: ValidateRequestData) {
    const request = await prisma.validationRequest.findUnique({
      where: { id: data.requestId },
      include: {
        user: {
          select: { email: true, username: true },
        },
        brand: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'EN_ATTENTE') {
      throw new Error(`Cannot validate a request with status: ${request.status}`);
    }

    // Update request
    const updatedRequest = await prisma.validationRequest.update({
      where: { id: data.requestId },
      data: {
        status: 'VALIDEE',
        validationDate: new Date(),
        comments: data.comments,
      },
    });

    // Send email to user
    await EmailService.sendStatusChangeEmail(
      request.user.email,
      request.user.username,
      'VALIDEE',
      request.brand.name,
    );

    // Audit log
    await AuditService.log({
      action: 'UPDATE',
      entityType: 'VALIDATION_REQUEST',
      entityId: data.requestId,
      userId: data.adminId,
      changes: JSON.stringify({ 
        status: 'EN_ATTENTE → VALIDEE',
        validatedBy: data.adminId 
      }),
    });

    logger.info('Request validated', {
      requestId: data.requestId,
      adminId: data.adminId,
      userId: request.userId,
    });

    return updatedRequest;
  }

  static async rejectRequest(data: RejectRequestData) {
    const request = await prisma.validationRequest.findUnique({
      where: { id: data.requestId },
      include: {
        user: {
          select: { email: true, username: true },
        },
        brand: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'EN_ATTENTE') {
      throw new Error(`Cannot reject a request with status: ${request.status}`);
    }

    // Update request
    const updatedRequest = await prisma.validationRequest.update({
      where: { id: data.requestId },
      data: {
        status: 'REFUSEE',
        validationDate: new Date(),
        rejectionReason: data.rejectionReason,
      },
    });

    // Send email to user
    await EmailService.sendStatusChangeEmail(
      request.user.email,
      request.user.username,
      'REFUSEE',
      request.brand.name,
      data.rejectionReason,
    );

    // Audit log
    await AuditService.log({
      action: 'UPDATE',
      entityType: 'VALIDATION_REQUEST',
      entityId: data.requestId,
      userId: data.adminId,
      changes: JSON.stringify({ 
        status: 'EN_ATTENTE → REFUSEE',
        reason: data.rejectionReason,
        rejectedBy: data.adminId 
      }),
    });

    logger.info('Request rejected', {
      requestId: data.requestId,
      adminId: data.adminId,
      userId: request.userId,
    });

    return updatedRequest;
  }

  static async getRequestsByUserId(userId: string) {
    const requests = await prisma.validationRequest.findMany({
      where: { userId },
      include: {
        brand: {
          select: { name: true, logoUrl: true },
        },
      },
      orderBy: { submissionDate: 'desc' },
    });

    return requests.map(r => ({
      id: r.id,
      status: r.status,
      brand: r.brand.name,
      brandLogo: r.brand.logoUrl,
      submissionDate: r.submissionDate,
      validationDate: r.validationDate,
      rejectionReason: r.rejectionReason,
    }));
  }

  static async getAllRequests(
    status?: string,
    brandId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {};
    
    if (status) where.status = status;
    if (brandId) where.brandId = brandId;
    if (startDate || endDate) {
      where.submissionDate = {};
      if (startDate) where.submissionDate.gte = startDate;
      if (endDate) where.submissionDate.lte = endDate;
    }

    const requests = await prisma.validationRequest.findMany({
      where,
      include: {
        user: {
          select: { email: true, username: true },
        },
        brand: {
          select: { name: true, productType: true },
        },
      },
      orderBy: { submissionDate: 'desc' },
    });

    return requests;
  }

  static async getPendingRequests() {
    return prisma.validationRequest.findMany({
      where: { status: 'EN_ATTENTE' },
      include: {
        user: true,
        brand: true,
      },
    });
  }
}

export default ValidationService;
