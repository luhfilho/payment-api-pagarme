var express = require('express');
var router = express.Router();
const IndexController = require('../controllers/IndexController');
const PaymentController = require('../controllers/PaymentController');
const recipient_router = require('./recipient');
const jwt_middleware = require('../middlewares/jwt');
/* GET home page. */
router.get('/', IndexController.get);

router.use('/recipient', recipient_router);
router.get('/payment/installments', jwt_middleware, PaymentController.calcInstallments);
router.get('/payment/pagarme', jwt_middleware, PaymentController.getPagarMeKeys);
router.get('/payment', jwt_middleware, PaymentController.findByUser);
router.get('/payment/:id', jwt_middleware, PaymentController.get);
router.post('/payment', jwt_middleware, PaymentController.makePayment);
router.put('/payment/:id', jwt_middleware, PaymentController.update);
router.delete('/payment/:id', jwt_middleware, PaymentController.remove);

module.exports = router;
