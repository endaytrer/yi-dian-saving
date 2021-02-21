// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportSuccess from '../../../app/middleware/success';

declare module 'egg' {
  interface IMiddleware {
    success: typeof ExportSuccess;
  }
}
