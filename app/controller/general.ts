import { Controller } from 'egg';
import User from '../service/User';
import { validateInteger, validateDouble } from '../utility/validation';
export default class GeneralController extends Controller {
  private async getUserService(): Promise<User> {
    return await this.ctx.service.user.assertAdminLevel(1);
  }
  public async getInvestedProducts(): Promise<any> {
    const { ctx } = this;
    const { page, limit } = this.ctx.request.query;
    const { userId } = ctx.session;
    if (!validateInteger(page) || !validateInteger(limit))
      throw { code: 100, message: 'Illegal input!' };
    const products = await (await this.getUserService()).getInvestedProducts(
      Number.parseInt(userId),
      Number.parseInt(page),
      Number.parseInt(limit)
    );
    return products;
  }
  public async getBalance() {
    const { ctx } = this;
    return await (await this.getUserService()).getBalance(ctx.session.userId);
  }
  public async buyProduct() {
    const { ctx } = this;
    const { amount, productId, expires } = ctx.request.body;
    if (
      !productId ||
      !validateInteger(productId) ||
      !amount ||
      !validateDouble(amount) ||
      !expires ||
      !validateInteger(expires) ||
      expires < Date.now()
    ) {
      throw { code: 100, message: 'Illegal input!' };
    }
    const record = await (await this.getUserService()).buyProduct(
      ctx.session.userId,
      productId,
      amount,
      new Date(Number.parseInt(expires))
    );
    return {
      id: record.id,
    };
  }
  public async changePassword() {
    const { ctx } = this;
    const { oldPassword, newPassword } = ctx.request.body;
    if (oldPassword.length > 255 || newPassword.length > 255) {
      throw {
        code: 101,
        message: 'Password is too long!',
      };
    }

    if (newPassword.length < 6) {
      throw { code: 102, message: 'Password is too short!' };
    }
    await (await this.getUserService()).changePassword(
      ctx.session.userId,
      oldPassword,
      newPassword
    );
  }
}
