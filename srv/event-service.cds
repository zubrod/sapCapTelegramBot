using my.events from '../db/schema';

@path: '/events'
service EventService {

    entity Events  as projection on events.Events;
    entity Artists as projection on events.Artists;

    function importEvent()                          returns Events;

    function sendUpdate()                           returns Boolean;
    function sendSingleUpdate(chatId: Integer)      returns Boolean;

    action   subscribeTelegramUser(chatId: Integer) returns Boolean;

}
