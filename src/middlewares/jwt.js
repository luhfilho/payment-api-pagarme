const helper_jwt = require('../middlewares/helper_jwt');
async function jwt_middleware(req, res, next) {
    // receive data from headers
    if (!('authorization' in req.headers)) {
        res.status(401).json({
            'success': false,
            'message': 'Not authorized',
            'payload': []
        });

        return;
    }
    const authorization = req.headers.authorization;

    // verify is token exists
    if (typeof authorization == 'undefined' || authorization == null || authorization == '') {
        res.status(402).json({
            'success': false,
            'message': 'Not authorized',
            'payload': []
        });
        return;
    }

    // verify if token matches with internal secret
    let verify_internal_token = await helper_jwt.verifyInternal(authorization);

    if (!verify_internal_token) {

        // verify if token matches with external secret
        let verify_external_token = await helper_jwt.verifyExternal(authorization);

        if (!verify_external_token.success) {
            return res.status(403).json({
                'success': false,
                'message': 'Not authorized',
                'payload': []
            });
        } else {
            req.Token = verify_external_token.payload[0];
            req.User = verify_external_token.payload[0].User;
        }
    } else {
        // verify body or query string
        if (!'user_id' in req.body || req.body.user_id == null || typeof req.body.user_id == 'undefined' || req.body.user_id == '') {
            if (!'user_id' in req.query || req.query.user_id == null || typeof req.query.user_id == 'undefined' || req.query.user_id == '') {
                return res.status(422).json({
                    'success': false,
                    'message': 'user id is required',
                    'payload': []
                });
            } else {
                req.User = { id: req.query.user_id };
            }
        } else {
            req.User = { id: req.body.user_id };
        }
    }

    next();
}

module.exports = jwt_middleware;