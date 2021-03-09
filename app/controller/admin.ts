import { Controller } from 'egg';
import { validateInteger, validateDouble } from '../utility/validation';
/**
 * For services which uses admin permission.
 */
export default class AdminController extends Controller {
  private async getUserService() {
    return await this.ctx.service.user.assertAdminLevel(2);
  }
  public async getAllUsers(): Promise<Object> {
    const { page, limit } = this.ctx.request.query;
    if (!validateInteger(page) || !validateInteger(limit))
      throw {
        code: 100,
        message: '不合法的输入值!',
      };
    const users = await (await this.getUserService()).getAllUsers(
      Number.parseInt(page),
      Number.parseInt(limit)
    );
    return users;
  }
  public async getProductStatus(): Promise<any> {
    const { ctx } = this;
    const { productId, page, limit } = ctx.request.query;
    if (
      !validateInteger(productId) ||
      !validateInteger(page) ||
      !validateInteger(limit)
    ) {
      throw { code: 100, message: '不合法的输入值!' };
    }
    const products = await (await this.getUserService()).getProductStatus(
      Number.parseInt(productId),
      Number.parseInt(page),
      Number.parseInt(limit)
    );
    return products;
  }
  public async getProductsInvestedOfUser(): Promise<any> {
    const { ctx } = this;
    const { userId, page, limit } = ctx.request.query;
    if (
      !validateInteger(userId) ||
      !validateInteger(page) ||
      !validateInteger(limit)
    )
      throw { code: 100, message: '不合法的输入值!' };
    const books = await (await this.getUserService()).getProductsInvestedOfUser(
      Number.parseInt(userId),
      Number.parseInt(page),
      Number.parseInt(limit)
    );
    return books;
  }
  public async addProduct() {
    const { ctx } = this;
    const {
      productName,
      providerName,
      interestRate,
      price,
      total,
      category,
      minimumHoldTime,
    } = ctx.request.body;
    if (
      !productName ||
      !total ||
      !validateDouble(total) ||
      !interestRate ||
      !validateDouble(interestRate) ||
      !price ||
      !validateDouble(price) ||
      !category ||
      !validateInteger(category, false, true)
    )
      throw { code: 100, message: '不合法的输入值!' };
    if (productName.length > 255)
      throw { code: 101, message: '名字过长!' };
    if (Number.parseFloat(total) > 2147483647)
      throw { code: 101, message: '数量太大!' };
    if (Number.parseFloat(interestRate) > 2147483647)
      throw { code: 101, message: '收益率过大!' };
    if (Number.parseFloat(price) > 2147483647)
      throw { code: 101, message: '价格过大!' };
    const id: number = await (await this.getUserService()).addProduct(
      productName,
      providerName,
      Number.parseFloat(interestRate),
      Number.parseFloat(price),
      Number.parseFloat(total),
      Number.parseInt(category),
      Number.parseInt(minimumHoldTime)
    );
    return {
      id,
    };
  }
  public async deleteProduct() {
    const { ctx } = this;
    if (!validateInteger(ctx.params.id))
      throw { code: 100, message: '不合法的输入!' };
    await (await this.getUserService()).deleteProduct(
      Number.parseInt(ctx.params.id)
    );
  }
}
