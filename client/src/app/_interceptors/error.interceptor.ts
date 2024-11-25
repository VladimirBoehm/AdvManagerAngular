import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';
import { Localization } from '../_framework/component/helpers/localization';


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
            toastr.error(Localization.getWord('authorization_error'), error.status);
            break;
          case 404:
            toastr.error(Localization.getWord('page_not_found'));
            break;
          case 500:
            toastr.error(Localization.getWord('server_error'), error.status);
            break;
          default:
            toastr.error(Localization.getWord('something_went_wrong'));
            break;
        }
      }
      throw error;
    })
  );
};
