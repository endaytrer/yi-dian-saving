import { Service } from 'egg';
import { hash, compare } from 'bcrypt';
export default class User extends Service {
  public async addProduct(
    productName: string,
    providerName: string,
    interestRate: number,
    price: number,
    total: number
  ): Promise<number> {
    const book = await this.ctx.model.Product.create({
      productName: productName,
      providerName: providerName,
      interestRate: interestRate,
      price: price,
      total,
      remains: total,
    });
    return book.id;
  }

  public async deleteProduct(id: number): Promise<boolean> {
    const { ctx } = this;
    const { Product } = this.ctx.model;
    const product = await Product.findOne({ where: { id } });
    if (!product) throw { code: 0, message: 'The product is not found.' };
    if (product.remains < product.amount)
      throw { code: 403, message: 'Not every product has been expired.' };
    await ctx.model.Product.destroy({
      where: {
        id,
      },
    });
    return true;
  }

  public async getAllProducts(
    page: number,
    limit: number
  ): Promise<{ total: number; products: any[] }> {
    const { model } = this.ctx;
    const products: {
      count: number;
      rows: any[];
    } = await model.Product.findAndCountAll({
      attributes: [
        'id',
        ['product_name', 'productName'],
        ['provider_name', 'providerName'],
        ['interest_rate', 'interestRate'],
        'price',
        'total',
        'remains',
      ],
      offset: (page - 1) * limit,
      limit,
    });
    return {
      total: products.count,
      products: products.rows,
    };
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

  /**
   * sellProduct
   * @param clientId the user who buy a product
   * @param productId the book which borrower attempt to borrow
   * @param amount the amount to buy
   */
  public async buyProduct(
    clientId: number,
    productId: number,
    amount: number,
    expires: Date
  ): Promise<any> {
    const { Record, Product, User } = this.ctx.model;
    const client = await User.findByPk(clientId);
    const product = await Product.findByPk(productId);
    if (!product) throw { code: 0, message: 'Product does not exist!' };
    if (product.remains - amount < 0)
      throw { code: 402, message: 'there are no enough products!' };
    if (client.balance - amount * product.price < 0) {
      throw {
        code: 401,
        message:
          'Your account does not have enough funds to purchase this product!',
      };
    }
    product.remains -= amount;
    client.balance -= amount * product.price;
    await product.save();
    await client.save();
    return await Record.create({
      productId,
      clientId,
      initialPrice: product.price,
      amount,
      expires,
    });
  }
  /**
   * getInvestedProducts
   * get the book borrowed by the user him/herself.
   * @param selfId
   * @param page the page number related to the limit
   * @param limit how many records are showed each page
   */
  public async getInvestedProducts(
    selfId: number,
    page: number,
    limit: number
  ): Promise<{ total: number; list: any[] }> {
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
          ],
        },
      ],
      offset: (page - 1) * limit,
      limit,
    });

    const products: {
      id: number;
      totalPrice: number;
      profit: number;
      expires: Date;
      productName: string;
      providerName: string;
      interestRate: number;
    }[] = [];
    records.rows.forEach((element) => {
      products.push({
        id: element.product.id,
        totalPrice: element.product.price * element.amount,
        profit:
          element.product.price * element.amount -
          element.initialPrice * element.amount,
        expires: element.expires,
        productName: element.product.productName,
        providerName: element.product.providerName,
        interestRate: element.product.interestRate,
      });
    });
    return {
      total: records.count,
      list: products,
    };
  }
  /**
   * getProductsInvestedOfUser
   * get the books borrowed by any user
   * @param userId the user to query
   * @param page the page number related to the limit
   * @param limit how many records are showed each page
   */
  public async getProductsInvestedOfUser(
    clientId: number,
    page: number,
    limit: number
  ): Promise<{ total: number; list: any[] }> {
    const { ctx } = this;
    const { User, Record } = ctx.model;
    const user = await User.findByPk(clientId);
    if (!user) {
      throw { code: 0, message: 'User does not exist!' };
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

  /**
   * getProductStatus
   * get the books lending status,
   * @param productId the book to query
   * @param page the page number related to the limit
   * @param limit how many records are showed each page
   */
  public async getProductStatus(
    productId: number,
    page: number,
    limit: number
  ): Promise<{ total: number; list: any[] }> {
    const { ctx } = this;
    const { Product, Record } = ctx.model;
    const product = await Product.findByPk(productId);
    if (!product) {
      throw { code: 0, message: 'Product does not exist!' };
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
    const client = User.findByPk(clientId);
    client.balance += amount;
    await client.save();
    return client.balance;
  }
  public async withdraw(clientId: number, amount: number): Promise<any> {
    const { ctx } = this;
    const { User } = ctx.model;
    const client = User.findByPk(clientId);
    if (client.balance < amount) {
      throw { code: 0, message: 'balance is not enough!' };
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
    if (!compare(oldPassword, client.passwordHash)) {
      throw { code: 302, message: 'Password verification failed' };
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
      throw { code: 0, message: 'User not found' };
    }
    user.isAdmin = true;
    await user.save();
  }
  public async deleteAdmin(userId: number): Promise<any> {
    const { ctx } = this;
    const { User } = ctx.model;
    const user = await User.findByPk(userId);
    if (!user) {
      throw { code: 0, message: 'User not found' };
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
          throw { code: 201, message: 'You are not signed in!' };
        }
        break;
      case 2:
        if (!clientId) {
          throw { code: 201, message: 'You are not signed in!' };
        }
        client = await User.findByPk(clientId);
        if (!client) {
          throw { code: 0, message: 'client not found!' };
        }
        if (client.id !== 1 && !client.isAdmin) {
          throw { code: 202, message: 'You are not permitted!' };
        }
        break;
      case 3:
        if (!clientId) {
          throw { code: 201, message: 'You are not signed in!' };
        }
        client = await User.findByPk(clientId);
        if (!client) {
          throw { code: 0, message: 'client not found!' };
        }
        if (client.id !== 1) {
          throw { code: 202, message: 'You are not permitted!' };
        }
        break;
      default:
        throw { code: 203, message: 'Admin code not defined!' };
    }
    return this;
  }
}
