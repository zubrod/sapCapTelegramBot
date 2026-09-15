import cds from '@sap/cds';
import Gemini from './handler/gemini.js';


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;

const WEBHOOK_URL = "https://ladle-pentagram-palm.ngrok-free.dev/subscribe";

export class TelegramService extends cds.ApplicationService {

    async init() {

        this.setWebhook()

        this.on("processTextbyAI", async (req) => {
            const chatId = req.data.chatId
            const text = req.data.text


            const user = await SELECT.one.from("TelegramUsers").where({ chatId: chatId })

            const ai = new Gemini();

            const response = await ai.process(text)

            await this.sendMessageToUser(user, response);


        })

        this.on("updateEmail", async (req) => {
            const chatId = req.data.chatId
            const email = req.data.email


            const user = await SELECT.one.from("TelegramUsers").where({ chatId: chatId })

            if (user.emailSubscribed && !user.email) {
                await UPDATE.entity("TelegramUsers").set({ email: email }).where({ chatId: chatId })
                await this.sendMessageToUser(user, "Email Adresse geupdatet");

            }

        })

        this.on("subscribeEmail", async (req) => {
            const chatId = req.data.chatId


            const user = await SELECT.one.from("TelegramUsers").where({ chatId: chatId })

            if (!user.emailSubscribed) {
                await UPDATE.entity("TelegramUsers").set({ emailSubscribed: true }).where({ chatId: chatId })
                await this.sendMessageToUser(user, "Geben Sie jetzt ihre Email Adresse ein. Nichts weiter");

            }

        })

        this.on("unsubscribeEmail", async (req) => {
            const chatId = req.data.chatId


            const user = await SELECT.one.from("TelegramUsers").where({ chatId: chatId })

            if (user.emailSubscribed) {
                await UPDATE.entity("TelegramUsers").set({ emailSubscribed: false, email: null }).where({ chatId: chatId })
                await this.sendMessageToUser(user, "Sie bekommen keine Emails mehr");
            }

        })

        this.on("subscribeTelegramUpdate", async (req) => {
            const chatId = req.data.chatId

            const user = await SELECT.one.from("TelegramUsers").where({ chatId: chatId })


            if (!user.telegramSubscribed) {
                await UPDATE.entity("TelegramUsers").set({ telegramSubscribed: true }).where({ chatId: chatId })
                await this.sendMessageToUser(user, "Updates sind nun eingeschaltet");

            }
        })



        this.on("getTicketLink", async (req) => {

            const chatId = req.data.chatId

            const user = await SELECT.one.from("TelegramUsers").where({
                chatId: chatId
            })

            let events = await SELECT.one.from("Events") || [];

            this.sendMessageToUser(user, events.shop_link)
        })


        this.on("sendUpdate", async (req) => {

            let users = await SELECT.from("TelegramUsers") || [];

            let events = await SELECT.one.from("Events") || [];

            for (const user of users) {
                if (user.telegramSubscribed) {
                    await this.sendMessageToUser(user, this.getFormattedMessage(events.total_tickets))
                }

                if (user.emailSubscribed) {
                    await this.sendMail(user, this.getFormattedMessage(events.total_tickets))
                }

            }
        })

        this.on("subscribeTelegramUser", async (req) => await this.onSubscribeTelegramUser(req))


        const messaging = await cds.connect.to("messaging");
        messaging.on("soldTicketsUpdated", async msg => {
            await this.send("sendUpdate")
        })

        return super.init();
    }

    async onSubscribeTelegramUser(req) {
        const chatId = req.data.chatId;

        if (!chatId) {
            return false;
        }
        const result = await UPSERT.into("TelegramUsers").entries({ chatId: chatId })

        return true;

    }

    async setWebhook() {
        const response = await fetch(
            TELEGRAM_API_URL + "setWebhook",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: WEBHOOK_URL,
                }),
            }
        );
    }

    getFormattedMessage(totalTickets) {
        return "Sold total ticket: " + totalTickets
    }

    async sendMail(user, msg) {
        const mailService = await cds.connect.to("MailService")

        mailService.send("sendMail", { to: user.email, subject: "Ticket Update", text: msg })
    }

    async sendMessageToUser(user, msg) {
        return await fetch(
            TELEGRAM_API_URL + "sendMessage",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: user.chatId,
                    text: msg
                })
            }
        )
    }

}