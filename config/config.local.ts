import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};

  config.sequelize = {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '@zR208810', //TODO: modify the password
    database: 'yi_dian_saving',
  };
  return config;
};
