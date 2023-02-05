const redis = require('redis');
const config = require('../../config/redis');
class CacheAdapter {
    /**
     * Constructor function
     */
    constructor() {
        this.host = config.redis_host;
        this.port = config.redis_port
        this.db = config.redis_db;
        this.client = null;
    }

    /**
     * Connection function
     */
    async connect() {
        this.client = await redis.createClient(this.port, this.host, {
            'db': this.db
        });
    };

    /**
     * Get value from key
     * @param {String} key 
     */
    get(key) {
        return new Promise((res, rej) => {
            this.client.get(key, (err, result) => {
                if (err) {
                    rej(err);
                }

                res(result);
            });
        });
    }

    /**
     * Set value from key, you can set expiration value too
     * @param {String} key 
     * @param {String} value 
     * @param {Int32Array} expires_at 
     */
    set(key, value, expires_at = null) {
        return new Promise((res, rej) => {
            if (expires_at == null) {
                this.client.set(key, value, (err, result) => {
                    if (err) {
                        rej(err);
                    }

                    res(result);
                })
            }
            else {
                this.client.set(key, value, 'EX', expires_at, (err, result) => {
                    if (err) {
                        rej(err);
                    }

                    res(result);
                });
            }
        })
    }

    /**
     * Remove value from key
     * @param {String} key 
     */
    delete(key) {
        return new Promise((res, rej) => {
            this.client.del(key, (err, result) => {
                if (err) {
                    rej(err);
                }

                res(result);
            });
        });
    }

    /**
     * Close connection
     */
    async close() {
        return await this.client.end();
    }
};

module.exports = CacheAdapter;