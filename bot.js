const express = require('express');
const app = express();

// Web server (مهم لـ Render)
app.get('/', (req, res) => {
    res.send('Bot is alive');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

const CHANNEL_ID = '@CoronaryQuestions';

bot.on('message', async (msg) => {
    const text = msg.text;
    if (!text) return;

    const parts = text.split('\n\n');

    const title = parts[0].trim();
    const questionsText = parts.slice(1).join('\n\n').trim();

    // إرسال العنوان
    const sentTitle = await bot.sendMessage(
        CHANNEL_ID,
        `🔻🔻🔻🔻🔻🔻🔻\n${title}\n🔻🔻🔻🔻🔻🔻🔻`
    );

    // تثبيت العنوان
    try {
        await bot.pinChatMessage(CHANNEL_ID, sentTitle.message_id);
    } catch (err) {
        console.log("Pin error:", err.message);
    }

    if (!questionsText) return;

    const questions = questionsText.split(/\n\s*\n/);

    for (let q of questions) {
        const lines = q.split('\n');

        if (lines.length < 5) continue;

        const question = lines[0].replace(/^\d+\.\s*/, '').trim();

        let options = [];
        let correctIndex = -1;

        for (let i = 1; i <= 4; i++) {
            let option = lines[i].replace(/^[A-D]\)\s*/, '').trim();

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
                    correct_option_id: correctIndex
                }
            );
        } catch (err) {
            console.log("Poll error:", err.message);
        }
    }

    await bot.sendMessage(
        CHANNEL_ID,
        '✅✅✅ تم بحمد الله ✅✅✅'
    );
});
