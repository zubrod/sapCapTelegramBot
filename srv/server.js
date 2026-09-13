// srv/server.js
const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
    // app ist die zugrunde liegende Express-App
    app.post('/subscribe', require('express').json(), async (req, res) => {
        const update = req.body;

        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            if (text.includes("/subscribe")) {
                const eventService = await cds.connect.to("EventService")
                eventService.send("subscribeTelegramUser", { chatId: chatId })
            }

        }

        res.sendStatus(200);
    });
});

module.exports = cds.server; // wichtig: Standard-CAP-Server weiterlaufen lassen!