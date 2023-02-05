const { default: Axios } = require("axios");
const jwt_helper = require('../middlewares/helper_jwt');
const env = require('../config/env');
async function get_product_by_id(id, user_id)
{
    let url = `${env.product_api}${id}`;

    try {
        let jwt_token = await jwt_helper.create_jwt_internal()
        let response = await Axios.get(url, {
            headers: {
                Authorization: jwt_token
            },
            params : {
                user_id : user_id
            }
        });
        return response.data.payload;
    } catch (error) {
        console.log(error);
        return false;
    }

}


module.exports = {
    get_product_by_id
};