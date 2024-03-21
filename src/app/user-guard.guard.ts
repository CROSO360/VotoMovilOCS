import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const userGuardGuard: CanActivateFn = (route, state) => {
  const cookieSrvice = inject(CookieService);
  const router = inject(Router);

  const cookie = cookieSrvice.check('token');

  if (!cookie) {
    router.navigate(['/', 'login']);
    return false;
  } else {
    return true;
  }
};
