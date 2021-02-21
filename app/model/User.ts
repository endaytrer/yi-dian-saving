import { Model, STRING, INTEGER, DATE, BOOLEAN, DOUBLE } from 'sequelize';
import { Application } from 'egg';
class User extends Model {
  id: number;
  userName: string;
  email: string;
  phone: string;
  passwordHash: string;
  balance: number;
  isAdmin: boolean;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  static associate: () => any;
}
module.exports = (app: Application) => {
  User.init(
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      userName: { type: STRING(255), allowNull: false },
      email: { type: STRING(255), allowNull: false },
      phone: STRING(255),
      passwordHash: { type: STRING(255), allowNull: false },
      balance: { type: DOUBLE, allowNull: false },
      isAdmin: { type: BOOLEAN, allowNull: false },
      createdAt: DATE,
      updatedAt: DATE,
    },
    {
      sequelize: app.model,
      modelName: 'user',
      underscored: true,
    }
  );
  User.associate = () => {
    app.model.User.hasMany(app.model.Record, {
      foreignKey: 'clientId',
      as: 'investmentCommits',
    });
  };
  return User;
};
