// src/types/express.d.ts
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        department?: string;
      };
      tenantId?: string;
      auditLog?: {
        action: string;
        resource: string;
        resourceId?: string;
        userId: string;
        timestamp: Date;
      };
    }
  }
}

export {};
