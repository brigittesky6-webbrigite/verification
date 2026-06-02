import { PrismaClient } from '@prisma/client';
import logger from '../middleware/logger';

const prisma = new PrismaClient();

export interface AuditLogData {
  action: string; // CREATE, UPDATE, DELETE, VALIDATE, REJECT
  entityType: string; // USER, VALIDATION_REQUEST, BRAND
  entityId: string;
  userId: string;
  changes?: string; // JSON stringified
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async log(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          userId: data.userId,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      logger.debug('Audit log created', {
        action: data.action,
        entityType: data.entityType,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to create audit log', {
        error: (error as Error).message,
        data,
      });
    }
  }

  static async getAuditTrail(
    entityType?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 1000,
  ) {
    const where: any = {};
    
    if (entityType) where.entityType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { email: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async getUserActions(userId: string, limit = 500) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export default AuditService;
