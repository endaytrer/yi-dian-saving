import { Service } from 'egg';
import { Op } from 'sequelize';
import { hash, compare } from 'bcrypt';
import { getAge } from '../utility/others';
export default class User extends Service {
  public async addProduct(
    productName: string,
    providerName: string,
    interestRate: number,
    price: number,
    total: number,
    category: number,
    minimumHoldTime: number
  ): Promise<number> {
    const product = await this.ctx.model.Product.create({
      productName: productName,
      providerName: providerName,
      interestRate: interestRate,
      price,
      lastPrice: price,
      total,
      remains: total,
      category,
      minimumHoldTime,
    });
    return product.id;
  }

  public async deleteProduct(id: number): Promise<boolean> {
    const { ctx } = this;
    const { Product } = this.ctx.model;
    const product = await Product.findOne({ where: { id } });
    if (!product) throw { code: 0, message: '未找到该理财产品' };
    if (product.remains < product.amount)
      throw { code: 403, message: '产品被其他人拥有了' };
    await ctx.model.Product.destroy({
      where: {
        id,
      },
    });
    return true;
  }

  public async getAllProducts(): Promise<{ total: number; products: any[] }> {
    const category = await this.getSelfCategory();
    const { model } = this.ctx;
    const products: {
      count: number;
      rows: any[];
    } = await model.Product.findAndCountAll({
      where: {
        category: {
          [Op.lte]: category,
        },
      },
      attributes: [
        'id',
        ['product_name', 'productName'],
        ['provider_name', 'providerName'],
        ['interest_rate', 'interestRate'],
        'price',
        'category',
        ['last_price', 'lastPrice'],
        'total',
        'remains',
        ['minimum_hold_time', 'minimumHoldTime'],
      ],
    });
    return {
      total: products.count,
      products: products.rows,
    };
  }
  public async getSelfInfo(): Promise<Object> {
    const { ctx } = this;
    const { User } = ctx.model;
    const id = ctx.session.userId;
    const user = await User.findByPk(id, {
      attributes: [
        ['id', 'userId'],
        ['user_name', 'name'],
        'birthday',
        'target',
        'continuous',
        ['saved_today', 'savedToday'],
        'email',
        'phone',
        'balance',
      ],
    });
    return user;
  }
  public async getAllUsers(
    page: number,
    limit: number
  ): Promise<{ total: number; data: any[] }> {
    const { model } = this.ctx;
    const users: {
      count: number;
      rows: any[];
    } = await model.User.findAndCountAll({
      attributes: [
        ['id', 'userId'],
        ['user_name', 'name'],
      ],
      offset: (page - 1) * limit,
      limit,
    });
    return {
      total: users.count,
      data: users.rows,
    };
  }
  public async changeTarget(userId: number, changeTo: number) {
    const { ctx } = this;
    const { User } = ctx.model;
    const user = await User.findByPk(userId);
    user.target = changeTo;
    await user.save();
  }
  public async modifyProductNumber(
    clientId: number,
    recordId: number,
    deltaNumber: number
  ) {
    const { ctx } = this;
    const { User, Record, Product } = ctx.model;
    const record = await Record.findByPk(recordId);
    const product = await Product.findByPk(record.productId);
    if (!record || !product) {
      throw {
        code: 0,
        message: '产品或购买记录未找到',
      };
    }
    if (record.clientId !== clientId) {
      throw { code: 201, message: '你不是买家!' };
    }
    if (Date.now() < new Date(record.expires).getTime()) {
      throw { code: 202, message: '操作已被冻结!' };
    }
    if (deltaNumber > product.remains) {
      throw {
        code: 0,
        message: '你将买入的产品数量超过了该产品的剩余!',
      };
    }
    if (-deltaNumber > record.amount) {
      throw {
        code: 0,
        message: '你将卖出的产品超过了你拥有的产品!',
      };
    }
    const client = await User.findByPk(clientId);
    if (deltaNumber * product.price > client.balance) {
      throw {
        code: 0,
        message: '你没有足够的资金来购买. 若需要购买, 请先存钱.',
      };
    }
    record.amount += deltaNumber;
    record.initialPrice += deltaNumber * product.price;
    client.balance -= deltaNumber * product.price;
    product.remains -= deltaNumber;
    if (record.amount !== 0) {
      await record.save();
    } else {
      await record.destroy();
    }
    await product.save();
    await client.save();
  }
  public async modifyProductExpires(
    clientId: number,
    recordId: number,
    expires: Date
  ) {
    const { ctx } = this;
    const { Record } = ctx.model;
    const record = await Record.findByPk(recordId, {
      include: {
        association: 'product',
        attributes: [['minimum_hold_time', 'minimumHoldTime']],
      },
    });
    if (record.clientId !== clientId) {
      throw { code: 201, message: '你不是买家!' };
    }
    if (
      expires.getTime() - record.createdAt.getTime() <
      record.product.minimumHoldTime
    ) {
      throw {
        code: 201,
        message: '冻结时间必须超过产品的最小买入时间!',
      };
    }
    record.expires = expires;
    await record.save();
  }
  public async buyProduct(
    clientId: number,
    productId: number,
    amount: number,
    expires: Date
  ): Promise<any> {
    const { Record, Product, User } = this.ctx.model;
    const client = await User.findByPk(clientId);
    const product = await Product.findByPk(productId);
    if (!product) throw { code: 0, message: '产品不存在!' };
    if (product.remains - amount < 0)
      throw { code: 402, message: '产品数量不够!' };
    if (expires.getTime() - Date.now() < product.minimumHoldTime) {
      throw {
        code: 403,
        message: '冻结时间必须超过产品的最小买入时间!',
      };
    }
    if (client.balance - amount * product.price < 0) {
      throw {
        code: 401,
        message: '你没有足够的资金来购买. 若需要购买, 请先存钱.',
      };
    }
    product.remains -= amount;
    client.balance -= amount * product.price;
    await product.save();
    await client.save();
    return await Record.create({
      productId,
      clientId,
      initialPrice: product.price * amount,
      amount,
      expires,
    });
  }
  public async updatePrice(productId: number, newPrice: number) {
    const { ctx } = this;
    const { Product } = ctx.model;
    const product = await Product.findByPk(productId);
    if (!product) {
      throw { code: 200, message: '该产品未找到' };
    }
    product.lastPrice = product.price;
    product.price = newPrice;
    await product.save();
  }
  public async getInvestedProducts(
    selfId: number
  ): Promise<{ total: number; products: any[] }> {
    const { ctx } = this;
    const { Record } = ctx.model;
    const records: {
      count: number;
      rows: any[];
    } = await Record.findAndCountAll({
      where: {
        clientId: selfId,
      },
      attributes: [
        'id',
        'amount',
        'expires',
        ['initial_price', 'initialPrice'],
      ],
      include: [
        {
          association: 'product',
          attributes: [
            'id',
            ['product_name', 'productName'],
            ['provider_name', 'providerName'],
            ['interest_rate', 'interestRate'],
            'price',
            'category',
            ['last_price', 'lastPrice'],
            'total',
            'remains',
            ['minimum_hold_time', 'minimumHoldTime'],
          ],
        },
      ],
    });

    return {
      total: records.count,
      products: records.rows,
    };
  }

