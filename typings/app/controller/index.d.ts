// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAdmin from '../../../app/controller/admin';
import ExportGeneral from '../../../app/controller/general';
import ExportSuper from '../../../app/controller/super';
import ExportUser from '../../../app/controller/user';
import ExportVisitor from '../../../app/controller/visitor';

declare module 'egg' {
  interface IController {
    admin: ExportAdmin;
    general: ExportGeneral;
    super: ExportSuper;
    user: ExportUser;
    visitor: ExportVisitor;
  }
}
