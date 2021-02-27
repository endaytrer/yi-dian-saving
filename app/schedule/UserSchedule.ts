import { Subscription } from 'egg';

export default class UserSchedule extends Subscription {
  static get schedule() {
    return {
      cron: '0 0 0 * * *',
      type: 'all',
    };
  }
  async subscribe() {
    const { ctx } = this;
    const { User } = ctx.model;
    const allUsers = await User.findAll();
    allUsers.forEach((user) => {
      if (user.savedToday === 0) {
        user.continuous = 0;
      }
      user.savedToday = 0;
      user.save();
    });
  }
}
