import { Model, STRING, INTEGER, DATE, DOUBLE } from 'sequelize';
import { Application } from 'egg';
class Product extends Model {
  id: number;
  productName: string;
  providerName: string;
  interestRate: number;
  price: number; // unit price
  lastPrice: number;
  total: number; // total amount of products
  remains: number;
  category: number;
  minimumHoldTime: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  static associate: () => void;
}
module.exports = (app: Application) => {
  Product.init(
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      productName: { type: STRING(255), allowNull: false },
      providerName: { type: STRING(255), allowNull: false },
      interestRate: { type: DOUBLE, allowNull: false },
      price: { type: DOUBLE, allowNull: false },
      lastPrice: { type: DOUBLE, allowNull: false, defaultValue: 1 },
      total: { type: DOUBLE, allowNull: false },
      remains: { type: DOUBLE, allowNull: false },
      category: { type: INTEGER, allowNull: false },
      minimumHoldTime: { type: INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: DATE,
      updatedAt: DATE,
    },
    {
      sequelize: app.model,
      modelName: 'product',
      underscored: true,
    }
  );
  Product.associate = () => {
    app.model.Product.hasMany(app.model.Record, {
      foreignKey: 'productId',
      as: 'userInvests',
    });
  };
  return Product;
};
