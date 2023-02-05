const AbstractController = require('./AbstractController');
const helpers = require('../helpers/functions');
const { ObjectId } = require('mongodb');
const env = require('../config/env');
const PagarMe = require('../libs/pagar-me');
const Recipient = require('../models/Recipient');
const { response } = require('./AbstractController');

class RecipientController extends AbstractController {
    static async create(req, res, next) {
        if (!helpers.exists_and_has_value('automatic_anticipation_enabled', req.body))
        {
            return RecipientController.responseError(res, 422, 'automatic_anticipation_enabled is required');
        }
        if (!helpers.exists_and_has_value('anticipatable_volume_percentage', req.body)) {
            return RecipientController.responseError(res, 422, 'anticipatable_volume_percentage is required');
        }
        if (!helpers.exists_and_has_value('bank_account', req.body)) {
            return RecipientController.responseError(res, 422, 'bank_account is required');
        }
        if (!helpers.exists_and_has_value('transfer_enabled', req.body)) {
            return RecipientController.responseError(res, 422, 'transfer_enabled is required');
        }
        if (!helpers.exists_and_has_value('transfer_interval', req.body)) {
            return RecipientController.responseError(res, 422, 'transfer_interval is required');
        }
        if (!helpers.exists_and_has_value('register_information', req.body)) {
            return RecipientController.responseError(res, 422, 'register_information is required');
        }
        if (!helpers.exists_and_has_value('transfer_day', req.body)) {
            return RecipientController.responseError(res, 422, 'transfer_day is required');
        }

        let automatic_anticipation_enabled = req.body.automatic_anticipation_enabled;
        let anticipatable_volume_percentage = req.body.anticipatable_volume_percentage;
        let bank_account = req.body.bank_account;
        let transfer_enabled = req.body.transfer_enabled;
        let transfer_interval = req.body.transfer_interval;
        let postback_url = `${env.profile_api}callbacks/update-recipient-status`;
        let register_information = req.body.register_information;
        let transfer_day = req.body.transfer_day;
        let recipient_object = {
            'automatic_anticipation_enabled': automatic_anticipation_enabled,
            'anticipatable_volume_percentage': anticipatable_volume_percentage,
            'bank_account': bank_account,
            'transfer_enabled': transfer_enabled,
            'transfer_interval': transfer_interval,
            'postback_url': postback_url,
            'transfer_day': transfer_day,
            'register_information': register_information

        };

        let pagarme = new PagarMe();
        await pagarme.connect();

        try {
            let response = await pagarme.create_recipient(recipient_object);
            let recipient_id = response.id;
            let users_id = req.User.id;

            let recipient = new Recipient();
            recipient.setUsers_id(users_id);
            recipient.setRecipients_id(recipient_id);
            await recipient.save();
            return RecipientController.response(res, [recipient.dump()]);
        } catch (error) {
            console.log('====================================');
            console.log(error.response.errors);
            console.log('====================================');
            return RecipientController.responseError(res, 400, 'error on saving user');
        }
    }

    static async update(req, res, next){
        let recipient = new Recipient();
        let users_id = req.User.id;
        if (!helpers.exists_and_has_value('automatic_anticipation_enabled', req.body)) {
            return RecipientController.responseError(res, 422, 'automatic_anticipation_enabled is required');
        }
        if (!helpers.exists_and_has_value('anticipatable_volume_percentage', req.body)) {
            return RecipientController.responseError(res, 422, 'anticipatable_volume_percentage is required');
        }
        if (!helpers.exists_and_has_value('bank_account', req.body)) {
            return RecipientController.responseError(res, 422, 'bank_account is required');
        }
        if (!helpers.exists_and_has_value('transfer_enabled', req.body)) {
            return RecipientController.responseError(res, 422, 'transfer_enabled is required');
        }
        if (!helpers.exists_and_has_value('transfer_interval', req.body)) {
            return RecipientController.responseError(res, 422, 'transfer_interval is required');
        }
        if (!helpers.exists_and_has_value('register_information', req.body)) {
            return RecipientController.responseError(res, 422, 'register_information is required');
        }
        if (!helpers.exists_and_has_value('transfer_day', req.body)) {
            return RecipientController.responseError(res, 422, 'transfer_day is required');
        }

        let automatic_anticipation_enabled = req.body.automatic_anticipation_enabled;
        let anticipatable_volume_percentage = req.body.anticipatable_volume_percentage;
        let bank_account = req.body.bank_account;
        let transfer_enabled = req.body.transfer_enabled;
        let transfer_interval = req.body.transfer_interval;
        let postback_url = `${env.profile_api}callbacks/update-recipient-status`;
        let register_information = req.body.register_information;
        let transfer_day = req.body.transfer_day;
        let recipient_object = {
            'automatic_anticipation_enabled': automatic_anticipation_enabled,
            'anticipatable_volume_percentage': anticipatable_volume_percentage,
            'transfer_enabled': transfer_enabled,
            'transfer_interval': transfer_interval,
            'postback_url': postback_url,
            'transfer_day': transfer_day,
            'register_information': register_information
        };

        recipient = await recipient.findOne({
            users_id: users_id,
        });

        if (recipient == null) {
            return RecipientController.responseError(res, 404, 'recipient not found');
        }

        let pagarme = new PagarMe();
        await pagarme.connect();
        try {
            let response = await pagarme.update_recipient(recipient.getRecipients_id(), recipient_object);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return RecipientController.responseError(res, 500, 'error updating data');
        }

        return RecipientController.response(res, [response]);
    }

    static async get(req, res, next) {
        let recipient = new Recipient();
        let users_id = req.User.id;
        recipient = await recipient.findOne({
            users_id: users_id,
        });

        if(recipient == null)
        {
            return RecipientController.responseError(res, 404, 'recipient not found');
        }

        let pagarme = new PagarMe();
        await pagarme.connect();

        let response = await pagarme.get_recipient(recipient.getRecipients_id());
        return RecipientController.response(res, [response]);
    }
}

module.exports = RecipientController;