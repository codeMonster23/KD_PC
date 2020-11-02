var express = require('express');
var router = express.Router();
var paymentController = require('../controllers/paymentController');
/*payPages*/
router.get('/checkout', paymentController.checkoutOrder);
router.get('/membersCheckout', paymentController.membersCheckout);
router.get('/paySuccess', paymentController.paySuccess);
router.get('/confirmPay', paymentController.confirmPay);
router.get('/success', paymentController.success);
router.get('/modal', paymentController.modal);
router.get('/fail', paymentController.fail);
router.get('/generateAlipayEWM', paymentController.generateAlipayEWM);

module.exports = router;