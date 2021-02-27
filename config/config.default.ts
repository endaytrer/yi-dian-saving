import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;
  // disable csrf
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1606050620304_8666';

  // add your egg config in here
  config.middleware = ['success'];
  // 年龄分级, 从0开始计数
  config.categories = [6, 12, 16, 18];

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // sequelize

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
