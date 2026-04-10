const TelegramBot = require('node-telegram-bot-api');

// التوكن يأتي من البيئة (Render)
const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

// قناتك
const CHANNEL_ID = '@CoronaryQuestions';

bot.on('message', async (msg) => {
    const text = msg.text;
    if (!text) return;

    const questions = text.split(/\n\s*\n/);

    for (let q of questions) {
        const lines = q.split('\n');

        if (lines.length < 5) continue;

        const question = lines[0].replace(/^\d+\.\s*/, '').trim();

        let options = [];
        let correctIndex = -1;

        for (let i = 1; i <= 4; i++) {
            let option = lines[i];

            option = option.replace(/^[A-D]\)\s*/, '').trim();

            if (option.includes('✅')) {
                correctIndex = i - 1;
                option = option.replace('✅', '').trim();
            }

            options.push(option);
        }

        if (correctIndex === -1) continue;

        try {
            await bot.sendPoll(
                CHANNEL_ID,
                question,
                options,
                {
                    type: 'quiz',
                    correct_option_id: correctIndex,
                    is_anonymous: false
                }
            );
        } catch (err) {
            console.log(err.message);
        }
    }
});
