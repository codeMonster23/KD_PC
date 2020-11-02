var express = require('express');
var router = express.Router();
var searchController = require('../controllers/searchController');


router.get('/home', searchController.showHome);
router.get('/works', searchController.showWorks);
router.get('/microbook', searchController.showMicrobook);
router.get('/period', searchController.showPeriod);
router.get('/book', searchController.showBook);
router.get('/kdh', searchController.showKdh);
router.get('/literature', searchController.showLiterature);
router.get('/getSearchResult', searchController.getSearchResult);

module.exports = router;
