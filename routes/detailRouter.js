var express = require('express');
var router = express.Router();
var detailController = require('../controllers/detailController');

router.get('/workDetail', detailController.workDetail);
router.get('/workDetail/:idType', detailController.workDetail); // 推荐使用
router.get('/microBookDetail', detailController.microBookDetail);
router.post('/getMultimediaRecommendList', detailController.getMultimediaRecommendList);
router.get('/getMicroBookRecommendWorks/:id', detailController.getMicroBookRecommendWorks);
router.get('/getMicroBookRecommendMicroBooks/:id', detailController.getMicroBookRecommendMicroBooks);
router.get('/getOrgIdById/:id', detailController.getOrgIdById);

// 图集预览
router.get('/imgPreview', detailController.imgPreview);

// 后台 图集预览 无分享 点赞 评论 收藏功能
// router.get('/preview', detailController.preview);

router.get('/bookDetail/:id', detailController.showBookDetail);
router.get('/periodDetail/:id', detailController.showPeriodDetail);
router.get('/singlePeriodDetail/:id', detailController.showSinglePeriodDetail);
// router.get('/notSingleSellWorks', detailController.showNotSingleSellWorks);
router.get('/getBookDetail/:id', detailController.getBookDetail);
router.get('/getCommentList/:id', detailController.getCommentList);
router.get('/getBookHotBank', detailController.getBookHotBank);
router.get('/getSinglePeriodDetail/:id', detailController.getSinglePeriodDetail);
router.get('/getPeriodYear/:id', detailController.getPeriodYear);
router.get('/getPeriodListByYear/:id', detailController.getPeriodListByYear);
router.get('/getPeriodCatalog/:id', detailController.getPeriodCatalog);
router.get('/getLiteratureResult', detailController.getLiteratureResult);
router.get('/getPeriodColumn/:id', detailController.getPeriodColumn);
router.get('/getLiteratureByColumn/:id', detailController.getLiteratureByColumn);
// 是否为会员
// router.get('/checkVip', detailController.checkVip);
router.get('/isPurchase/:id', detailController.isPurchase);
module.exports = router;