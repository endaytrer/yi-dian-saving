import { Controller } from 'egg';
import User from '../service/User';
import { validateInteger } from '../utility/validation';
export default class SuperController extends Controller {
  public async getUserService(): Promise<User> {
    return this.ctx.service.user.assertAdminLevel(3);
  }
  public async addAdmin(): Promise<void> {
    const { ctx } = this;
    const { id } = ctx.params;
    if (!validateInteger(id)) {
      throw { code: 100, message: 'Illegal input!' };
    }
    await (await this.getUserService()).addAdmin(id);
  }
  public async deleteAdmin(): Promise<void> {
    const { ctx } = this;
    const { id } = ctx.params;
    if (!validateInteger(id)) {
      throw { code: 100, message: 'Illegal input!' };
    }
    return await (await this.getUserService()).deleteAdmin(id);
  }
}
