
// 针对 users 表进行增删改查操作

const db = require('./db');

// function addUser() {}

// function deleteUser() {}

// module.exports.addUser = addUser;

// 1. 验证用户信息
module.exports.auth = (data, cb) => {
  // console.log('检测用户信息!');

  // 1. 查询前端传过来的用户信息
  let sql = 'SELECT * FROM `users` WHERE `email`=?';
  db.query(sql, data.email, (err, rows) => {
    // console.log(rows[0]);

    // 2. 检测密码是否正确
    // 用户数据库中的密码与表单提交的密码是否一致
    // console.log(rows[0].password);
    // console.log(data.password);
    if(rows.length && rows[0].password == data.password) {
      cb(null, rows[0]);
    } else {
      cb({msg: '服务器内部错误!'});
    }
  })
}

// 2. 根据用户 id 查询用户信息
module.exports.findUser = (id, cb) => {
  // 根据用户 id 编写 sql 语句
  let sql = 'SELECT * FROM `users` WHERE id=?';
  // 执行上述 sql 语句
  db.query(sql, id, (err, rows) => {
    // 查询成功
    if(!err) return cb(null, rows[0]);
    // 查询失败
    cb({msg: '查询失败!'});
  })
}

// 3. 根据用户 id 更新用户信息
module.exports.update = (data, cb) => {
  // 用户的 id
  let id = data.id;

  // update `users` set name="axx", id=1
  // 由于 id 为主键不允许被修改，所以应将 id 属性
  // 从 data 中删除！！
  delete data.id;

  // 根据 id 来编写更新语句
  let sql = 'UPDATE `users` SET ? WHERE `id`=?';
  // 执行上述语句
  db.query(sql, [data, id], (err) => {
    // console.log(err)
    // 更新成功!
    if(!err) return cb(null);
    cb({msg: '更新失败!'})
  })
}

// 4. 查询用户列表
module.exports.select = (cb) => {
  // 编写 sql 语句
  let sql = 'SELECT * FROM `users`';
  // 执行上述语句
  db.query(sql, (err, rows) => {
    if(!err) return cb(err, rows);
    cb(err)
  });
}

// 5. 根据用户 id 删除用户
module.exports.delete = (id, cb) => {
  // 编写 sql 语句
  let sql = 'DELETE FROM `users` WHERE id=?';
  // 执行上述sql
  db.query(sql, id, (err) => {
    if(!err) return cb(null);
    cb(err);
  })
}

// 6. 添加新用户
module.exports.insert = (data, cb) => {
  // 编写 sql 语句
  let sql = 'INSERT INTO `users` SET ?';
  // 执行上述语句
  db.query(sql, data, (err) => {
    console.log(err)
    if(!err) return cb(null);
    cb(err);
  })
}