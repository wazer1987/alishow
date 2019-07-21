
// 导入 db 模块，连接数据库
const db = require('./db');

// 1. 根据条件查询数据
module.exports.find = (key, cb) => {
  // 编写 sql
  let sql = 'SELECT * FROM `options` WHERE `key`=?';
  // 执行 sql
  db.query(sql, key, cb);
}