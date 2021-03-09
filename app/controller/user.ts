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
    const { email, username, password, birthday } = ctx.request.body;
    if (!validateEmail(email)) throw { code: 100, message: '不合法的电子邮件地址' };
    if (!email || !username || !password || !birthday) {
      throw { code: 100, message: '不合法的输入值!' };
    }
    if (
      email.length > 255 ||
      username.length > 255 ||
      password.length > 255 ||
      birthday.length > 255
    ) {
      throw {
        code: 101,
        message: '输入过长!',
      };
    }

    if (password.length < 6) {
      throw { code: 102, message: '密码过短!' };
    }
    console.log(birthday);
    if (!Date.parse(birthday)) {
      throw { code: 103, message: '生日不合法!' };
    }
    const user = await ctx.service.loginService.signUp(
      username,
      email,
      password,
      new Date(birthday)
    );
    ctx.session.userId = user.id;
    return {
      userId: user.id,
      name: user.userName,
      birthday: user.birthday,
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
