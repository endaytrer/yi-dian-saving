import { Model, STRING, INTEGER, DATE, BOOLEAN, DOUBLE } from 'sequelize';
import { Application } from 'egg';
class User extends Model {
  id: number;
  userName: string;
  birthday: Date;
  target: number;
  continuous: number;
  email: string;
  phone: string;
  passwordHash: string;
  balance: number;
  isAdmin: boolean;
  savedToday: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  static associate: () => any;
}
module.exports = (app: Application) => {
  User.init(
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      userName: { type: STRING(255), allowNull: false },
      birthday: { type: DATE, allowNull: false },
      target: DOUBLE,
      continuous: { type: INTEGER, allowNull: false, defaultValue: 0 },
      email: { type: STRING(255), allowNull: false },
      phone: STRING(255),
      passwordHash: { type: STRING(255), allowNull: false },
      balance: { type: DOUBLE, allowNull: false, defaultValue: 0 },
      isAdmin: { type: BOOLEAN, allowNull: false, defaultValue: false },
      savedToday: { type: DOUBLE, allowNull: false, defaultValue: 0 },
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
