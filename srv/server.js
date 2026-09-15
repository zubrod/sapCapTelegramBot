// srv/server.js
const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
    // app ist die zugrunde liegende Express-App
    app.post('/subscribe', require('express').json(), async (req, res) => {
        const update = req.body;

        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text;

            if (!text) {
                res.sendStatus(200);
                return;
            }

            if (text === "/start" || text.includes("/start@")) {
                const telegramService = await cds.connect.to("TelegramService")
                telegramService.send("subscribeTelegramUser", { chatId: chatId })
            }

            if (text === "/subscribe" || text.includes("/subscribe@")) {
                const telegramService = await cds.connect.to("TelegramService")
                telegramService.send("subscribeTelegramUpdate", { chatId: chatId })
            }

            if (text === "/getticketlink" || text.includes("/getticketlink@")) {
                const telegramService = await cds.connect.to("TelegramService")
                telegramService.send("getTicketLink", { chatId: chatId })
            }

            if (text === "/subscribemail" || text.includes("/subscribemail@")) {
                const telegramService = await cds.connect.to("TelegramService")
                telegramService.send("subscribeEmail", {
                    chatId: chatId
                })
            }

            if (text === "/unsubscribeemail" || text.includes("/unsubscribeemail@")) {
                const telegramService = await cds.connect.to("TelegramService")
                telegramService.send("unsubscribeEmail", {
                    chatId: chatId
                })
            }


            if (update.message.entities) {

                if (update.message?.entities[0].type === "email") {
                    const telegramService = await cds.connect.to("TelegramService")
                    telegramService.send("updateEmail", { chatId: chatId, email: text })
                }
            }


            if (update.message.text) {
                const telegramService = await cds.connect.to("TelegramService")
                telegramService.send("processTextbyAI", { chatId: chatId, text: text })
            }



        }

        res.sendStatus(200);
    });
});

module.exports = cds.server; // wichtig: Standard-CAP-Server weiterlaufen lassen!