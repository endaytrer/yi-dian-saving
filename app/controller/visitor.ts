import { Controller } from 'egg';
import User from '../service/User';
import { validateInteger } from '../utility/validation';
export default class VisitorController extends Controller {
  public async getUserService(): Promise<User> {
    return this.ctx.service.user.assertAdminLevel(0);
  }
  public async getProductById(): Promise<any> {
    const { productId } = this.ctx.params.id;
    if (!validateInteger(productId)) {
      throw { code: 100, message: 'Illegal input!' };
    }
    const product = await (await this.getUserService()).getProductById(
      Number.parseInt(productId)
    );
    return product;
  }
  public async getAllProducts(): Promise<any> {
    const { page, limit } = this.ctx.request.query;
    if (!validateInteger(page) || !validateInteger(limit))
      throw { code: 100, message: 'Illegal input!' };
    const products = await (await this.getUserService()).getAllProducts(
      Number.parseInt(page),
      Number.parseInt(limit)
    );
    return products;
  }
}
