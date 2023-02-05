const pagarme = require('pagarme');
const config = require('../config/pagarme');

class PagarMe {
    constructor(){
        this.client = null;
    }

    async connect(){
        this.client = await pagarme.client.connect({ api_key: config.api_key, encryption_key: config.encryption_key });
    }

    async create_recipient(data){
        return await this.client.recipients.create(data);
    };

    async get_recipient(recipient_id){
        return await this.client.recipients.find({ id: recipient_id});
    }

    async update_recipient(id, data){
        data['recipient_id'] = id;
        data['id'] = id;
        return await this.client.recipients.update({ id : id, recipient_id : id}, data)
    }


    async calc_installments(amount){
        let free_installments, max_installments, interest_rate;
        free_installments = 3;
        max_installments = 6;
        interest_rate = 3.99;
        let response = await this.client.transactions.calculateInstallmentsAmount({
            amount : parseInt(amount * 100),
            free_installments: free_installments,
            max_installments: max_installments,
            interest_rate: interest_rate
        });


        let installments = {};
        for(let i in response.installments)
        {
            let row = response.installments[i];
            response.installments[i]['amount'] = parseFloat(row.amount / 100);
            response.installments[i]['installment_amount'] = parseFloat(row.installment_amount / 100);
        }
        return response;
    }

    async create_transaction(products, card_hash, amount, billing, shipping, customer, installments, comissions){
        let params_request = {
            "async" : false,
            "capture" : true,
            "amount": amount,
            "installments": installments,
            "card_hash": card_hash,
            "customer": customer,
            "billing": billing,
            "shipping": shipping,
            "items": products,
            "split_rules" : comissions
        };
        console.log('====================================');
        console.log(comissions);
        console.log('====================================');
        let response = await this.client.transactions.create(params_request);
        return response;
    }

    async capture_transaction(id)
    {
        try {
            let response = await this.client.transactions.capture({id: id});
    
            return response;
        } catch (error) {
            console.log(error.response.errors)
            return error;
        }
    }

    async create_card_hash(card_number, card_holder_name, card_expiration_date, card_cvv)
    {
        let card = {
            card_number: card_number,
            card_holder_name: card_holder_name,
            card_expiration_date: card_expiration_date,
            card_cvv: card_cvv,
        };
        
        let hash  = await this.client.security.encrypt(card);

        return hash;
    }
}

module.exports = PagarMe;