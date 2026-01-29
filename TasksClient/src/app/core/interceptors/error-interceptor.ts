import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { AuthService } from '../../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'שגיאה לא ידועה';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        if (error.status === 401) {
          // Unauthorized - perform automatic logout
          authService.logout();
          errorMessage = 'פג תוקף ההתחברות, אנא התחבר מחדש';
        } else if (error.status === 403) {
          errorMessage = 'אין לך הרשאות לבצע פעולה זו';
        } else if (error.status === 404) {
          errorMessage = 'המשאב לא נמצא';
        } else if (error.status === 500) {
          errorMessage = 'שגיאת שרת פנימית';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = `שגיאת שרת: ${error.status}`;
        }
      }

      toastService.show(errorMessage, 'error');

      return throwError(() => error);
    })
  );
};