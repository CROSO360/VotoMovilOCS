import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { request } from 'http';
import { CookieService } from 'ngx-cookie-service';

export const jwtInterceptorInterceptor: HttpInterceptorFn = (req, next) => {

  const cookieService = inject(CookieService);

  const token: string = cookieService.get('token');

  let modifiedReq = req;

  if (token) {
    modifiedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(modifiedReq);

};
