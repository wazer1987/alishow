
// 导入 db 模块，连接数据库
const db = require('./db');

// 1. 统计评论的数量
module.exports.count = (cb) => {
  // 编写sql
  let sql = 'SELECT COUNT(*) AS total FROM `comments`';
  // 执行 sql 
  db.query(sql, cb);
}

// 2. 统计待审核评论数量
module.exports.held = (cb) => {
  // 编写 sql 语句
  let sql = 'SELECT COUNT(*) AS total FROM `comments` WHERE status="held"';

  // 执行 sql 语句
  db.query(sql, cb);
}

// 3. 查询评论列表
module.exports.select = (cb) => {
  // 编写 sql
  let sql = 'SELECT comments.*, posts.title FROM `comments` LEFT JOIN `posts` ON comments.post_id=posts.id ORDER BY id DESC LIMIT 0, 10';
  // 执行 sql
  db.query(sql, cb);
}

// 4. 修改评论数据
module.exports.update = (data, cb) => {
  // 提取 id
  let id = data.id;

  // id 为主键不允许修改，所以将其删除
  delete data.id;

  // 编写 sql 语句
  let sql = 'UPDATE `comments` SET ? WHERE id=?';

  // 执行 sql
  db.query(sql, [data, id], cb);
}