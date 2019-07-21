
// 创建子路由

const express = require('express');

const path = require('path');

// 引入 moment 时间处理模块
const moment = require('moment');

// 导入 multer 中间件
const multer  = require('multer');

// 调用 multer
// const upload = multer({dest: 'uploads/'});

// 配置上传文件的信息
const storage = multer.diskStorage({
  // 用来配置文件上传的位置
  destination: (req, file, cb) => {
    // 调用 cb 即可实现上传位置的配置
    cb(null, './public/uploads');
  },
  // 用来配置上传文件的名称（包含后缀）
  filename: (req, file, cb) => {
    // console.log(file);
    // 获取文件的后缀
    let ext = path.extname(file.originalname);
    // 拼凑文件名
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({storage: storage})

// 导入数据模型
const users = require('../model/users');
const posts = require('../model/posts');
const categories = require('../model/categories');
const comments = require('../model/comments');

const router = express.Router();

// 渲染后台网站首页
router.get('/', (req, res) => {

  // 1. 调用数据模型中的方法统计网站数据
  posts.count((err, post) => {
    // console.log(post);

    // 查询草稿文章数量
    posts.drafted((err, drafted) => {
      // console.log(drafted);

      // 查询分类的数量
      categories.count((err, category) => {
        // console.log(category);

        // 查询评论的数量
        comments.count((err, comment) => {
          // console.log(comment);

          // 查询待审核的评论数量
          comments.held((err, held) => {
            // console.log(held);

            res.render('admin/index', {
              post: post,
              drafted: drafted[0].total,
              category: category[0].total,
              comment: comment[0].total,
              held: held[0].total
            });
          })
        })
      });
    });
  })
})

// 渲染分类页面
router.get('/categories', (req, res) => {

  // 调用数据模型方法
  categories.select((err, rows) => {
    if(!err) {
      return res.render('admin/categories', {
        categories: rows,
        title: '添加分类',
        url: '/admin/categories/add'
      });
    }

    // 查询列表失败
    res.send('<h3>页面渲染失败!</h3>');
  })
})

// 接收表单的数据，添加分类逻辑
router.post('/categories/add', (req, res) => {
  // req.body 接收表单提交的参数

  // 调用模型中的方法，实现数据库的插入操作
  categories.insert(req.body, (err) => {
    if(!err) return res.json({code: 10000, msg: '添加成功!'});
    res.json({code: 10001, msg: '添加失败!'});
  });
})

// 接收分类id，实现删除分类逻辑
router.get('/categories/delete', (req, res) => {
  // req.query 来接收前端传过来的分类 id

  // 调用数据模型中的方法
  categories.delete(req.query.id, (err) => {
    if(!err) return res.json({code: 10000, msg: '删除成功啦!'});
    res.json({code: 10001, msg: '出错啦!'});
  });
})

// 渲染分类编辑页面
router.get('/categories/edit', (req, res) => {

  // 接收到地址上传过的分类id参数 req.query.id

  // 调用模型方法查询分类列表
  categories.select((err, rows) => {
    if(!err) {

      // 查找当前待编辑的分类数据
      categories.findCategory(req.query.id, (err, row) => {
        if(!err) {
          return res.render('admin/categories', {
            // 分类列表
            categories: rows,
            // 待编辑的分类数据
            category: row,
            title: '编辑分类',
            url: '/admin/categories/update'
          });
        }

        // 查询失败
        res.send('<h3>页面渲染失败!</h3>');
      });
    }
  });
})

// 接收表单数据，处理分类更新逻辑
router.post('/categories/update', (req, res) => {
  // 使用 req.body 接收表单的数据

  // 调用数据模型中的方法，实现分类数据的更新
  categories.update(req.body, (err) => {
    if(!err) return res.json({code: 10000, msg: '修改成功!'});
    res.json({code: 10001, msg: '修改失败!'})
  })
})

// 渲染后台网站文章列表
router.get('/posts', (req, res) => {

  // 获取地址参数（页码和每页数据条数）
  let {page=1, size=2} = req.query;

  // 通过数据库中数据的总条数 / 每页数据的条数 = 总页数
  posts.count((err, total) => {
    // 总条数
    // console.log(total);

    // 需要使用数据模型从数据库中取出数据
    posts.select(page, size, (err, rows) => {
      // console.log(err);

      // 对 rows 中所有的时间进行格式化（友好显示）处理
      rows.forEach((val) => {
        // console.log(val.created);
        // 2019-07-17
        val.created = moment(val.created).format('YYYY-MM-DD');
      })
      
      res.render('admin/posts', {
        posts: rows,
        // 总共的数据条数
        total: total,
        // 总共多少页
        number: Math.ceil(total / size),
        // 当前所在页码
        currentPage: page
      });
    })
  })
})

// 渲染添加文章页
router.get('/posts/add', (req, res) => {
  res.render('admin/addpost');
})

// 处理文章添加逻辑
router.post('/posts/add', (req, res) => {
  // 接收表单的数据 req.body

  // 文章作者为当前登录用户，所以从 session 中获取用户 id
  req.body.user_id = req.session.userInfo.id;

  // 调用数据模型，将表单数据写入数据
  posts.insert(req.body, (err) => {
    // console.log(err);
    if(!err) return res.json({code: 10000, msg: '添加文章成功!'});
    res.json({code: 10001, msg: '添加文章失败!'})
  })
})

// 删除文章逻辑
router.post('/posts/delete', (req, res) => {
  // req.body 接收文章id

  // 调用模型方法
  posts.delete(req.body.id, (err) => {
    if(!err) return res.json({code: 10000, msg: '删除成功!'});
    res.json({code: 10001, msg: '删除失败!'});
  });
})

// 渲染文章编辑页面
router.get('/posts/edit', (req, res) => {
  // 接收地址参数中的 id 值

  // 根据文章 id 调用数据模型方法，查询某一文章
  posts.findPost(req.query.id, (err, rows) => {

    // 需要处理时间的格式
    rows[0].created = moment(rows[0].created).format('YYYY-MM-DD');

    if(!err) return res.render('admin/editpost', rows[0]);
    res.send('<h3>页面渲染失败!</h3>');
  })
})

// 处理文章更新逻辑
router.post('/posts/update', (req, res) => {
  // 通过 req.body 获取表单数据

  // 调用数据模型方法，实现数据内容的更新
  posts.update(req.body, (err) => {
    console.log(err);
    if(!err) return res.json({code: 10000, msg: '修改成功!'});
    res.json({code: 10001, msg: '修改失败!'});
  })
})

// 渲染评论页面
router.get('/comments', (req, res) => {

  // 调用数据模型中的方法，查询评论列表
  comments.select((err, rows) => {

    // 时间需要处理成友好格式
    // 评论内容字数截取
    rows.forEach((val) => {
      // 时间显示格式
      val.created = moment(val.created).format('YYYY/MM/DD');
      val.content = val.content.slice(0, 30) + '...';
    })

    if(!err) return res.render('admin/comments', {comments: rows});
    res.send('<h3>页面渲染失败!</h3>');
  });
})

// 处理评论状态
router.post('/comments/handle', (req, res) => {
  // req.body 接收前端传过来的 id 和 status

  // 调用模型中的方法，实现状态的更新
  comments.update(req.body, (err) => {
    if(!err) return res.json({code: 10000, msg: '更新成功!'});
    res.json({code: 10001, msg: '更新失败!'});
  })
})

// 渲染后台网站登录页
router.get('/login', (req, res) => {
  res.render('admin/login');
})

// 处理登录逻辑
router.post('/login', (req, res) => {
  // 接收前端传过来的表单数据
  // 如果以 post 方式提交，通过 req.body 获取
  // 如果以 get 方式提交，通过 req.query 获取
  // console.log(req.body);

  // 查询数据库
  users.auth(req.body, (err, row) => {
    // 接收查询数据库的结果
    if(!err) {

      // 通过 session 来记录登录的状态
      // req.session.isLogin = true;

      // 为了方便后台页面中使用当前登录者的信息
      // 一般将 session 的值设置为登录者信息
      req.session.userInfo = row;

      return res.json({
        code: 10000,
        msg: '登录成功'
      })
    }

    res.json({
      code: 10001,
      msg: '登录失败！'
    })
  });
})

// 处理退出登录路由
router.get('/logout', (req, res) => {
  // 清空 session 中的登录信息
  req.session.userInfo = null;
  // 做出相应响应，例如跳转到登录页
  res.redirect('/admin/login');
})

// 渲染个人中心
router.get('/profile', (req, res) => {
  // 调用 users 数据模型中的 findUser 方法，查询用户信息

  // 用户的 id 记录在了 session 当中，即 req.session.userInfo.id
  // console.log(req.session.userInfo.id);
  users.findUser(req.session.userInfo.id, (err, row) => {
    // console.log(row);
    if(!err) return res.render('admin/profile', row);
    res.send('<h3>页面渲染失败!</h3>');
  });
})

// 处理文件上传
router.post('/uploader', upload.single('pic'), (req, res) => {
  // 如果 get 参数 使用 req.query
  // 如果 post 参数 使用 req.body （需要中间件支持）
  // 如果 文件数据 使用 req.file （需要中间件支持）
  // 官方推荐使用 multer 中间件，专门处理文件上传

  // console.log(req.file);
  // 将上传成功的文件信息响应给浏览器
  res.json(req.file);
})

// 处理用户信息更新
router.post('/profile/update', (req, res) => {
  // req.body 接收表单传过来的数据

  // 通过 req.session.userInfo.id 可获得用户的 id
  req.body.id = req.session.userInfo.id;

  // 调用数据模型存入数据库
  users.update(req.body, (err) => {
    if(!err) return res.json({code: 10000, msg: '更新成功!'});
    res.json({code: 10001, msg: '更新失败!'});
  });
})

// 渲染个修改密码页面
router.get('/password', (req, res) => {
  res.render('admin/password');
})

// 处理修改密码的逻辑
router.post('/password', (req, res) => {
  // 1. req.body 获得表单的数据

  // 检测原始密码是否正确？
  if(req.body.oldpassword != req.session.userInfo.password) {
    return res.json({code: 10001, msg: '原始密码错误!'});
  }

  // 2. 通过数据模型修改数据库中的数据
  // 从 session 中获取当前登录者的id
  req.body.id = req.session.userInfo.id;
  // 由于数据表中不存在 oldpassword 所以不需要传这个数据
  delete req.body.oldpassword;

  users.update(req.body, (err) => {
    if(!err) {
      // 清空登录状态
      req.session.userInfo = null;
      return res.json({code: 10000, msg: '修改密码成功!'});
    }
    res.json({code: 10000, msg: '修改密码失败!'});
  });
})

// 渲染用管理页面
router.get('/users', (req, res) => {

  // 通过数据模型查询所有用户
  users.select((err, rows) => {
    // console.log(rows)
    // 查询用户列表成功
    if(!err) return res.render('admin/users', {
      users: rows,
      title: '添加用户',
      url: '/admin/users/add'
    });
    res.send('<h3>渲染页面失败!</h3>');
  });
})

// 处理删除用户的逻辑
router.post('/users/delete', (req, res) => {
  // req.body 可以获得用户的 id
  // 通过数据模型实现用户数据的删除操作
  users.delete(req.body.id, (err) => {
    if(!err) return res.json({code: 10000, msg: '删除成功!'});
    res.json({code: 10001, msg: '删除失败!'});
  })
})

// 处理添加用户的逻辑
router.post('/users/add', (req, res) => {
  // 1. 使用 req.body 获取表单中的数据

  // 由于数据表中 status 不能为空
  req.body.status = 'actived';

  // 2. 使用数据模型操作数据库
  users.insert(req.body, (err) => {
    if(!err) return res.json({code: 10000, msg: '添加用户成功!'});
    res.json({code: 10001, msg: '添加用户失败!'});
  })
})

// 渲染用户编辑页面
router.get('/users/edit', (req, res) => {
  // 地址上 ? 后面的参数通过 req.query 获取
  // console.log(req.query.id);

  // 通过 数据模型 查询用户的信息
  users.findUser(req.query.id, (err, row) => {

    // 查询用户列表
    users.select((err, rows) => {
      res.render('admin/users', {
        // 当前要编辑的用户信息
        user: row,
        // 所有用户列表
        users: rows,
        title: '编辑用户',
        url: '/admin/users/update'
      });
    })
  })
})

// 处理修改用户的逻辑
router.post('/users/update', (req, res) => {
  // req.body 获取表单的数据
  console.log(req.body);

  // 调用users模型中的 updata 方法
  users.update(req.body, (err) => {
    if(!err) return res.json({code: 10000, msg: '修改成功!'});
    res.json({code: 10001, msg: '修改失败!'});
  })
})

module.exports = router;