import { PrismaClient } from '@prisma/client';
import logger from '../middleware/logger';
import AuditService from './auditService';

const prisma = new PrismaClient();

export class BrandService {
  static async getAllBrands() {
    return prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  static async getBrandsByType(productType: string) {
    return prisma.brand.findMany({
      where: {
        productType: productType as any,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createBrand(
    name: string,
    productType: string,
    adminId: string,
    description?: string,
    logoUrl?: string,
  ) {
    const existingBrand = await prisma.brand.findUnique({
      where: {
        name_productType: {
          name,
          productType: productType as any,
        },
      },
    });

    if (existingBrand) {
      throw new Error('Brand already exists');
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        productType: productType as any,
        description,
        logoUrl,
        createdBy: adminId,
      },
    });

    // Audit log
    await AuditService.log({
      action: 'CREATE',
      entityType: 'BRAND',
      entityId: brand.id,
      userId: adminId,
      changes: JSON.stringify({ name, productType }),
    });

    logger.info('Brand created', { brandId: brand.id, name });

    return brand;
  }

  static async updateBrand(
    brandId: string,
    adminId: string,
    data: Partial<{
      name: string;
      description: string;
      logoUrl: string;
      isActive: boolean;
    }>,
  ) {
    const brand = await prisma.brand.update({
      where: { id: brandId },
      data,
    });

    // Audit log
    await AuditService.log({
      action: 'UPDATE',
      entityType: 'BRAND',
      entityId: brandId,
      userId: adminId,
      changes: JSON.stringify(data),
    });

    logger.info('Brand updated', { brandId, changes: Object.keys(data) });

    return brand;
  }

  static async deleteBrand(brandId: string, adminId: string) {
    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: { isActive: false },
    });

    // Audit log
    await AuditService.log({
      action: 'DELETE',
      entityType: 'BRAND',
      entityId: brandId,
      userId: adminId,
      changes: JSON.stringify({ isActive: false }),
    });

    logger.info('Brand deleted', { brandId });

    return brand;
  }
}

export default BrandService;
