
// 针对 posts 表进行增删改查操作

// 导入 db 模块
const db = require('./db');

// 1. 查询文章列表
module.exports.select = (page, size, cb) => {
  // 编写 sql 语句
  // let sql = 'SELECT * FROM `posts`';

  // 假设每页 2 条 数据
  // 1   0, 2   (1-1)*2
  // 2   2, 2   (2-1)*2
  // 3   4, 2   (3-1)*2
  // n          (n-1)*2

  // LIMIT (n-1)*2, 2

  // 根据上述公式，计算得出每一页数据起始点
  let offset = (page - 1) * size;

  // 联表查询，
  let sql = 'SELECT posts.*, users.nickname, categories.name FROM `posts` LEFT JOIN `users` ON posts.user_id=users.id LEFT JOIN categories ON posts.category_id=categories.id LIMIT ?, ?';

  // 执行上述语句
  db.query(sql, [offset, size - 0], cb);
}

// 2. 统计文章的总数
module.exports.count = (cb) => {
  // 编写 sql 语句
  let sql = 'SELECT COUNT(*) AS total FROM `posts`';
  // 执行上述 sql 语句
  db.query(sql, (err, rows) => {
    if(!err) return cb(null, rows[0].total);
    cb(err);
  });
}

// 3. 插入文章数据
module.exports.insert = (data, cb) => {
  // 编写 sql 语句
  let sql = 'INSERT INTO `posts` SET ?';
  // 执行上述 sql 语句
  db.query(sql, data, cb);
}

// 4. 根据 id 删除文章
module.exports.delete = (id, cb) => {
  // 编写 sql 语句
  let sql = 'DELETE FROM `posts` WHERE id=?';
  // 执行上述的 sql
  db.query(sql, id, cb);
}

// 5. 根据 id 查询文章
module.exports.findPost = (id, cb) => {
  // 编写 sql 语句
  let sql = 'SELECT * FROM `posts` WHERE id=?';
  // 执行上述 sql 语句
  db.query(sql, id, cb);
}

// 6. 根据 id 更新文章
module.exports.update = (data, cb) => {
  // 提取文章 id
  let id = data.id;

  // 文章 id 为主键，不允许修改
  delete data.id;

  // 编写 sql 语句
  let sql = 'UPDATE `posts` SET ? WHERE id=?';
  // 执行 sql 语句
  db.query(sql, [data, id], cb);
}

// 7. 统计（草稿）文章数量
module.exports.drafted = (cb) => {
  // 编写 sql
  let sql = 'SELECT COUNT(*) AS total FROM `posts` WHERE status="drafted"';
  // 执行上述语句
  db.query(sql, cb);
}