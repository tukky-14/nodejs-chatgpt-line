const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const askChatGPT = async () => {
    const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'あなたはプロのITエンジニアです。' },
            { role: 'user', content: '良いコードとはどんなコードですか？' },
        ],
    });
    console.log(completion.data.choices[0].message.content);
};

askChatGPT();
