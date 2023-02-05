const InterfaceClass = require("./InterfaceClass");
const MongoAdapter = require('../libs/adapters/mongo_adapter');
const { ObjectID } = require("mongodb");
const helpers = require('../helpers/functions');
class AbstractClass extends InterfaceClass {

    constructor() {
        super(MongoAdapter);
        this.connector = new MongoAdapter();
        this._id = null;
        this.created_at = null;
        this.updated_at = null;
        this.deleted_at = null;
        this._removeAttr = { '_id': 1, '_removeAttr': 1, '_collection': 1, 'connector': 1 };
    }

    __clone(item) {
        let clone = { ...item };
        return clone;
    }

    async save() {
        if (this._id == null) {
            let response = await this.insert();
            let id = new ObjectID(response.ops[0]._id);
            this.setId(id);
            return response
        }
        else {
            return await this.update();
        }
    }

    async insert() {
        let self = this;
        this.created_at = new Date();
        this.updated_at = new Date();
        let dump = self.dump();
        let response = await this.connector.insert(this._collection, dump);
        let insert_id = response.ops[0]._id;
        this.setId(insert_id);
        return response;
    }

    /**
    * 
    * @param {Object} where 
    */
    async find(where = {}, limit = null, offset = null, sort = null) {
        where['deleted_at'] = null;
        let cursor = await this.connector.find(this._collection, where, limit, offset, sort);
        let result = [];
        for (let i in cursor) {
            let row = cursor[i];
            let item = new this.constructor();
            item.setId(row._id);
            for (let i in this) {

                if (i in this._removeAttr) {
                    continue;
                }

                let name = helpers.capitalize(i);
                name = `set${name}`;
                item[name](row[i]);
            }
            item.created_at = new Date(row.created_at);
            item.updated_at = new Date(row.updated_at);
            item.deleted_at = row.deleted_at == null ? null : new Date(row.deleted_at);
            result.push(item);
        }
        return result;
    }

    dump() {
        let self = this.__clone(this);
        delete self['constructor'];
        delete self['_collection'];
        delete self['connector'];
        delete self['_removeAttr'];
        return self;
    };

    async findOne(where) {
        where['deleted_at'] = null;
        let cursor = await this.connector.findOne(this._collection, where);
        if (cursor !== null) {
            let item = new this.constructor();
            for (let i in this) {

                if (i in this._removeAttr) {
                    continue;
                }

                let name = helpers.capitalize(i);
                name = `set${name}`;
                item[name](cursor[i]);
            }
            item.setId(cursor._id);
            item.created_at = new Date(cursor.created_at);
            item.updated_at = new Date(cursor.updated_at);
            item.deleted_at = cursor.deleted_at == null ? null : new Date(cursor.deleted_at);
            return item;
        }

        return null;
    }

    async get(id) {
        let where = { _id: new ObjectID(id) };
        return await this.findOne(where);
    }

    async remove() {
        this.updated_at = new Date();
        let where = { _id: new ObjectID(this._id) };
        let data = { deleted_at: new Date() };

        return await this.connector.update(this._collection, where, data);
    }

    async update() {
        this.updated_at = new Date();
        let where = { _id: new ObjectID(this._id) };
        let data = this.dump();
        delete data['_id'];
        return await this.connector.update(this._collection, where, data);
    }

    getId() {
        return this._id;
    }

    setId(id) {
        this._id = new ObjectID(id);
    }

    getCreated_at() {
        return this.created_at;
    };

    setCreated_at(value) {
        this.created_at = new Date(value);
    }

    getUpdated_at() {
        return this.updated_at;
    };

    setUpdated_at(value) {
        this.updated_at = new Date(value);
    }

    getDeleted_at() {
        return this.created_at;
    };

    setDeleted_at(value) {
        this.created_at = value == null ? null : new Date(value);
    }
}

module.exports = AbstractClass;