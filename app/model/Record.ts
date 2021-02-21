import { Model, INTEGER, DATE, DOUBLE } from 'sequelize';
import { Application } from 'egg';
class Record extends Model {
  id: number;
  productId: number;
  clientId: number;
  initialPrice: number;
  amount: number;
  expires: Date;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  static associate: () => void;
}
module.exports = (app: Application) => {
  Record.init(
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      productId: { type: INTEGER, allowNull: false },
      clientId: { type: INTEGER, allowNull: false },
      initialPrice: { type: DOUBLE, allowNull: false },
      amount: { type: DOUBLE, allowNull: false },
      expires: { type: DATE, allowNull: false },
      createdAt: DATE,
      updatedAt: DATE,
    },
    {
      sequelize: app.model,
      modelName: 'record',
      underscored: true,
    }
  );
  Record.associate = () => {
    app.model.Record.belongsTo(app.model.User, {
      foreignKey: 'clientId',
      as: 'user',
    });
    app.model.Record.belongsTo(app.model.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };
  return Record;
};
