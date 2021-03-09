module.exports = () => async (ctx, next) => {
  // TODO: 模拟网络延时, 须删除
  // const delayTime = Math.random() * 1000;
  // await new Promise<void>((resolve) => setTimeout(resolve, delayTime));
  try {
    const responseContent = await next();
    if (responseContent)
      ctx.body = {
        success: true,
        data: responseContent,
      };
    else ctx.body = { success: true };
  } catch (e) {
    ctx.body = {
      success: false,
      error: e,
    };
  }
  ctx.status = 200;
};
