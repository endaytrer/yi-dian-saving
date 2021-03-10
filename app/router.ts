import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  // user
  router.post('/api/signup', controller.user.signUp);
  router.post('/api/login', controller.user.login);
  router.delete('/api/login', controller.user.signOut);
  router.get('/api/login', controller.user.getLoginStatus);

  //visitor
  router.get('/api/product/:id', controller.visitor.getProductById);

  // generalUser
  router.get('/api/product', controller.general.getAllProducts);
  router.get('/api/owned', controller.general.getInvestedProducts);
  router.post('/api/product', controller.general.buyProduct);
  router.get('/api/balance', controller.general.getBalance);
  router.post('/api/topup', controller.general.topUp);
  router.post('/api/withdraw', controller.general.withdraw);
  router.get('/api/info', controller.general.getInfo);
  router.put('/api/changepwd', controller.general.changePassword);
  router.get('/api/category', controller.general.getSelfCategory);
  router.put('/api/target', controller.general.changeTarget);
  router.put('/api/product/expires', controller.general.modifyProductExpires);
  router.post('/api/product/number', controller.general.modifyProductNumber);
  // admin
  router.get('/api/admin/user', controller.admin.getAllUsers);
  router.post('/api/admin/product', controller.admin.addProduct);
  router.delete('/api/admin/product/:id', controller.admin.deleteProduct);
  router.get(
    '/api/admin/product/user',
    controller.admin.getProductsInvestedOfUser
  );
  router.get('/api/admin/product', controller.admin.getProductStatus);

  // superuser
  router.get('/api/super/:id', controller.super.addAdmin);
  router.delete('/api/super/:id', controller.super.deleteAdmin);
  router.put('/api/super/changepwd', controller.super.suChangePassword);
};
