import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth';

// Pantallas privadas: sin token van al login, y con token sin validar pasan por "cargando"
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token()) return router.createUrlTree(['/login']);
  if (!auth.validada()) return router.createUrlTree(['/cargando']);
  return true;
};

// Login y registro: si ya hay sesión, no tiene sentido mostrarlos
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token()) return true;
  return router.createUrlTree([auth.validada() ? '/publicaciones' : '/cargando']);
};