  public async getProductsInvestedOfUser(
    clientId: number,
    page: number,
    limit: number
  ): Promise<{ total: number; list: any[] }> {
    const { ctx } = this;
    const { User, Record } = ctx.model;
    const user = await User.findByPk(clientId);
    if (!user) {
      throw { code: 0, message: '用户不存在' };
    }
    const products: {
      count: number;
      rows: any[];
    } = await Record.findAndCountAll({
      where: {
        clientId,
      },
      attributes: [
        'id',
        ['product_id', 'productId'],
        ['client_id', 'clientId'],
      ],
      include: [
        {
          association: 'product',
          attributes: [['product_name', 'productName'], 'price'],
        },
      ],
      offset: (page - 1) * limit,
      limit,
    });
    const records: {
      id: number;
      productId: string;
      clientId: string;
      productName: string;
      productPrice: number;
    }[] = [];
    products.rows.forEach((element) => {
      records.push({
        id: element.id,
        productId: element.productId,
        clientId: element.clientId,
        productName: element.product.productName,
        productPrice: element.product.price,
      });
    });
    return {
      total: products.count,
      list: records,
    };
  }

  public async getProductStatus(
    productId: number,
    page: number,
    limit: number
  ): Promise<{ total: number; list: any[] }> {
    const { ctx } = this;
    const { Product, Record } = ctx.model;
    const product = await Product.findByPk(productId);
    if (!product) {
      throw { code: 0, message: '产品不存在' };
    }
    const records: {
      count: number;
      rows: any[];
    } = await Record.findAndCountAll({
      where: {
        productId,
      },
      attributes: [
        'id',
        ['product_id', 'productId'],
        ['client_id', 'clientId'],
        ['initial_price', 'initialPrice'],
        'amount',
        'expires',
      ],
      include: [
        {
          association: 'user',
          attributes: [['user_name', 'userName']],
        },
        {
          association: 'product',
          attributes: [['product_name', 'productName'], 'price'],
        },
      ],
      offset: (page - 1) * limit,
      limit,
    });

    return {
      total: records.count,
      list: records.rows,
    };
  }
  public async getProductById(productId: number): Promise<any> {
    const { ctx } = this;
    const { Product } = ctx.model;
    return await Product.findByPk(productId);
  }
  public async getBalance(clientId: number): Promise<number> {
    const { User } = this.ctx.model;
    const user = await User.findByPk(clientId);
    return user.balance;
  }

