using {my.events as db} from '../db/schema';

@path: '/telegram'
service TelegramService {

    entity TelegramUsers as projection on db.TelegramUsers;

    function sendUpdate()                           returns Boolean;

    action   subscribeTelegramUser(chatId: Integer) returns Boolean;

    action   updateEmail(chatId: Integer, email: String);

    action   subscribeEmail(chatId: Integer);
    action   unsubscribeEmail(chatId: Integer);
    action   subscribeTelegramUpdate(chatId: Integer);

    action   processTextbyAI(chatId: Integer, text: String);

    action   getTicketLink(chatId: Integer);

}
