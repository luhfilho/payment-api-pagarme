const { ObjectID } = require('mongodb');
const AbstractClass = require('./AbstractClass');

class Payment extends AbstractClass {
    constructor() {
        super();
        this._collection = 'payments';
        this.users_id = null;
        this.orders_id = null;
        this.installments = null;
        this.card_data = {};
        this.price = null;
        this.zip_code = null;
        this.latitude = null;
        this.longitude = null;
        this.street = null
        this.number = null;
        this.complement = null;
        this.city = null;
        this.state = null;
        this.ip_address = null;

    }

    getUsers_id(){
        return this.users_id;
    }
    getOrders_id(){
        return this.orders_id;
    }
    getCard_data(){
        return this.card_data;
    }
    getInstallments(){
        return this.installments;
    }
    getPrice(){
        return this.price;
    }
    getZip_code(){
        return this.zip_code;
    }
    getLatitude(){
        return this.latitude;
    }
    getLongitude(){
        return this.longitude;
    }
    getStreet(){
        return this.street;
    }
    getNumber(){
        return this.number;
    }
    getComplement(){
        return this.complement;
    }
    getCity(){
        return this.city;
    }
    getState(){
        return this.state;
    }
    getDelivery_price(){
        return this.delivery_price;
    }
    getIp_address(){
        return this.ip_address;
    }

    setUsers_id(value){
        this.users_id = value;
    }
    setInstallments(value){
        this.installments = value;
    }
    setOrders_id(value){
        this.orders_id = new ObjectID(value);
    }
    setCard_data(value){
        this.card_data = value;
    }
    setPrice(value){
        if (isNaN(value)) {
            throw "value is not a float value"
        }
        this.price = parseFloat(value);
    }
    setZip_code(value){
        this.zip_code = value;
    }
    setLatitude(value){
        this.latitude = value;
    }
    setLongitude(value){
        this.longitude = value;
    }
    setStreet(value){
        this.street = value;
    }
    setNumber(value){
        this.number = value;
    }
    setComplement(value){
        this.complement = value;
    }
    setCity(value){
        this.city = value;
    }
    setState(value){
        this.state = value;
    }
    setIp_address(value){
        this.ip_address = value;
    }
};

module.exports = Payment;