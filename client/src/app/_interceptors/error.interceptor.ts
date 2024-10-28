import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error) => {
      if (error) {
        switch (error.status) {
          case 400:
            if (error.error.errors) {
              const modalStateErrors = [];
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modalStateErrors.push(error.error.errors[key]);
                }
              }
              throw modalStateErrors.flat();
            } else {
              toastr.error(error.error, error.status);
            }
            break;
          case 401:
            toastr.error('Ошибка авторизации', error.status);
            break;
          case 404:
            // router.navigateByUrl('/not-found');
            toastr.error('Страница не найдена');
            break;
          case 500:
            // const navigationExtras: NavigationExtras = {state: {error: error.error}};
            //router.navigateByUrl('/server-error', navigationExtras);
            toastr.error('Ошибка сервера', error.status);
            break;
          default:
            toastr.error('Что-то пошло не так');
            break;
        }
      }
      throw error;
    })
  );
};
