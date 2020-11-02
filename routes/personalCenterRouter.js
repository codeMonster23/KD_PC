var express = require('express');
var router = express.Router();
var personalCenterController = require('../controllers/personalCenterController');

router.get('/home', personalCenterController.home);
router.get('/purchased', personalCenterController.purchased);
router.get('/allyearPeriod', personalCenterController.allyearPeriod);
router.get('/collected', personalCenterController.collected);
router.get('/collectedDetail', personalCenterController.collectedDetail);
router.get('/follow', personalCenterController.follow);
router.get('/history', personalCenterController.history);
router.get('/connect', personalCenterController.connect);
router.get('/message', personalCenterController.message);
router.get('/transfer', personalCenterController.transfer);
router.get('/delWarn', personalCenterController.delWarn);
router.get('/cancelFollow', personalCenterController.cancelFollow);
router.get('/myAccount', personalCenterController.myAccount);
router.get('/myBills', personalCenterController.myBills);
router.get('/myBills', personalCenterController.myBills);
router.get('/myBillsConsumeRecord', personalCenterController.myBillsConsumeRecord);
router.get('/invoice', personalCenterController.invoice);
router.get('/invoiceInfo', personalCenterController.invoiceInfo);
router.get('/invoiceDetail', personalCenterController.invoiceDetail);
router.get('/invoiceDetail', personalCenterController.invoiceDetail);
router.get('/personalInfo', personalCenterController.personalInfo);
//左侧菜单获取用户名和头像
router.get('/menuInfo', personalCenterController.menuInfo);
//修改个人信息
router.post('/updatePersonalInfoA', personalCenterController.updatePersonalInfoA);
//修改兴趣分类
router.post('/updatePersonalInfoB', personalCenterController.updatePersonalInfoB);
//修改为自定义头像
router.post('/updatePersonalInfoC', personalCenterController.updatePersonalInfoC);
//上传头像返回链接
router.post('/uploadImg',personalCenterController.uploadImg);
//上传剪裁头像返回链接
router.post('/clipImg',personalCenterController.clipImg);
//修改密码
router.get('/updatePassword', personalCenterController.updatePassword);
// 验证手机号
router.get('/verifyPhoneNum', personalCenterController.verifyPhoneNum);
// 发送验证码
router.get('/sendCaptcha', personalCenterController.sendCaptcha);
//绑定手机号
router.get('/updatePhone', personalCenterController.updatePhone);
//是否是VIP会员
router.get('/isVip', personalCenterController.isVip);
router.get('/vip', personalCenterController.vip);
//会员详情
router.get('/vipDetail', personalCenterController.vipDetail);
router.get('/vipRecord', personalCenterController.vipRecord);
//提交发票信息
router.post('/submitInfo', personalCenterController.submitInfo);
//我的卡券
router.get('/myCoupon', personalCenterController.myCoupon);
// 左侧菜单会员导语设置
router.get('/getVipGuideWord', personalCenterController.getVipGuideWord);

// 浏览记录
router.get('/browseRecord', personalCenterController.browseRecord);



module.exports = router;