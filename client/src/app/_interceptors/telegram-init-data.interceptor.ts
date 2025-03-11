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

  if (initData) {
    const clonedRequest = req.clone({
      setHeaders: {
        initData: initData,
        //Authorization: `Bearer ${jwtToken}`,
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsIkNyZWF0ZWQiOiIwOTo1MDoyOSIsImlzcyI6InZsYWRpbWlyLnRlbGVncmFtLmJvdC5jb20ifQ.NNsuv926vo91b-Qjp1EpvDdb75wVR1OlV6pfB6VAV1E`,
      },
    });
    return next(clonedRequest);
  }
  return next(req);
};
