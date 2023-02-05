config = require('../config/sendmail');
// import entire SDK
var AWS = require('aws-sdk');

// Set the region 
AWS.config.update({ region: 'us-east-2' });

// Create an SQS service object
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

async function sendmail(html, to, subject) {
    return new Promise((res, rej) => {
        let message = Buffer.from(JSON.stringify({ 'html': html, 'to': to, 'from': config.from, 'subject' : `[organization] ${subject}` })).toString('base64');
        console.log(message);
        let time = new Date().getTime();
        var params = {
            // Remove DelaySeconds parameter and value for FIFO queues
            MessageAttributes: {},
            MessageBody: message,
            MessageDeduplicationId: to + time.toString(),  // Required for FIFO queues
            MessageGroupId: config.sqs_group,  // Required for FIFO queues
            QueueUrl: config.sqs_queue
        };

        sqs.sendMessage(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                rej(err)
            } else {
                console.log("Success", data.MessageId);
                res(data);
            }
        });
    });
}



module.exports = sendmail;