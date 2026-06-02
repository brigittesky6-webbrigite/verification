import nodemailer from 'nodemailer';
import { config } from '../config/index';
import logger from '../middleware/logger';
import prisma from '../db/prisma';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static validateConfig(): void {
    if (!config.email.host || !config.email.user || !config.email.password) {
      throw new Error(
        'Email configuration is incomplete. Required: EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD'
      );
    }
  }

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.validateConfig();
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }
    return this.transporter;
  }

  static async sendStatusChangeEmail(
    email: string,
    username: string,
    status: 'VALIDEE' | 'REFUSEE',
    brandName?: string,
    rejectionReason?: string,
  ) {
    try {
      const safeBrandName = brandName || 'votre demande';
      const safeRejectionReason = rejectionReason || 'Non spécifiée';

      const subject = status === 'VALIDEE' 
        ? `Votre demande de validation a été approuvée`
        : `Votre demande de validation a été refusée`;

      const html = status === 'VALIDEE'
        ? `
            <h2>Demande Approuvée</h2>
            <p>Bonjour ${username},</p>
            <p>Votre demande de validation pour <strong>${safeBrandName}</strong> a été approuvée avec succès.</p>
            <p><a href="${config.frontendUrl}/dashboard">Consulter votre espace</a></p>
          `
        : `
            <h2>Demande Refusée</h2>
            <p>Bonjour ${username},</p>
            <p>Votre demande de validation pour <strong>${safeBrandName}</strong> a été refusée.</p>
            <p><strong>Raison:</strong> ${safeRejectionReason}</p>
            <p>Vous pouvez soumettre une nouvelle demande depuis votre espace.</p>
          `;

      const transporter = EmailService.getTransporter();
      await transporter.sendMail({
        from: config.email.from,
        to: email,
        subject,
        html,
      });

      await prisma.emailLog.create({
        data: {
          to: email,
          subject,
          type: 'STATUS_CHANGE',
          status: 'SENT',
        },
      });

      logger.info('Status change email sent', { email, status });
    } catch (error) {
      logger.error('Failed to send status change email', { 
        email, 
        error: (error as Error).message 
      });

      await prisma.emailLog.create({
        data: {
          to: email,
          subject: `Status change notification`,
          type: 'STATUS_CHANGE',
          status: 'FAILED',
          error: (error as Error).message,
        },
      });
    }
  }

  static async sendReminderEmail(
    email: string,
    username: string,
    brandName: string,
    requestId: string,
  ) {
    try {
      const subject = `Rappel: Votre demande de validation est en attente`;
      const html = `
        <h2>Rappel de Demande en Attente</h2>
        <p>Bonjour ${username},</p>
        <p>Votre demande de validation pour <strong>${brandName}</strong> (ID: ${requestId}) 
        est en attente depuis plus de 48 heures.</p>
        <p>Un administrateur examinera votre demande au plus tôt.</p>
        <p><a href="${config.frontendUrl}/dashboard">Consulter votre espace</a></p>
      `;

      const transporter = EmailService.getTransporter();
      await transporter.sendMail({
        from: config.email.from,
        to: email,
        subject,
        html,
      });

      await prisma.emailLog.create({
        data: {
          to: email,
          subject,
          type: 'REMINDER',
          status: 'SENT',
          relatedEntityId: requestId,
        },
      });

      logger.info('Reminder email sent', { email, requestId });
    } catch (error) {
      logger.error('Failed to send reminder email', { 
        email, 
        error: (error as Error).message 
      });

      await prisma.emailLog.create({
        data: {
          to: email,
          subject: `Rappel: Votre demande de validation est en attente`,
          type: 'REMINDER',
          status: 'FAILED',
          relatedEntityId: requestId,
          error: (error as Error).message,
        },
      });
    }
  }

  static async sendAdminNotificationEmail(
    adminEmail: string,
    pendingCount: number,
  ) {
    try {
      const subject = `Notification: ${pendingCount} demande(s) en attente`;
      const html = `
        <h2>Demandes de Validation en Attente</h2>
        <p>Vous avez actuellement <strong>${pendingCount}</strong> demande(s) de validation 
        qui attendent votre action.</p>
        <p><a href="${config.apiUrl}/admin/dashboard">Accéder au tableau de bord</a></p>
      `;

      const transporter = EmailService.getTransporter();
      await transporter.sendMail({
        from: config.email.from,
        to: adminEmail,
        subject,
        html,
      });

      await prisma.emailLog.create({
        data: {
          to: adminEmail,
          subject,
          type: 'ADMIN_NOTIFICATION',
          status: 'SENT',
        },
      });

      logger.info('Admin notification email sent', { adminEmail, pendingCount });
    } catch (error) {
      logger.error('Failed to send admin notification email', { 
        adminEmail, 
        error: (error as Error).message 
      });

      await prisma.emailLog.create({
        data: {
          to: adminEmail,
          subject: `Notification: ${pendingCount} demande(s) en attente`,
          type: 'ADMIN_NOTIFICATION',
          status: 'FAILED',
          error: (error as Error).message,
        },
      });
    }
  }
}

export default EmailService;
