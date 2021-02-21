import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  // user
  router.post('/api/signup', controller.user.signUp);
  router.post('/api/login', controller.user.login);
  router.delete('/api/login', controller.user.signOut);
  router.get('/api/login', controller.user.getLoginStatus);

  //visitor
  router.get('/api/product', controller.visitor.getAllProducts);
  router.get('/api/product/:id', controller.visitor.getProductById);

  // generalUser
  router.get('/api/owned', controller.general.getInvestedProducts);
  router.post('/api/product', controller.general.buyProduct);
  router.get('/api/balance', controller.general.getBalance);

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
};
