module.exports = {
    redis_host : process.env.REDIS_HOST ? process.env.REDIS_HOST : 'locahost',
    redis_port : process.env.REDIS_PORT ? process.env.REDIS_PORT : '1179',
    redis_db : process.env.REDIS_DB ? process.env.REDIS_DB : '0',
};