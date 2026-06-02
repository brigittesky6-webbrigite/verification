/**
 * Tests unitaires pour EmailService
 * 
 * Ces tests valident le comportement du service d'email,
 * y compris la gestion des erreurs et la journalisation.
 */

// Mock nodemailer avant toutes les imports
const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
});

jest.mock('nodemailer', () => ({
  createTransport: mockCreateTransport,
}));

// Mock prisma
const mockEmailLogCreate = jest.fn();
jest.mock('../../db/prisma', () => ({
  __esModule: true,
  default: {
    emailLog: {
      create: mockEmailLogCreate,
    },
  },
}));

// Mock logger
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
jest.mock('../../middleware/logger', () => ({
  __esModule: true,
  default: {
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}));

// Mock config - sera réinitialisé avant chaque test
let mockConfig: any;
jest.mock('../../config/index', () => {
  return {
    get config() {
      return mockConfig;
    },
  };
});

import EmailService from '../emailService';

describe('EmailService', () => {
  // Configuration de base pour les tests
  const baseConfig = {
    email: {
      host: 'smtp.test.com',
      port: 587,
      user: 'test@test.com',
      password: 'testpass123',
      from: 'noreply@validateur.com',
    },
    frontendUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:5000',
  };

  beforeEach(() => {
    // Réinitialiser la configuration
    mockConfig = { ...baseConfig };
    
    // Réinitialiser les mocks
    mockSendMail.mockReset();
    mockCreateTransport.mockClear();
    mockEmailLogCreate.mockReset();
    mockLoggerInfo.mockReset();
    mockLoggerError.mockReset();
    
    // Réinitialiser le transporter statique
    (EmailService as any).transporter = null;
  });

  describe('validateConfig', () => {
    it('devrait lancer une erreur si EMAIL_HOST est manquant', async () => {
      mockConfig.email.host = undefined;
      
      await expect(
        EmailService.sendStatusChangeEmail(
          'user@test.com',
          'testuser',
          'VALIDEE',
          'TestBrand'
        )
      ).rejects.toThrow('Email configuration is incomplete');
    });

    it('devrait lancer une erreur si EMAIL_USER est manquant', async () => {
      mockConfig.email.user = undefined;
      
      await expect(
        EmailService.sendStatusChangeEmail(
          'user@test.com',
          'testuser',
          'VALIDEE',
          'TestBrand'
        )
      ).rejects.toThrow('Email configuration is incomplete');
    });

    it('devrait lancer une erreur si EMAIL_PASSWORD est manquant', async () => {
      mockConfig.email.password = undefined;
      
      await expect(
        EmailService.sendStatusChangeEmail(
          'user@test.com',
          'testuser',
          'VALIDEE',
          'TestBrand'
        )
      ).rejects.toThrow('Email configuration is incomplete');
    });
  });

  describe('getTransporter', () => {
    it('devrait créer un transporteur avec secure=false pour le port 587', async () => {
      mockConfig.email.port = 587;
      
      await EmailService.sendStatusChangeEmail(
        'user@test.com',
        'testuser',
        'VALIDEE',
        'TestBrand'
      );
      
      expect(mockCreateTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 587,
          secure: false,
        })
      );
    });

    it('devrait créer un transporteur avec secure=true pour le port 465', async () => {
      mockConfig.email.port = 465;
      
      await EmailService.sendStatusChangeEmail(
        'user@test.com',
        'testuser',
        'VALIDEE',
        'TestBrand'
      );
      
      expect(mockCreateTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 465,
          secure: true,
        })
      );
    });

    it('devrait réutiliser le même transporteur pour plusieurs appels', async () => {
      await EmailService.sendStatusChangeEmail(
        'user@test.com',
        'testuser',
        'VALIDEE',
        'TestBrand'
      );
      
      await EmailService.sendReminderEmail(
        'user@test.com',
        'testuser',
        'TestBrand',
        'req-123'
      );
      
      // createTransport ne devrait être appelé qu'une seule fois
      expect(mockCreateTransport).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendStatusChangeEmail', () => {
    it('devrait envoyer un email de validation approuvée avec succès', async () => {
      mockSendMail.mockResolvedValue({});
      
      await EmailService.sendStatusChangeEmail(
        'user@test.com',
        'testuser',
        'VALIDEE',
        'TestBrand'
      );
      
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Votre demande de validation a été approuvée',
        })
      );
      
      expect(mockEmailLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            to: 'user@test.com',
            type: 'STATUS_CHANGE',
            status: 'SENT',
          }),
        })
      );
      
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Status change email sent',
        expect.objectContaining({ email: 'user@test.com', status: 'VALIDEE' })
      );
    });

    it('devrait envoyer un email de validation refusée avec raison', async () => {
      mockSendMail.mockResolvedValue({});
      
      await EmailService.sendStatusChangeEmail(
        'user@test.com',
        'testuser',
        'REFUSEE',
        'TestBrand',
        'Code invalide'
      );
      
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Votre demande de validation a été refusée',
        })
      );
      
      // Vérifier que la raison est incluse dans le HTML
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Code invalide');
    });

    it('devrait gérer brandName undefined avec une valeur par défaut', async () => {
      mockSendMail.mockResolvedValue({});
      
      await EmailService.sendStatusChangeEmail(
        'user@test.com',
        'testuser',
        'VALIDEE',
        undefined
      );
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('votre demande');
      expect(callArgs.html).not.toContain('undefined');
    });

    it('devrait gérer rejectionReason undefined avec une valeur par défaut', async () => {
      mockSendMail.mockResolvedValue({});
      
      await EmailService.sendStatusChangeEmail(
        'user@test.com',
        'testuser',
        'REFUSEE',
        'TestBrand',
        undefined
      );
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Non spécifiée');
    });

    it('devrait journaliser l\'échec d\'envoi dans EmailLog', async () => {
      mockSendMail.mockRejectedValue(new Error('Connection refused'));
      
      await EmailService.sendStatusChangeEmail(
        'user@test.com',
        'testuser',
        'VALIDEE',
        'TestBrand'
      );
      
      expect(mockEmailLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            error: 'Connection refused',
          }),
        })
      );
      
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to send status change email',
        expect.objectContaining({ error: 'Connection refused' })
      );
    });
  });

  describe('sendReminderEmail', () => {
    it('devrait envoyer un email de rappel avec succès', async () => {
      mockSendMail.mockResolvedValue({});
      
      await EmailService.sendReminderEmail(
        'user@test.com',
        'testuser',
        'TestBrand',
        'req-123'
      );
      
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Rappel: Votre demande de validation est en attente',
        })
      );
      
      expect(mockEmailLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            to: 'user@test.com',
            type: 'REMINDER',
            status: 'SENT',
            relatedEntityId: 'req-123',
          }),
        })
      );
    });

    it('devrait journaliser l\'échec d\'envoi dans EmailLog', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));
      
      await EmailService.sendReminderEmail(
        'user@test.com',
        'testuser',
        'TestBrand',
        'req-123'
      );
      
      expect(mockEmailLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            error: 'SMTP error',
            relatedEntityId: 'req-123',
          }),
        })
      );
    });
  });

  describe('sendAdminNotificationEmail', () => {
    it('devrait envoyer une notification admin avec succès', async () => {
      mockSendMail.mockResolvedValue({});
      
      await EmailService.sendAdminNotificationEmail(
        'admin@test.com',
        5
      );
      
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@test.com',
          subject: 'Notification: 5 demande(s) en attente',
        })
      );
      
      expect(mockEmailLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            to: 'admin@test.com',
            type: 'ADMIN_NOTIFICATION',
            status: 'SENT',
          }),
        })
      );
    });

    it('devrait journaliser l\'échec d\'envoi dans EmailLog', async () => {
      mockSendMail.mockRejectedValue(new Error('Auth failed'));
      
      await EmailService.sendAdminNotificationEmail(
        'admin@test.com',
        5
      );
      
      expect(mockEmailLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            error: 'Auth failed',
          }),
        })
      );
    });
  });

  describe('Gestion des erreurs de configuration', () => {
    it('devrait gérer gracieusement quand le transporteur n\'est pas configuré', async () => {
      mockConfig.email.host = undefined;
      
      // Ne devrait pas lancer d'erreur non gérée
      await expect(
        EmailService.sendStatusChangeEmail(
          'user@test.com',
          'testuser',
          'VALIDEE',
          'TestBrand'
        )
      ).rejects.toThrow();
      
      // Devrait quand même journaliser l'erreur
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });
});