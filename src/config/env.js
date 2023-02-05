module.exports = {
    profile_api: process.env.PROFILE_API ? process.env.PROFILE_API : 'http://profile-api:1780/internal/',
    order_api: process.env.ORDER_API ? process.env.ORDER_API : 'http://order-api:1780/',
    product_api: process.env.PRODUCT_API ? process.env.PRODUCT_API : 'http://product-api:1780/',
    angokaSecret: 'dW1hIGNoYXZlIGFsZWF0w7NyaWEgcGFyYSBvIGFuZ28ta2EgZW5jb2RhZGEgY29tIGJhc2U2NCBxdWUgbsOjbyBkaXogYWJzb2x1dGFtZW50ZSBuYWRhIGNvbXByb21ldGVkb3I=',
};