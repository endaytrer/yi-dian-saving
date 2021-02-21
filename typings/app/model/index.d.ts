// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportProduct from '../../../app/model/Product';
import ExportRecord from '../../../app/model/Record';
import ExportUser from '../../../app/model/User';

declare module 'egg' {
  interface IModel {
    Product: ReturnType<typeof ExportProduct>;
    Record: ReturnType<typeof ExportRecord>;
    User: ReturnType<typeof ExportUser>;
  }
}
