
// 导入 db 模块，连接数据库
const db = require('./db');

// 1. 统计分类的数量
module.exports.count = (cb) => {
  // 编写sql
  let sql = 'SELECT COUNT(*) AS total FROM `categories`';
  // 执行 sql 
  db.query(sql, cb);
}

// 2. 查询分类列表
module.exports.select = (cb) => {
  // 编写 sql
  let sql = 'SELECT * FROM `categories`';
  // 执行 sql
  db.query(sql, cb);
}

// 3. 添加新分类
module.exports.insert = (data, cb) => {
  // 编写 sql
  let sql = 'INSERT INTO `categories` SET ?';
  // 执行 sql
  db.query(sql, data, cb);
}

// 4. 根据 id 删除分类
module.exports.delete = (id, cb) => {
  // 编写 sql
  let sql = 'DELETE FROM `categories` WHERE id=?';
  // 执行语句
  db.query(sql, id, cb);
}

// 5. 根据 id 查询某一分类数据
module.exports.findCategory = (id, cb) => {
  // 编写 sql 语句
  let sql = 'SELECT * FROM `categories` WHERE id=?';
  // 执行 sql 
  db.query(sql, id, (err, rows) => {
    if(!err) return cb(null, rows[0]);
    cb(err);
  });
}

// 6. 根据分类 id 更新分类
module.exports.update = (data, cb) => {
  // 提取 id
  let id = data.id;

  // id 为表的主键，不允许被修改
  delete data.id;

  // 编写 sql 
  let sql = 'UPDATE `categories` SET ? WHERE id=?';
  // 执行sql
  db.query(sql, [data, id], cb);
}