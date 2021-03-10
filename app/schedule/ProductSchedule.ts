import { Subscription } from 'egg';

export default class ProductSchedule extends Subscription {
  static get schedule() {
    return {
      cron: '0 0 0 * * *',
      type: 'all',
    };
  }
  async subscribe() {
    const { ctx } = this;
    const { Product } = ctx.model;
    const allProducts = await Product.findAll();
    allProducts.forEach((product) => {
      const rand = (Math.random() - 0.5) * product.interestRate / 50 + (1 + product.interestRate / 365);
      const newPrice = product.price * rand;
      ctx.service.user.updatePrice(product.id, newPrice);
    });
  }
}
