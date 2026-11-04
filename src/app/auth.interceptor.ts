import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from './services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  // Se lee en cada petición: si el token cambió (otra pestaña, o fue alterado), se usa el actual
  const token = localStorage.getItem('token');
  const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((e: HttpErrorResponse) => {
      // Un 401 en el login es "credenciales incorrectas", no una sesión vencida
      const esLogin = req.url.endsWith('/autenticacion/login');
      if (e.status === 401 && !esLogin) {
        auth.sesionVencida();
        return EMPTY; // la sesión ya se cerró: los componentes no muestran su propio error encima
      }
      return throwError(() => e);
    }),
  );
};