
// 引入 express 
const express = require('express');

const path = require('path');

// 引入 express-session 中间件
const session = require('express-session');

// 导入子路由
const admin = require('./routes/admin');
const home = require('./routes/home');

const app = express();

app.listen(3000);

// 配置模板引擎
app.set('view engine', 'xtpl');
// 配置模板目录
app.set('views', path.join(__dirname, './views'));

// express 提供了一个对象 app.locals 这个对象可以被全局访问
// 包括在模板当中！！！
// app.locals.demo = '这是一个测试';

// 引入数据模型
const options = require('./model/options');

// 托管静态资源
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// 挂载解析post数据的中间件
app.use(express.urlencoded({extended: true}));

// 挂载 session 中间件
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 自定义中间件，所有以 /admin 开头（即后台）
// 都会执行该中间件
app.use('/admin', (req, res, next) => {
  // 检测登录状态的会务定义在这里，即检测有没有 session
  //  req.session 需要中间件（express-session）支持

  // console.log(req._parsedUrl.pathname);

  // 将登录者的信息记录在 app.locals 中，便可以在模板当全局使用
  app.locals.userInfo = req.session.userInfo;

  // console.log(req.session);
  // 除了登录页本身都要检测 是否有 session
  if(!req.session.userInfo && req._parsedUrl.pathname != '/admin/login') {
    // 重定向登录页
    // return res.redirect('/admin/login');
  }
  next();
})

// 为前台定义一个中间件
app.use('/', (req, res, next) => {
  // 调用数据模型，查询导航数据
  options.find('nav_menus', (err, rows) => {
    // 查询到数据后，value 字段才是真正需要的数据
    // 由于存储的为 json 字符串，需要将其转成数组
    // console.log(JSON.parse(rows[0].value));
    // 将最终结果挂载到 app.locals 便可以模板中全局使用
    app.locals.menus = JSON.parse(rows[0].value);
    next();
  })
})

// 挂载子路由
app.use('/admin', admin);
app.use('/', home);


// app.get('/', (req, res) => {
//   // res.send('Hello World!');

//   // 使用 render 方法渲染完整的页面
//   // 需要模板引擎辅助
//   res.render('index');
// });

// app.get('/admin', (req, res) => {
//   res.render('admin/index');
// });
