const PagarMe = require('./libs/pagar-me');

async function main(){
    let pagarme = new PagarMe();
    await pagarme.connect();
    try {
        let response = await pagarme.client.recipients.create();
        
    } catch (error) {
        console.log('====================================');
        console.log(error.response);
        console.log('====================================');
        return;
    }
    console.log(response);
};

main();