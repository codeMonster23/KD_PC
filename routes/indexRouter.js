var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');

/* GET home page. */
router.get('/', indexController.newhome);
router.get('/home', indexController.newhome);
router.get('/discovery', indexController.discovery);
router.post('/discoveryMore', indexController.discoveryMore);
router.get('/microBook', indexController.microBook);
router.get('/works', indexController.works);
router.get('/kdh', indexController.kdh);
router.get('/offShelf', indexController.showOffShelf);
router.get('/appdownload', indexController.appdownload);
// 404和内容下架页推荐的作品和微刊
router.get('/getRecommendList', indexController.getRecommendList);
router.get('/getHomeData', indexController.getHomeData);
// 关于我们
router.get('/aboutus', indexController.showAboutus);
module.exports = router;