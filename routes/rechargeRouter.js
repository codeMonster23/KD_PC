var express = require('express');
var router = express.Router();
var rechargeController = require('../controllers/rechargeController');

// 充值首页
router.get('/home', rechargeController.home);
// 生成充值订单
router.get('/generateOrder', rechargeController.generateOrder);
// 支付宝订单状态查询
router.get('/orderCheck', rechargeController.orderCheck);

router.get('/alipayApp', rechargeController.alipayApp);

// 生成验证码
router.get('/captcha', rechargeController.captcha);
// 知网卡充值
router.get('/cnkiCard', rechargeController.cnkiCard);





router.get('/wechat', rechargeController.wechat);
router.get('/unionpay', rechargeController.unionpay);
router.get('/success', rechargeController.success);
router.get('/fail', rechargeController.fail);
router.get('/jemodal', rechargeController.jemodal);
router.get('/modal', rechargeController.modal);

module.exports = router;