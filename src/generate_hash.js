const config = require('./config/pagarme');

const PagarMe = require('pagarme');

async function main() {
    let pagarme = PagarMe;
    let client = await pagarme.client.connect({ api_key: config.api_key, encryption_key: config.encryption_key });


    const card = {
        card_number: '4111111111111111',
        card_holder_name: 'abc',
        card_expiration_date: '1225',
        card_cvv: '123',
    }

    let item = await client.security.encrypt(card);

    console.log(item);
};

main();