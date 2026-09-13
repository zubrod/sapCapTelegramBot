using {my.events as db} from '../db/schema';

@path: '/events'
service EventService {

    entity Events        as projection on db.Events;
    entity TelegramUsers as projection on db.TelegramUsers;

    function importEvent()                          returns Events;

    function sendUpdate()                           returns Boolean;
    function sendSingleUpdate(chatId: Integer)      returns Boolean;

    action   subscribeTelegramUser(chatId: Integer) returns Boolean;

    action   getTicketLink(chatId: Integer);

}
