namespace my.events;

entity Events {
    key ID              : UUID;
        event_title     : String(255);
        event_date      : Timestamp;
        event_image_url : String(1000);
        total_tickets   : Integer;
        shop_link       : String(1000);
        fee             : Decimal(10, 2);
};


entity TelegramUsers {
    key chatId             : String(100) @assert.unique;
        email              : String(100);
        telegramSubscribed : Boolean default false;
        emailSubscribed    : Boolean default false;
};
