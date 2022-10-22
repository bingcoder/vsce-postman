const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, authorization, Accept, X-Requested-With'
  );
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method === 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});

// response
app.use(async (ctx) => {
  // console.log('query', ctx.request.query);
  // console.log('header', ctx.request.headers);
  // console.log('header', ctx.cookies.get('id'));
  // console.log('header', ctx.cookies.get('name'));
  // console.log('header', ctx.request.type);
  await new Promise((r) => {
    setTimeout(r, 2000);
  });
  ctx.body = {
    name: 'ojk',
    ...ctx.request.headers,
  };
});

app.listen(5500, () => console.log('start in 5500'));
