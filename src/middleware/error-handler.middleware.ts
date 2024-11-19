import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      this.handleException(error, res);
    }
  }

  private handleException(error: any, res: Response) {
    if (error.name === 'ValidationError') {
        res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
          errors: error.errors,
        });
      } else if (error instanceof HttpException) {
        const status = error.getStatus();
        const response = error.getResponse();
        res.status(status).json({
          statusCode: status,
          message: response,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
      }
  }
}
