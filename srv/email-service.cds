service MailService {

    action sendMail(to: String,
                    subject: String,
                    text: String);
}
