import { HttpInterceptorFn } from '@angular/common/http';

declare global {
  interface Window {
    Telegram: any;
  }
}

export const telegramInitDataInterceptor: HttpInterceptorFn = (req, next) => {
  const initData = window.Telegram?.WebApp?.initData;

  if (initData) {
    try {
      const clonedRequest = req.clone({
        setHeaders: {
          initData: initData.toString(),
        },
      });
      return next(clonedRequest);
    } catch (error) {
      throw new Error('Error setting initData header');
    }
  }
  return next(req);
};
