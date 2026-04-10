const express = require('express');
const app = express();

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

    // ==============================
    // 1. Detect Title Block
    // ==============================
    const titleMatch = text.match(/🔻{7}\s*\n([\s\S]*?)\n🔻{7}/);

    let hasTitle = false;
    let titleMessageId = null;

    if (titleMatch) {
        hasTitle = true;

        const title = titleMatch[1].trim();

        const sentTitle = await bot.sendMessage(
            CHANNEL_ID,
            `🔻🔻🔻🔻🔻🔻🔻\n${title}\n🔻🔻🔻🔻🔻🔻🔻`
        );

        try {
            await bot.pinChatMessage(CHANNEL_ID, sentTitle.message_id);
        } catch (err) {
            console.log("Pin error:", err.message);
        }
    }

    // ==============================
    // 2. If it's just "done message"
    // ==============================
    if (text.includes('✅✅✅ تم بحمد الله')) {
        await bot.sendMessage(CHANNEL_ID, '✅✅✅ تم بحمد الله ✅✅✅');
        return;
    }

    // ==============================
    // 3. Extract questions
    // ==============================
    const lines = text.split('\n');

    let questionsBlock = [];
    let current = [];

    for (let line of lines) {
        if (/^\d+\.\s/.test(line)) {
            if (current.length) questionsBlock.push(current.join('\n'));
            current = [line];
        } else {
            if (current.length) current.push(line);
        }
    }

    if (current.length) questionsBlock.push(current.join('\n'));

    // ==============================
    // 4. Send MCQs
    // ==============================
    for (let q of questionsBlock) {
        const qLines = q.split('\n');

        if (qLines.length < 5) continue;

        const question = qLines[0].replace(/^\d+\.\s*/, '').trim();

        let options = [];
        let correctIndex = -1;

        for (let i = 1; i <= 4; i++) {
            let option = qLines[i].replace(/^[A-D]\)\s*/, '').trim();

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
});
