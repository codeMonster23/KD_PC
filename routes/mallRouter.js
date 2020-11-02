var express = require('express');
var router = express.Router();
var mallController = require('../controllers/mallController');

router.get('/home', mallController.showHome);
router.get('/booklist', mallController.showBooklist);
router.get('/booklistDetail', mallController.showBooklistDetail);
router.get('/rank', mallController.showRank);
router.get('/free', mallController.showFree);
router.get('/bookHome', mallController.showBookHome);
router.get('/magaHome', mallController.showMagaHome);
router.get('/category', mallController.showCategory);
router.get('/searchResult', mallController.showSearchResult);
router.get('/readerDownload', mallController.showReaderDownload);
router.get('/getMallIndex', mallController.getMallIndex);
router.get('/getMallBooklist', mallController.getMallBooklist);
router.get('/getBooklistCateGory', mallController.getBooklistCateGory);
router.get('/getBooklistDetail', mallController.getBooklistDetail);
router.get('/getRankList', mallController.getRankList);
router.get('/getRankingDetail', mallController.getRankingDetail);
router.get('/getMallBookIndex', mallController.getMallBookIndex);
router.get('/getMallMagaIndex', mallController.getMallMagaIndex);
router.get('/getCategory', mallController.getCategory);
router.get('/getCateBookList', mallController.getCateBookList);
router.get('/getCateMagaList', mallController.getCateMagaList);

module.exports = router;