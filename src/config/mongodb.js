module.exports = {
    mongodb_host: process.env.MONGO_HOST ? process.env.MONGO_HOST : 'mongodb://localhost/profile',
    use_rs: process.env.MONGO_USE_RS ? process.env.MONGO_USE_RS : "false",
    mongodb_port: process.env.MONGO_PORT ? process.env.MONGO_PORT : '27017',
    mongodb_db: process.env.MONGO_DB ? process.env.MONGO_DB : 'profile'
};