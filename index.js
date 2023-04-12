const { Configuration, OpenAIApi } = require('openai');
const line = require('@line/bot-sdk');
const { personality } = require('./personality.js');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'ap-northeast-1' });
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const client = new line.Client({
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
});

exports.handler = async (event) => {
    console.log('event:', JSON.stringify(event));

    const message = event.events[0].message.text;
    const userId = event.events[0].source.userId;
    const timestamp = event.events[0].timestamp;
    const replyToken = event.events[0].replyToken;

    const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: personality },
            { role: 'user', content: message },
        ],
    });

    const replyMessage = {
        type: 'text',
        text: completion.data.choices[0].message.content,
    };

    // DynamoDBに会話を保存
    await putDynamoDB(userId, timestamp, message, replyMessage.text);

    // LINEに返信
    await client.replyMessage(replyToken, replyMessage);

    return {
        statusCode: 200,
        body: JSON.stringify('Message sent.'),
    };
};

/**
 * DynamoDBに会話履歴を保存
 * @param {*} userId
 * @param {*} timestamp
 * @param {*} message
 * @param {*} replyMessage
 */
const putDynamoDB = async (userId, timestamp, message, replyMessage) => {
    const params = {
        TableName: 'baby_chat_history',
        Item: {
            user_id: { S: userId },
            timestamp: { N: timestamp.toString() },
            message: { S: message },
            replyMessage: { S: replyMessage },
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

// ■Todo
// DynamoDBに作成日を追加（created_at）
// DynamoDBに保存された直近の会話を取得し、会話の流れで返信
// 30秒以内に回答できなかった場合に、返信する内容を追加
