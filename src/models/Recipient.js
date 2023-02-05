const { ObjectID } = require('mongodb');
const AbstractClass = require('./AbstractClass');

class Recipient extends AbstractClass {
    constructor() {
        super();
        this._collection = 'recipients';
        this.users_id = null;
        this.recipients_id = null;
    }

    getUsers_id(){
        return this.users_id;
    }
    getRecipients_id(){
        return this.recipients_id;
    }

    setUsers_id(value){
        this.users_id = value;
    }
    setRecipients_id(value){
        this.recipients_id = value;
    }
};

module.exports = Recipient;