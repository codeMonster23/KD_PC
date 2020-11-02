var express = require('express');
var router = express.Router();
var kdhController = require('../controllers/kdhController');


// router.get('/home', kdhController.home);
// router.get('/works', kdhController.works);
// router.get('/getWorksCategory', kdhController.getWorksCategory);
// router.get('/microbook', kdhController.microbook);
// router.get('/bookshop', kdhController.showBookshop);
// router.get('/bookshop/getPeriodAndBook', kdhController.getPeriodAndBook);
// router.get('/getBookCategory', kdhController.getBookCategory);
// router.get('/getBaseInfo', kdhController.getBaseInfo);
// router.get('/getPeriodYear', kdhController.getPeriodYear);
// router.get('/addOrCancelConcern', kdhController.addOrCancelConcern);
// router.get('/addOrCancelOrg', kdhController.addOrCancelOrg);


router.get('/home', kdhController.home);
router.get('/works', kdhController.works);
router.get('/getWorksCategory', kdhController.getWorksCategory);
router.get('/microbook', kdhController.microbook);
router.get('/bookshop', kdhController.showBookshop);
router.get('/bookshop/getPeriodAndBook', kdhController.getPeriodAndBook);
router.get('/getBookCategory', kdhController.getBookCategory);
router.get('/getBaseInfo', kdhController.getBaseInfo);
router.get('/getPeriodYear', kdhController.getPeriodYear);
router.get('/addOrCancelConcern', kdhController.addOrCancelConcern);

router.get('/addOrCancelOrg', kdhController.addOrCancelOrg);

module.exports = router;