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

            if (text.includes("/getticketlink")) {
                const eventService = await cds.connect.to("EventService")
                eventService.send("getTicketLink", { chatId: chatId })
            }

            if (text.includes("/subscribemail")) {
                const eventService = await cds.connect.to("MailService")

                const parts = text.split(" ");

                if (parts.length !== 2) {
                    res.sendStatus(200);
                } else {

                    eventService.send("sendMail", {
                        to: parts[1],
                        subject: "Event Update",
                        text: "Das Event wurde aktualisiert."
                    })
                }
            }



        }

        res.sendStatus(200);
    });
});

module.exports = cds.server; // wichtig: Standard-CAP-Server weiterlaufen lassen!