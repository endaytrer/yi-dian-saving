const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/controller/user.test.js', () => {
  let app;
  before(() => {
    app = mock.app();
    return app.ready();
  });
  it('should log in successfully', async () => {
    await app
      .httpRequest()
      .post('/api/signin')
      .send({
        identity: 'root',
        password: '@zR208810',
      })
      .expect(200)
      .expect({
        success: true,
        data: {
          userId: 1,
          name: 'root',
        },
      });
    await app
      .httpRequest()
      .delete('/api/signin')
      .expect(200)
      .expect({
        success: true,
        data: {
          login: true,
        },
      });
    await app
      .httpRequest()
      .delete('/api/signin')
      .expect(200)
      .expect({
        success: true,
        data: {
          login: false,
        },
      });
  });
});
