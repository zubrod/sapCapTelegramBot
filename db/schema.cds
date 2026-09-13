namespace my.events;

entity Events {
    key ID              : UUID;
        event_title     : String(255);
        event_date      : Timestamp;
        event_image_url : String(1000);
        total_tickets   : Integer;
        shop_link       : String(1000);
        fee             : Decimal(10, 2);
        externalID      : String(100);

        artists         : Composition of many Artists
                              on artists.

                              event = $self;
}

entity Artists {
    key ID    : UUID;
        name  : String(255);

        event : Association to Events;
}

entity TelegramUsers {
    key chatId : String(100) @assert.unique;
}
