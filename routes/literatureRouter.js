var express = require('express');
var router = express.Router();
var literatureController = require('../controllers/literatureController');


router.get('/', literatureController.home);
router.get('/literatureResult', literatureController.literatureResult);
router.get('/libraryResult', literatureController.libraryResult);
router.get('/getLiteratureSortList', literatureController.getLiteratureSortList);
router.get('/getLiteratureDetailSortList', literatureController.getLiteratureDetailSortList);
router.get('/getOrgListByKeyword', literatureController.getOrgListByKeyword);
router.get('/advancedSearch', literatureController.advancedSearch);
router.get('/channelSearch', literatureController.channelSearch);
router.get('/literatureDetail', literatureController.literatureDetail);
router.get('/literatureDetail/:fd', literatureController.literatureDetail);
router.get('/literatureDownload', literatureController.literatureDownload);
router.get('/download', literatureController.download);

// 文艺、文化、科普库
router.get('/library', literatureController.library);

// 获取相似文献
router.get('/getSimilarLiterature', literatureController.getSimilarLiterature);
// 获取文献图片
router.get('/getLiteraturePics', literatureController.getLiteraturePics);
// 获取往期期刊
router.get('/getPastPeriod', literatureController.getPastPeriod);

// 文艺、文化、科普 频道
router.get('/library/channel', literatureController.channel);

// 文艺、文化、科普 期刊频道
router.get('/library/period', literatureController.period);

// 获取非学术库文章和期刊总数
router.get('/getArticleAndMagaCount', literatureController.getArticleAndMagaCount);

// 获取文献库推荐期刊数据
router.get('/getRecommendPeriod', literatureController.getRecommendPeriod);

// 大家都在看 获取首页作品分页列表（只提推荐作品）
router.get('/getRecommendWorks', literatureController.getRecommendWorks);

// 相关作品
router.get('/getRelatedWorks', literatureController.getRelatedWorks);

// 文献库检索页，相关微刊列表
router.get('/getSearchRelevantMicroBook', literatureController.getSearchRelevantMicroBook);

// 判断下载权限
router.get('/getDownloadRight', literatureController.getDownloadRight);

// 判断下载权限
router.get('/orgRightCheck', literatureController.orgRightCheck);

module.exports = router;