  public async topUp(clientId: number, amount: number): Promise<any> {
    const { ctx } = this;
    const { User } = ctx.model;
    const client = await User.findByPk(clientId);
    client.balance += amount;
    if (!client.savedToday) {
      client.continuous++;
    }
    client.savedToday += amount;
    await client.save();
    return client.balance;
  }
  public async withdraw(clientId: number, amount: number): Promise<any> {
    const { ctx } = this;
    const { User } = ctx.model;
    const client = await User.findByPk(clientId);
    if (client.balance < amount) {
      throw { code: 0, message: '你的零钱不够' };
    }
    client.balance -= amount;
    await client.save();
    return client.balance;
  }

  public async changePassword(
    clientId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<any> {
    const { ctx } = this;
    const { User } = ctx.model;
    const client = await User.findByPk(clientId);
    if (!client) {
      throw { code: 1, message: '用户未找到' };
    }
    if (!(await compare(oldPassword, client.passwordHash))) {
      throw { code: 302, message: '旧密码错误' };
    }
    const saltRounds = 10;
    client.passwordHash = await hash(newPassword, saltRounds);
    await client.save();
  }
  public async suChangePassword(
    clientId: number,
    newPassword: string
  ): Promise<any> {
    const { ctx } = this;
    const { User } = ctx.model;
    const client = await User.findByPk(clientId);
    if (!client) {
      throw { code: 1, message: '用户未找到' };
    }
    const saltRounds = 10;
    client.passwordHash = await hash(newPassword, saltRounds);
    await client.save();
  }
  public async addAdmin(userId: number): Promise<any> {
    const { ctx } = this;
    const { User } = ctx.model;
    const user = await User.findByPk(userId);
    if (!user) {
      throw { code: 0, message: '用户未找到' };
    }
    user.isAdmin = true;
    await user.save();
  }
  public async deleteAdmin(userId: number): Promise<any> {
    const { ctx } = this;
    const { User } = ctx.model;
    const user = await User.findByPk(userId);
    if (!user) {
      throw { code: 0, message: '用户未找到' };
    }
    user.isAdmin = false;
    await user.save();
  }
  // if it is needed to verify admin level, use this me
  public async assertAdminLevel(level: number): Promise<User> {
    const { ctx } = this;
    const { User } = ctx.model;
    const clientId = ctx.session.userId;
    let client;
    switch (level) {
      case 0:
        break;
      case 1:
        if (!clientId) {
          throw { code: 201, message: '你尚未登录' };
        }
        break;
      case 2:
        if (!clientId) {
          throw { code: 201, message: '你尚未登录' };
        }
        client = await User.findByPk(clientId);
        if (!client) {
          throw { code: 0, message: '用户未找到!' };
        }
        if (client.id !== 1 && !client.isAdmin) {
          throw { code: 202, message: '你的权限不支持你进行此操作' };
        }
        break;
      case 3:
        if (!clientId) {
          throw { code: 201, message: '你尚未登录' };
        }
        client = await User.findByPk(clientId);
        if (!client) {
          throw { code: 0, message: '用户未找到!' };
        }
        if (client.id !== 2) {
          throw { code: 202, message: '你的权限不支持你进行此操作!' };
        }
        break;
      default:
        throw { code: 203, message: '你的权限不支持你进行此操作!' };
    }
    return this;
  }
  public async getSelfCategory(): Promise<number> {
    const { ctx } = this;
    const { User } = ctx.model;
    const { birthday } = await User.findByPk(ctx.session.userId, {
      attributes: ['birthday'],
    });
    if (!birthday) {
      throw {
        code: 0,
        message: '用户未找到',
      };
    }
    const age: number = getAge(birthday);
    const { categories } = this.app.config;
    for (let i = categories.length - 1; i >= 0; i--) {
      if (age >= categories[i]) {
        return i;
      }
    }
    return -1;
  }
}
