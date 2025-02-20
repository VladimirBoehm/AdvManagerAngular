import { HttpInterceptorFn } from '@angular/common/http';

declare global {
  interface Window {
    Telegram: any;
  }
}

export const telegramInitDataInterceptor: HttpInterceptorFn = (req, next) => {
  const initData = window.Telegram?.WebApp?.initData;

  if (initData) {
    const clonedRequest = req.clone({
      setHeaders: {
        initData: initData.toString(),
      },
    });
    return next(clonedRequest);
  }
  return next(req);
};
