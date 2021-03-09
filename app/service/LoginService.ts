import { Service } from 'egg';
import { hash, compare } from 'bcrypt';
export default class LoginService extends Service {
  public async signIn(identity: string, password: string) {
    console.log(identity);
    if (!identity && !password) {
      throw { code: 300, message: '身份和密码为空!' };
    }
    if (!identity) {
      throw { code: 301, message: '身份为空!' };
    }

    if (!password) {
      throw { code: 302, message: '密码为空!' };
    }
    if (identity.length > 255 || password.length > 255) {
      throw { code: 101, message: '身份或密码过长!' };
    }
    const { ctx } = this;
    if (ctx.session.userId) {
      throw { code: 303, message: '你已经登录过了!' };
    }

    let user = await ctx.model.User.findOne({
      where: {
        userName: identity,
      },
    });
    user =
      user ||
      (await ctx.model.User.findOne({
        where: {
          email: identity,
        },
      }));
    if (!user) throw { code: 301, message: '用户不存在' };
    const match = await compare(password, user.passwordHash);
    if (!match) throw { code: 302, message: '密码错误!' };
    return user;
  }
  public async signUp(
    username: string,
    email: string,
    password: string,
    birthday: Date
  ) {
    // 验证学工号、姓名、密码是否合法
    const { ctx } = this;

    if (
      await ctx.model.User.findOne({
        where: {
          userName: username,
        },
      })
    ) {
      throw {
        code: 304,
        message: '该用户名已被注册',
      };
    }
    if (
      await ctx.model.User.findOne({
        where: {
          email: email,
        },
      })
    ) {
      throw {
        code: 304,
        message: '该邮箱已被注册',
      };
    }
    const saltRounds = 10;
    const passwordHash = await hash(password, saltRounds);
    const user = await ctx.model.User.create({
      userName: username,
      passwordHash,
      email,
      birthday,
    });
    return user;
  }
}
