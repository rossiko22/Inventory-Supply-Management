import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔐 credentialsInterceptor:', req.url, 'withCredentials:', req.withCredentials);
  const cloned = req.clone({ withCredentials: true });
  console.log('🔐 after clone withCredentials:', cloned.withCredentials);
  return next(cloned);
};
