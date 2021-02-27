import { Service } from 'egg';
import { hash, compare } from 'bcrypt';
export default class LoginService extends Service {
  public async signIn(identity: string, password: string) {
    console.log(identity);
    if (!identity && !password) {
      throw { code: 300, message: 'Number and password are empty!' };
    }
    if (!identity) {
      throw { code: 301, message: 'Identity is empty!' };
    }

    if (!password) {
      throw { code: 302, message: 'Password is empty!' };
    }
    if (identity.length > 255 || password.length > 255) {
      throw { code: 101, message: 'Username or password is too long!' };
    }
    const { ctx } = this;
    if (ctx.session.userId) {
      throw { code: 303, message: 'You have already signed in!' };
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
    if (!user) throw { code: 301, message: 'Username does not exists!' };
    const match = await compare(password, user.passwordHash);
    if (!match) throw { code: 302, message: 'Password verification failed!' };
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
        message: 'The username have been already registered!',
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
        message: 'The username have been already registered!',
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
