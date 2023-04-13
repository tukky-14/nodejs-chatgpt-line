const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'ap-northeast-1' });
const dayjs = require('dayjs');

/**
 * DynamoDBに会話履歴を保存
 * @param {*} userId
 * @param {*} timestamp
 * @param {*} message
 * @param {*} replyMessage
 */
exports.putDynamoDB = async (userId, timestamp, message, replyMessage) => {
    const now = dayjs().format('YYYYMMDDHHmmss');
    const params = {
        TableName: 'baby_chat_history',
        Item: {
            user_id: { S: userId },
            timestamp: { N: timestamp.toString() },
            message: { S: message },
            replyMessage: { S: replyMessage },
            created_at: { N: now },
        },
    };

    console.log('params:', params);

    await dynamodb.putItem(params, function (err, data) {
        if (err) {
            console.error('Unable to put item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    });
};
