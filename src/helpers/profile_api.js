const { default: Axios } = require("axios");
const jwt_helper = require('../middlewares/helper_jwt');
const env = require('../config/env');
const jwt = require("../config/jwt");
async function get_user_by_id(id)
{
    let url = `${env.profile_api}id/${id}`;

    try {
        let jwt_token = await jwt_helper.create_jwt_internal()
        let response = await Axios.get(url, {
            headers : {
                Authorization: jwt_token
            }
        });
        return response.data.payload;
    } catch (error) {
        console.log(error);
        return false;
    }

}


module.exports = {
    get_user_by_id
};