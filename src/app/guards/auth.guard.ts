import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Guard: redirige a /login si no hay sesión activa */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

/** Guard inverso: redirige a /dashboard si ya está logueado */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
