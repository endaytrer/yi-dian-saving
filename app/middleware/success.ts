module.exports = () => async (ctx, next) => {
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
