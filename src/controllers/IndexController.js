const AbstractController = require('./AbstractController');
class IndexController extends AbstractController{
    static async get(req, res, next){
        return IndexController.response(res, [{}]);
    }
}

module.exports = IndexController;