import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const body = req.body;
    const query = req.query;

    console.log('--- Nouvelle Requête ---');
    console.log(`URL: ${url}`);
    console.log(`Méthode: ${method}`);
    console.log('Query Params:', query);
    console.log('Corps:', body || 'Aucun');

    const now = Date.now();

    return next.handle().pipe(
      tap((response) => {
        console.log('--- Réponse envoyée ---');
        console.log(`Statut: ${context.switchToHttp().getResponse().statusCode}`);
        console.log('Contenu:', response);
        console.log(`Temps de traitement: ${Date.now() - now}ms`);
        console.log('------------------------');
      }),
    );
  }
}
