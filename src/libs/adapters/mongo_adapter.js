let MongoClient = require('mongodb').MongoClient;
let config = require('../../config/mongodb');
const f = require('util').format;
const fs = require('fs');
class MongoAdapter {
    /**
     * Class constructor
     * @returns {void}
     */
    constructor() {
        this.host = config.mongodb_host;
        this.port = config.mongodb_port;
        this.db = config.mongodb_db;
        this.client = null;
        this.host_url = `${this.host}`;
    }

    /**
     * Connect to mongodb
     * @returns {Promise}
     */
    connect() {
        let self = this;
        let options = {}
        return new Promise((res, rej) => {
            if (config.use_rs == "true") {
                var ca = [fs.readFileSync("/app/rds-combined-ca-bundle.pem")];
                options = {
                    sslValidate: true,
                    sslCA: ca,
                    useNewUrlParser: true
                };
            }
            var client = MongoClient.connect(
                config.mongodb_host,
                options,
                function (err, client) {
                    if (err)
                        throw err;
                    self.client = client;
                    res(client);
                });
        });
    }

    /**
     * Get indexes from a collection
     * @param {String} collection  
     * @returns {Promise}
     */
    getIndexes(collection) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            //@todo
            const db = this.client.db(this.db);
            collection = db.collection(collection);

            let indexes = db.collection.getIndexes();
            await this.close();

            res(indexes);
        });
    };

    /**
     * Create an index in a collection
     * @param {String} collection 
     * @param {Object} index 
     * @returns {Promise}
     */
    createIndex(collection, name, index) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();
            //@todo
            const db = this.client.db(this.db);
            collection = db.collection(collection);

            let object = index;

            console.log('====================================');
            console.log(object);
            console.log('====================================');
            let response = await collection.createIndexes(object, {
                name: name
            });
            res(response);
            await this.close();
        });
    };

    /**
     * Remove index from a collection
     * @param {String} collection 
     */
    removeIndex(collection) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            //@todo
            const db = this.client.db(this.db);
            collection = db.collection(collection);
            await this.close();
        });
    };

    /**
     * Count total of rows from a collection with where clause
     * @param {String} collection 
     * @param {Object} where
     * @returns {Promise} 
     */
    count(collection, where = {}) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            //@todo
            const db = this.client.db(this.db);
            collection = db.collection(collection);

            let cursor = await collection.count(where);

            await this.close();

            res(cursor);
        });
    };

    /**
     * Get only one row from a collection with where clause
     * @param {String} collection 
     * @param {Object} where
     * @returns {Promise} 
     */
    findOne(collection, where = {}, sort = null) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            //@todo
            const db = this.client.db(this.db);
            collection = db.collection(collection);
            let options = {}
            if (sort !== null) {
                options['sort'] = sort
            }
            let cursor = await collection.findOne(where, options);
            // let result = await cursor.toArray();
            await this.close();
            res(cursor);
        });
    }

    /**
     * Get all rows from a collection or with pagination limit/offset
     * @param {String} collection 
     * @param {Object} where
     * @param {Int32Array} limit
     * @param {Int32Array} offset
     * @param {Object} sort
     * @returns {Promise} 
     */
    find(collection, where = {}, limit = null, offset = null, sort = null) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            const db = this.client.db(this.db);
            collection = db.collection(collection);
            let options = {}
            if (sort !== null) {
                options['sort'] = sort
            }
            let cursor = await collection.find(where, options);

            if (offset !== null) {
                cursor = cursor.skip(offset);
            }

            if (limit !== null) {
                cursor = cursor.limit(limit);
            }
            let result = await cursor.toArray();
            await this.close();
            res(result)
        });
    };

    /**
     * 
     * @param {String} collection 
     * @param {Object} where 
     * @param {Object} data
     * @returns {Promise} 
     */
    update(collection, where = {}, data = {}) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            const db = this.client.db(this.db);
            collection = db.collection(collection);
            let options = {
                multi: true
            };
            let cursor = await collection.updateMany(where, { '$set': data }, options);
            this.close();

            res(cursor);
        });
    };

    /**
     * Remove item from collection
     * @param {*} collection 
     * @param {*} where 
     */
    remove(collection, where = {}) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            //@todo
            const db = this.client.db(this.db);
            collection = db.collection(collection);
            let options = {
            }

            let cursor = collection.deleteMany(where, options);
            await this.close();
            res(cursor);
        });
    };

    insert(collection, data) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            //@todo
            const db = this.client.db(this.db);
            collection = db.collection(collection);
            let cursor = await collection.insert(data)
            await this.close();
            res(cursor);
        });
    }

    upsert(collection, data, where) {
        let self = this;
        return new Promise(async (res, rej) => {
            await self.connect();

            const db = this.client.db(this.db);
            collection = db.collection(collection);
            let options = {
                upsert: true
            };
            let cursor = await collection.updateOne(where, { '$set': data }, options);
            this.close();

            res(cursor);
        });
    }

    /**
     * close client connection
     * @returns {void}
     */
    async close() {
        await this.client.close();
        return;
    }
};

module.exports = MongoAdapter;