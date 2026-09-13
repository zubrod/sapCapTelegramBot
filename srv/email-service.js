import cds from "@sap/cds";
import nodemailer from "nodemailer";

export default class MailService extends cds.ApplicationService {

    async init() {
        await super.init();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });

        this.on("sendMail", async (req) => {
            const {
                to,
                subject,
                text
            } = req.data;

            if (!to || !subject || !text) {
                return req.error(
                    400,
                    "to, subject and text are required"
                );
            }

            await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                text
            });
        });
    }
}