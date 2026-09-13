import cds from '@sap/cds'


const EXTERNAL_EVENT_ID = "KvXAWekRF1GoEzhEZGFALLjzs8heQDvA"

const API_URL =
    'https://content.hopfner.cc/api/presale/KvXAWekRF1GoEzhEZGFALLjzs8heQDvA/?format=json'


export class EventService extends cds.ApplicationService {

    async init() {

        this.on('importEvent', async (req) => await this.onImportEvent(req))

        await this.schedule("importEvent", {}).every('60m')

        return super.init();
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
            const messaging = await cds.connect.to("messaging")
            messaging.emit("soldTicketsUpdated", { totalTickets: data.total_tickets })
        }

        // Event zurückgeben
        return await SELECT.one
            .from('Events').where();
    }

}