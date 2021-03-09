import { Controller } from 'egg';
import User from '../service/User';
import { validateInteger, validateDouble } from '../utility/validation';
export default class GeneralController extends Controller {
  private async getUserService(): Promise<User> {
    return await this.ctx.service.user.assertAdminLevel(1);
  }

  public async getAllProducts(): Promise<any> {
    const products = await (await this.getUserService()).getAllProducts();
    return products;
  }
  public async changeTarget(): Promise<void> {
    const { ctx } = this;
    const { changeTo } = ctx.request.body;
    const { userId } = ctx.session;
    if (!validateDouble(changeTo, false, true)) {
      throw { code: 100, message: '不合法的输入值!' };
    }
    await (await this.getUserService()).changeTarget(
      userId,
      Number.parseFloat(changeTo)
    );
    return;
  }
  public async topUp(): Promise<void> {
    const { ctx } = this;
    const { amount } = this.ctx.request.body;
    const { userId } = ctx.session;

    if (!validateDouble(amount)) {
      throw { code: 100, message: '不合法的输入值!' };
    }
    await (await this.getUserService()).topUp(userId, amount);
    return;
  }
  public async withdraw(): Promise<void> {
    const { ctx } = this;
    const { amount } = this.ctx.request.body;
    const { userId } = ctx.session;

    if (!validateDouble(amount)) throw { code: 100, message: '不合法的输入值!' };
    await (await this.getUserService()).withdraw(
      userId,
      Number.parseFloat(amount)
    );
    return;
  }
  public async getInfo(): Promise<any> {
    return await (await this.getUserService()).getSelfInfo();
  }
  public async getInvestedProducts(): Promise<any> {
    const { ctx } = this;
    const { userId } = ctx.session;
    const products = await (await this.getUserService()).getInvestedProducts(
      Number.parseInt(userId)
    );
    return products;
  }
  public async getBalance() {
    const { ctx } = this;
    return await (await this.getUserService()).getBalance(ctx.session.userId);
  }
  public async modifyProductNumber() {
    const { ctx } = this;
    const { deltaNumber, recordId } = ctx.request.body;
    if (!validateDouble(deltaNumber) || !validateInteger(recordId)) {
      throw { code: 100, message: '不合法的输入值!' };
    }
    await (await this.getUserService()).modifyProductNumber(
      ctx.session.userId,
      Number.parseInt(recordId),
      Number.parseFloat(deltaNumber)
    );
    return;
  }
  public async modifyProductExpires() {
    const { ctx } = this;
    const { expires, recordId } = ctx.request.body;
    if (!expires || !recordId || !validateInteger(recordId)) {
      throw { code: 100, message: '不合法的输入值!' };
    }
    await (await this.getUserService()).modifyProductExpires(
      ctx.session.userId,
      Number.parseInt(recordId),
      new Date(expires)
    );
  }
  public async buyProduct() {
    const { ctx } = this;
    const { amount, productId, expires } = ctx.request.body;
    if (
      !productId ||
      !validateInteger(productId) ||
      !amount ||
      !validateDouble(amount) ||
      !expires
    ) {
      throw { code: 100, message: '不合法的输入值!' };
    }
    const record = await (await this.getUserService()).buyProduct(
      ctx.session.userId,
      productId,
      amount,
      new Date(expires)
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
        message: '密码过长!',
      };
    }

    if (newPassword.length < 6) {
      throw { code: 102, message: '密码过短!' };
    }
    await (await this.getUserService()).changePassword(
      ctx.session.userId,
      oldPassword,
      newPassword
    );
    return;
  }
  public async getSelfCategory() {
    return await (await this.getUserService()).getSelfCategory();
  }
}
