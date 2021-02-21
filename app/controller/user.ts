import { Controller } from 'egg';
import { validateEmail } from '../utility/validation';

export default class UserController extends Controller {
  /**
   * signUp
   * POST
   */
  public getLoginStatus() {
    const { ctx } = this;
    if (!ctx.session.userId) {
      throw {
        code: 201,
        message: '未登录!',
      };
    }
    return;
  }
  public async signUp() {
    const { ctx } = this;
    const { email, username, password } = ctx.request.body;
    if (!validateEmail(email)) throw { code: 100, message: 'Illegal email!' };
    if (!email || !username || !password) {
      throw { code: 100, message: 'Illegal input!' };
    }
    if (email.length > 255 || username.length > 255 || password.length > 255) {
      throw {
        code: 101,
        message: 'Username or password is too long!',
      };
    }

    if (password.length < 6) {
      throw { code: 102, message: 'Password is too short!' };
    }
    const user = await ctx.service.loginService.signUp(
      username,
      email,
      password
    );
    ctx.session.userId = user.id;
    return {
      userId: user.id,
      name: user.userName,
    };
  }
  public async signOut() {
    const { ctx } = this;
    const haveLogin = !!ctx.session.userId;
    ctx.session.userId = null;
    return {
      login: haveLogin,
    };
  }
  public async login() {
    const { ctx } = this;
    const { identity, password } = ctx.request.body;
    const user = await ctx.service.loginService.signIn(identity, password);
    ctx.session.userId = user.id;
    return {
      userId: user.id,
      email: user.email,
      name: user.userName,
    };
  }
}
