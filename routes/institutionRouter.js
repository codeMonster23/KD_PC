var express = require('express');
var router = express.Router();
var institutionController = require('../controllers/institutionController');


router.get('/:institutionid', institutionController.home);
router.get('/microBook/:institutionid', institutionController.microBook);
router.get('/works/:institutionid', institutionController.works);


module.exports = router;
