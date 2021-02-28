module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING, BOOLEAN, DOUBLE } = Sequelize;
    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      user_name: { type: STRING(255), allowNull: false },
      birthday: { type: DATE, allowNull: false },
      target: DOUBLE,
      continuous: { type: INTEGER, allowNull: false },
      email: { type: STRING(255), allowNull: false },
      phone: STRING(255),
      password_hash: { type: STRING(255), allowNull: false },
      balance: { type: DOUBLE, allowNull: false },
      is_admin: { type: BOOLEAN, allowNull: false },
      saved_today: { type: DOUBLE, allowNull: false },
      created_at: DATE,
      updated_at: DATE,
    });
    await queryInterface.createTable('products', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      product_name: { type: STRING(255), allowNull: false },
      provider_name: { type: STRING(255), allowNull: false },
      interest_rate: { type: DOUBLE, allowNull: false },
      price: { type: DOUBLE, allowNull: false },
      last_price: { type: DOUBLE, allowNull: false },
      total: { type: DOUBLE, allowNull: false },
      remains: { type: DOUBLE, allowNull: false },
      category: { type: INTEGER, allowNull: false },
      minimum_hold_time: {type: INTEGER, allowNull: false},
      created_at: DATE,
      updated_at: DATE,
    });
    await queryInterface.createTable('records', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      product_id: { type: INTEGER, allowNull: false },
      client_id: { type: INTEGER, allowNull: false },
      initial_price: { type: DOUBLE, allowNull: false },
      amount: { type: DOUBLE, allowNull: false },
      expires: { type: DATE, allowNull: false },
      created_at: DATE,
      updated_at: DATE,
    });
  },

  down: async (queryInterface) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('books');
    await queryInterface.dropTable('records');
  },
};
