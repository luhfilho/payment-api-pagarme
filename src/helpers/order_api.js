const { default: Axios } = require("axios");
const jwt_helper = require('../middlewares/helper_jwt');
const env = require('../config/env');
async function get_order_by_id(id, user_id)
{
    let url = `${env.order_api}order/${id}`;

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

async function change_order_status(id, status, ip, user_id){

    let url = `${env.order_api}order/${id}`;
    try {
        let jwt_token = await jwt_helper.create_jwt_internal()

        let response = await Axios.put(url, { clientIp : ip, user_id : user_id, 'status': status }, {
            headers: {
                Authorization: jwt_token
            }
        });
        return response;
    } catch (error) {
        console.log(error);
        return false;
    }

}

async function aprove_order_payment(id, ip, user_id)
{
    let url = `${env.order_api}order/payment/approve/${id}`;
    try {
        let jwt_token = await jwt_helper.create_jwt_internal()

        let response = await Axios.put(url, {clientIp : ip, user_id:user_id }, {
            headers: {
                Authorization: jwt_token
            },
        });
        return response;
    } catch (error) {
        console.log(error);
        return false;
    }

}

module.exports = {
    get_order_by_id,
    change_order_status,
    aprove_order_payment
};