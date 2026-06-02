import cron from 'node-cron';
import EmailService from '../services/emailService';
import logger from '../middleware/logger';
import { config } from '../config/index';
import prisma from '../db/prisma';

export class CronJobs {
  // Run every hour
  static reminderEmailCron = cron.schedule('0 * * * *', async () => {
    if (!config.enableCron) return;

    try {
      logger.info('Cron job: Reminder emails task started');

      const thresholdDate = new Date(
        Date.now() - config.reminderEmailThresholdHours * 60 * 60 * 1000
      );

      // Find pending requests older than threshold
      const pendingRequests = await prisma.validationRequest.findMany({
        where: {
          status: 'EN_ATTENTE',
          submissionDate: {
            lte: thresholdDate,
          },
        },
        include: {
          user: {
            select: { email: true, username: true },
          },
          brand: {
            select: { name: true },
          },
        },
      });

      for (const request of pendingRequests) {
        await EmailService.sendReminderEmail(
          request.user.email,
          request.user.username,
          request.brand.name,
          request.id,
        );
      }

      logger.info(`Reminder emails sent: ${pendingRequests.length}`);
    } catch (error) {
      logger.error('Cron job failed: Reminder emails', {
        error: (error as Error).message,
      });
    }
  });

  // Run every 6 hours
  static adminNotificationCron = cron.schedule('0 */6 * * *', async () => {
    if (!config.enableCron) return;

    try {
      logger.info('Cron job: Admin notification task started');

      const pendingCount = await prisma.validationRequest.count({
        where: { status: 'EN_ATTENTE' },
      });

      if (pendingCount > 0) {
        // Get all admins
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { email: true },
        });

        for (const admin of admins) {
          await EmailService.sendAdminNotificationEmail(admin.email, pendingCount);
        }

        logger.info(`Admin notifications sent to ${admins.length} admins`);
      }
    } catch (error) {
      logger.error('Cron job failed: Admin notifications', {
        error: (error as Error).message,
      });
    }
  });

  static startAll() {
    logger.info('Starting cron jobs');
    // Note: The cron jobs are already scheduled when imported
  }

  static stopAll() {
    logger.info('Stopping cron jobs');
    CronJobs.reminderEmailCron.stop();
    CronJobs.adminNotificationCron.stop();
  }
}

export default CronJobs;
