class AbstractController {
    static responseError(res, status, message, payload){
        return res.status(status).json(
            {
                'success': false,
                'message': message,
                'payload': [payload]
            }
        );
    }

    static response(res, payload){
        return res.json(
            {
                'success': true,
                'message' : '',
                'payload' : payload
            }
        );
    }
}

module.exports = AbstractController;