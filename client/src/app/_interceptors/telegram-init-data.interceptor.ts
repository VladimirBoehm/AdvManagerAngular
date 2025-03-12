import { HttpInterceptorFn } from '@angular/common/http';
import { LOCAL_STORAGE_CONSTANTS } from '../_framework/constants/localStorageConstants';

declare global {
  interface Window {
    Telegram: any;
  }
}

export const telegramInitDataInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'OPTIONS') {
    return next(req);
  }

  const initData = window.Telegram?.WebApp?.initData;
  const jwtToken = localStorage.getItem(LOCAL_STORAGE_CONSTANTS.JWT_TOKEN);

  const headers: Record<string, string> = {};
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }

  if (initData) {
    headers['initData'] = initData;
  }

  const clonedRequest = req.clone({
    setHeaders: headers,
  });

  return next(clonedRequest);
};
