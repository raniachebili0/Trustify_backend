import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      if (!res.headersSent) { // Vérifie si une réponse a déjà été envoyée
        this.handleException(error, res);
      } else {
        console.error('Erreur après envoi de la réponse:', error);
      }
    }
  }

  private handleException(error: any, res: Response) {
    if (error.name === 'ValidationError') {
      if (!res.headersSent) {
        res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
          errors: error.errors,
        });
      }
    } else if (error instanceof HttpException) {
      const status = error.getStatus();
      const response = error.getResponse();
      if (!res.headersSent) {
        res.status(status).json({
          statusCode: status,
          message: response,
        });
      }
    } else {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
      }
    }
  }
}
