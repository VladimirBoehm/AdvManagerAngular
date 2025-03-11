import { HttpInterceptorFn } from '@angular/common/http';
import { LOCAL_STORAGE_CONSTANTS } from '../_framework/constants/localStorageConstants';

declare global {
  interface Window {
    Telegram: any;
  }
}

export const telegramInitDataInterceptor: HttpInterceptorFn = (req, next) => {
  const initData = window.Telegram?.WebApp?.initData;
  const jwtToken = localStorage.getItem(LOCAL_STORAGE_CONSTANTS.JWT_TOKEN);

  if (initData) {
    const clonedRequest = req.clone({
      setHeaders: {
        initData: initData,
         Authorization: `Bearer ${jwtToken}`,
      },
    });
    return next(clonedRequest);
  }
  return next(req);
};
