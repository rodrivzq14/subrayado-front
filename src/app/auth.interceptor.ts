import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from './services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = localStorage.getItem('token');
  const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((e: HttpErrorResponse) => {
      // Un 401 en el login es "credenciales incorrectas", no una sesión vencida
      const esLogin = req.url.endsWith('/autenticacion/login');
      if (e.status === 401 && !esLogin) {
        auth.sesionVencida(e.error?.message);
        return EMPTY;
      }
      return throwError(() => e);
    }),
  );
};