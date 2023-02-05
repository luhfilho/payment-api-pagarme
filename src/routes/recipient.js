var express = require('express');
var router = express.Router();
const jwt_middleware = require('../middlewares/jwt');

const RecipientController = require('../controllers/RecipientController');
/* GET home page. */
router.use(jwt_middleware);
router.get('/', RecipientController.get);
router.post('/', RecipientController.create);
router.put('/', RecipientController.update);

module.exports = router;
