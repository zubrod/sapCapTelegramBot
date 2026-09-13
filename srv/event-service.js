import cds from '@sap/cds'


const EXTERNAL_EVENT_ID = "KvXAWekRF1GoEzhEZGFALLjzs8heQDvA"

const API_URL =
    'https://content.hopfner.cc/api/presale/KvXAWekRF1GoEzhEZGFALLjzs8heQDvA/?format=json'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;

const WEBHOOK_URL = "https://ladle-pentagram-palm.ngrok-free.dev/subscribe";

export class EventService extends cds.ApplicationService {

    async init() {

        this.setWebhook()


        this.on("getTicketLink", async (req) => {

            const chatId = req.data.chatId

            const user = await SELECT.one.from("TelegramUsers").where({ chatId: chatId.toString() })

            this.sendSingleUpdateToUser(user.chatId, "https://pretix.eu/carousel/20261006-metal-carousel/")
        })

        this.on("sendSingleUpdate", async (req) => {

            const chatId = req.data.chatId

            const user = await SELECT.one.from("TelegramUsers").where({ chatId: chatId.toString() })

            if (!user) {
                return;
            }

            let events = await SELECT.one.from("Events") || [];

            await this.sendSingleUpdateToUser(user.chatId, this.getFormattedMessage(events.total_tickets))
        })

        this.on("sendUpdate", async (req) => {

            let users = await SELECT.from("TelegramUsers") || [];

            let events = await SELECT.one.from("Events") || [];

            for (const user of users) {
                await this.sendSingleUpdateToUser(user.chatId, this.getFormattedMessage(events.total_tickets))
            }
        })

        this.on("subscribeTelegramUser", async (req) => await this.onSubscribeTelegramUser(req))

        this.on('importEvent', async (req) => await this.onImportEvent(req))


        this.on("eventImported", async msg => {
            await this.send("sendUpdate")
        })



        await this.schedule("importEvent", {}).every('60m')

        return super.init();
    }

    async onSubscribeTelegramUser(req) {
        const chatId = req.data.chatId;

        if (!chatId) {
            return false;
        }
        const result = await UPSERT.into("TelegramUsers").entries({ chatId: chatId })

        if (result === 1) {
            const queue = cds.queued(this)
            await queue.send("sendSingleUpdate", { chatId: chatId });
        }

        return true;

    }

    async onImportEvent(req) {
        // Externe API aufrufen

        const response = await fetch(API_URL)

        if (!response.ok) {
            return req.error(
                502,
                `External API returned ${response.status} ${response.statusText}`
            )
        }

        const data = await response.json()

        // Daten validieren
        if (!data.event_title) {
            return req.error(400, 'event_title is missing')
        }

        // Event-ID erzeugen
        const eventID = cds.utils.uuid()

        // Event speichern
        const existing = await SELECT.one
            .from('Events');


        if (!existing) {
            await INSERT.into('Events').entries({
                ID: eventID,
                event_title: data.event_title,
                event_date: data.event_date,
                event_image_url: data.event_image_url,
                total_tickets: data.total_tickets,
                shop_link: data.shop_link,
                fee: data.fee,
                //  externalEventID: EXTERNAL_EVENT_ID
            });
        } else if (existing.total_tickets !== data.total_tickets) {
            await UPDATE('Events')
                .set({
                    event_title: data.event_title,
                    event_date: data.event_date,
                    event_image_url: data.event_image_url,
                    total_tickets: data.total_tickets,
                    shop_link: data.shop_link,
                    fee: data.fee
                })
                .where({ externalEventID: EXTERNAL_EVENT_ID });

        }

        if (!existing || existing.total_tickets !== data.total_tickets) {
            this.emit("eventImported")
        }

        // Event zurückgeben
        return await SELECT.one
            .from('Events').where();
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

    async sendSingleUpdateToUser(chatId, msg) {
        return await fetch(
            TELEGRAM_API_URL + "sendMessage",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: msg
                })
            }
        )
    }

}