var express = require('express');
var router = express.Router();
var commonController = require('../controllers/commonController');



router.get('/addCollect/:id', commonController.addCollect);
router.get('/cancelCollect/:id', commonController.cancelCollect);
router.get('/commentSubmit/:id', commonController.commentSubmit);

// 收藏或者取消收藏方法
router.get('/collectOrNot', commonController.collectOrNot);

// 收藏或者取消收藏方法
router.get('/praiseOrNot', commonController.praiseOrNot);

// 判断用户是否收藏
router.get('/isCollected', commonController.isCollected);

// 判断用户对评论是否点过赞
router.get('/isPraised', commonController.isPraised);

// 获取支付或者充值电商反馈
router.get('/getOrderFeedback', commonController.getOrderFeedback);

// 上传图片
router.post('/uploadImg', commonController.uploadImg);

// 提交反馈建议
router.post('/submitFeedback', commonController.submitFeedback);





module.exports = router;