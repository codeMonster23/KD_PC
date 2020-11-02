var express = require('express');
var router = express.Router();
var userCenterController = require('../controllers/userCenterController');

// 登录界面
router.get('/login', userCenterController.login);

// 登录验证
router.get('/loginChecking', userCenterController.loginChecking);

// 注册
router.get('/register', userCenterController.register);

// 退出登录
router.get('/loginOut', userCenterController.loginOut);

// 验证手机号
router.get('/verifyPhoneNum', userCenterController.verifyPhoneNum);

// 发送验证码
router.get('/sendCaptcha', userCenterController.sendCaptcha);

// 注册
router.get('/signIn', userCenterController.signIn);

// 修改用户信息
router.get('/updateUserInfo', userCenterController.updateUserInfo);

// 添加用户兴趣分类
router.get('/addUserCategory', userCenterController.addUserCategory);

// 用户注册协议隐私
router.get('/registerProtocol', userCenterController. registerProtocol);

// 第三方登录
router.get('/thirdLogin', userCenterController. thirdLogin);

// 手机demo
router.get('/phoneDemo', userCenterController. phoneDemo);
module.exports = router;