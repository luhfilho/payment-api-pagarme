const AbstractController = require('./AbstractController');
const helpers = require('../helpers/functions');
const { ObjectId } = require('mongodb');
const profile_api = require('../helpers/profile_api');
const order_api = require('../helpers/order_api');
const product_api = require('../helpers/product_api');
const PagarMe = require('../libs/pagar-me');
const env = require('../config/env');
const pagarme_conf = require('../config/pagarme');
const Recipient = require('../models/Recipient');
const Payment = require('../models/Payment');
const AngoKa = require('ango-ka')(env.angokaSecret);

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

class PaymentController extends AbstractController {
    static async findByUser(req, res, next) {
        return PaymentController.response(res, [{}]);
    }

    static async get(req, res, next) {
        return PaymentController.response(res, [{}]);
    }

    static async getPagarMeKeys(req, res, next) {
        const keys = {
            pagarmeApiKey: pagarme_conf.api_key,
            pagarmeEncryptionKey: pagarme_conf.encryption_key,
        };
        const ret = AngoKa.encode(JSON.stringify(keys));
        return PaymentController.response(res, [ret]);
    }

    static async makePayment(req, res, next) {
        //receive order id
        let payment = new Payment();
        let installments = 1;
        if (!helpers.exists_and_has_value('order_id', req.body)) {
            return PaymentController.responseError(res, 422, 'order id is required');
        }

        if (!helpers.exists_and_has_value('card_hash', req.body)) {
            return PaymentController.responseError(res, 422, 'card_hash is required');
        }

        if (helpers.exists_and_has_value('installments', req.body)) {
            installments = parseInt(req.body.installments);
        }

        let order_id = req.body.order_id;
        //receive card hash
        let card_hash = req.body.card_hash;
        let user = req.User;
        let cpf = null;
        let telphone = null;

        //get order data
        let order_data = await order_api.get_order_by_id(order_id, req.User.id);
        if (order_data.length == 0) {
            return PaymentController.responseError(res, 404, 'no order found');
        }

        if (order_data.status == 'approved') {
            return PaymentController.responseError(res, 400, 'order already paid');
        }

        for (let i in user.UserDatas) {
            let row = user.UserDatas[i];
            let user_metadata = row.UserMetadata;

            if (user_metadata['name'] == 'cpf') {
                cpf = row.value;
            } else if (user_metadata['name'] == 'telphone') {
                telphone = row.value;
            }
        }

        // if (telphone == null) {
        telphone = order_data.telephone;
        // }

        // if (cpf == null) {
        cpf = order_data.cpf;

        //     console.log('====================================');
        //     console.log(order_data.cpf);
        //     console.log('====================================');
        // }
        if (telphone === null || telphone == '') {
            console.log('====================================');
            console.log('error with telphone');
            console.log(order_data.telephone);
            console.log(telphone);
            console.log('====================================');
            telphone = '+5511984601698';
        }
        if (cpf === null) {
            return PaymentController.responseError(res, 422, 'cpf is required');
        }

        let amount = order_data.total_price;

        let commerce_data = null
        if (order_data.commerce_user_id == null) {
            return PaymentController.responseError(res, 404, 'no commerce data found');
        }

        commerce_data = await profile_api.get_user_by_id(order_data.commerce_user_id, req.User.id);
        let commerce_recipient_id = null
        if (commerce_data.length == 0) {
            return PaymentController.responseError(res, 404, 'no commerce data found')
        }
        commerce_data = commerce_data[0];
        let recipient = new Recipient();
        recipient = await recipient.findOne({
            users_id: commerce_data.id
        });

        if (recipient == null) {
            return PaymentController.responseError(res, 404, 'no recipient data found')
        }

        commerce_recipient_id = recipient.getRecipients_id();
        //get creator data
        let creator_data = null;
        let creator_recipient_id = null;
        if (order_data.creator_user_id !== null) {
            console.log('getting creator data');
            creator_data = await profile_api.get_user_by_id(order_data.creator_user_id, req.User.id);
            if (creator_data.length == 0) {
                return PaymentController.responseError(res, 404, 'no commerce creator data found')
            }

            creator_data = creator_data[0];

            let recipient = new Recipient();
            recipient = await recipient.findOne({
                users_id: creator_data.id
            });

            if (recipient == null) {
                return PaymentController.responseError(res, 404, 'no creator recipient data found')
            }

            creator_recipient_id = recipient.getRecipients_id();
        }

        let agency_data = null;
        let agency_recipient_id = null;
        if (order_data.agency_user_id !== null) {
            console.log('getting agency data');
            agency_data = await profile_api.get_user_by_id(order_data.agency_user_id, req.User.id);
            if (agency_data.length >= 1) {
                agency_data = agency_data[0];

                let recipient = new Recipient();
                recipient = await recipient.findOne({
                    users_id: agency_data.id
                });

                if (recipient !== null) {
                    agency_recipient_id = recipient.getRecipients_id();
                }
            }
        }

        let products = [];
        //get products data
        if (order_data.products.length == 0) {
            return PaymentController.responseError(res, 422, 'no products found at order');
        }

        for (let i in order_data.products) {
            let row = order_data.products[i];
            let products_id = row.products_id;
            let product_data = await product_api.get_product_by_id(products_id, req.User.id);
            if (product_data.length == 0) {
                continue;
            }
            product_data = product_data[0];
            let product_name = product_data.name;
            let amount = row.amount;
            let unity_price = row.unity_price;
            let price_cent = parseInt(unity_price * 100);
            let product_obj = {
                id: products_id,
                title: product_name,
                quantity: amount,
                unit_price: price_cent,
                tangible: true
            };

            products.push(product_obj);
        }

        //make split data
        let total_commissions = 0;
        let commission_amount = Math.ceil(amount * 100);
        let organization_commission_amount = Math.ceil(commission_amount * order_data.organization_commission);
        let remaining_amount = commission_amount - organization_commission_amount;
        let store_amount = commission_amount - organization_commission_amount;
        total_commissions += organization_commission_amount;
        let split_data = [];
        let organization_commission = {
            recipient_id: pagarme_conf.organization_recipient_id,
            amount: parseInt(organization_commission_amount),
            liable: true,
            charge_processing_fee: true,
        };

        split_data.push(organization_commission);

        if (creator_data !== null && order_data.creator_commission > 0) {
            let creator_commission_amount = Math.ceil(store_amount * order_data.creator_commission);

            remaining_amount = remaining_amount - creator_commission_amount;
            let creator_commission = {
                recipient_id: creator_recipient_id,
                amount: creator_commission_amount,
                liable: false,
                charge_processing_fee: false,
            };
            total_commissions += creator_commission_amount;
            split_data.push(creator_commission);
        }

        if (agency_recipient_id !== null && agency_data !== null && order_data.agency_commission > 0) {
            //agency_user_id
            let agency_commission_amount = Math.ceil(store_amount * order_data.agency_commission);

            remaining_amount = remaining_amount - agency_commission_amount;
            let agency_commission = {
                recipient_id: agency_recipient_id,
                amount: agency_commission_amount,
                liable: false,
                charge_processing_fee: false,
            };
            total_commissions += agency_commission_amount;
            split_data.push(agency_commission);
        }

        let commerce_commission = {
            recipient_id: commerce_recipient_id,
            amount: parseInt(commission_amount - total_commissions),
            liable: false,
            charge_processing_fee: false,
        };
        split_data.push(commerce_commission);

        //make transaction
        let document_type = cpf.length === 11 ? 'cpf' : 'cnpj';
        let customer = {
            external_id: req.User.id.toString(),
            name: req.User.name,
            type: document_type === 'cpf' ? 'individual' : 'corporation',
            country: 'br',
            email: req.User.email,
            documents: [
                {
                    "type": document_type,
                    "number": cpf
                }
            ],
            phone_numbers: [telphone],
        };

        order_data.billing_address = order_data.billing_address.zip_code;
        let billing = {
            "name": req.User.name,
            "address": {
                "country": "br",
                "state": order_data.billing_address.state,
                "city": order_data.billing_address.city,
                "neighborhood": order_data.billing_address.city,
                "street": order_data.billing_address.street,
                "street_number": order_data.billing_address.number,
                "zipcode": order_data.billing_address.zip_code.replace('-', '')
            }
        };

        let delivery_date = new Date();
        delivery_date.setDate(delivery_date.getDate() + 1);
        delivery_date.setDate(delivery_date.getDate() + order_data.days_to_delivery);


        let shipping = {
            "name": req.User.name,
            "fee": order_data.delivery_tax,
            "delivery_date": formatDate(delivery_date),
            "expedited": false,
            "address": {
                "country": "br",
                "state": order_data.state,
                "city": order_data.city,
                "neighborhood": order_data.city,
                "street": order_data.street,
                "street_number": order_data.number,
                "zipcode": order_data.zip_code.replace('-', '')
            }
        };

        let pagarme = new PagarMe();
        await pagarme.connect();
        let transaction = null;
        let ip = '127.0.0.1';
        let installments_object = {};
        if (installments > 1) {
            try {
                installments_object = await pagarme.calc_installments(amount);
                installments_object = installments_object.installments;

                amount = installments_object[installments.toString()]['amount'];
            } catch (error) {
                return PaymentController.responseError(res, 500, 'error calculating installments', error);
            }
        }

        console.log('====================================');
        console.log(customer);
        console.log('====================================');

        try {

            transaction = await pagarme.create_transaction(products, card_hash, commission_amount, billing, shipping, customer, installments, split_data);
        } catch (error) {
            console.log(error.response.errors);
            await order_api.change_order_status(order_id, 'payment_refused', ip, req.User.id);
            return PaymentController.responseError(res, 400, 'error payment', error.response.errors);
        }

        if (transaction.status !== 'paid') {
            await order_api.change_order_status(order_id, 'payment_refused', ip, req.User.id);
            return PaymentController.responseError(res, 400, 'error payment', transaction);
        }
        await order_api.aprove_order_payment(order_id, ip, req.User.id);

        return PaymentController.response(res, [transaction])
    }

    static async update(req, res, next) {
        return PaymentController.response(res, [{}]);
    }

    static async remove(req, res, next) {
        return PaymentController.response(res, [{}]);
    }

    static async calcInstallments(req, res, next) {
        if (!('amount' in req.query) || req.query.amount == '' || req.query.amount == null || req.query.amount <= 0) {
            return PaymentController.responseError(res, 422, 'amount is required', [])
        }

        let amount = parseFloat(req.query.amount);
        let pagarme = new PagarMe();
        await pagarme.connect();
        let item = null;
        try {
            item = await pagarme.calc_installments(amount);
        } catch (error) {
            console.log('====================================');
            console.log(error.response.errors);
            console.log('====================================');
            return PaymentController.responseError(res, 400, 'error getting installment', error);
        }
        return PaymentController.response(res, [item]);
    }
}

module.exports = PaymentController;
