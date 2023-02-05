const axios = require('axios');
const url = require('../config/env');
const jwt = require('jsonwebtoken');
const jwt_config = require('../config/jwt');

async function create_jwt_internal(){
    return await jwt.sign({Process : new Date()}, jwt_config.internal)
}

async function verifyInternal(token) {
    try {
        let token_verify = await jwt.verify(token, jwt_config.internal);
        return true;
    } catch (error) {
        return false;
    }
}

async function verifyExternal(token) {
    try {
        let internal_authorization = jwt.sign({ Process: new Date() }, jwt_config.internal);
        let buff = new Buffer.from(token);
        let user_token_base_64 = buff.toString('base64');

        const user = await axios.get(url.profile_api + user_token_base_64, {
            headers: {
                'authorization': internal_authorization
            }
        });
        return user.data;
    } catch (error) {
        return false;
    }
}

module.exports = {
    verifyExternal,
    verifyInternal,
    create_jwt_internal
}