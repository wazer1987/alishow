
// 创建子路由

const express = require('express');

// 引入数据模型
const options = require('../model/options');

const router = express.Router();

// 渲染前台网站首页
router.get('/', (req, res) => {

  // 调用数据模型，查询首页轮播图数据
  options.find('home_slides', (err, rows) => {
    // console.log(rows[0].value);
    // 将查询到的结果 rows[0].value 转换成数组
    let slides = JSON.parse(rows[0].value);
    
    // 渲染模板
    res.render('index', {slides: slides});
  });

  
})

// 渲染文章列表页
router.get('/list', (req, res) => {
  res.render('list');
})

// 渲染文章详情页
router.get('/detail', (req, res) => {
  res.render('detail');
})

module.exports = router;