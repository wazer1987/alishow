
// 导入 mysql 模块
const mysql = require('mysql');

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'baixiu'
});

module.exports = db;