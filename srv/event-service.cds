using {my.events as db} from '../db/schema';

@path: '/events'
service EventService {

    entity Events as projection on db.Events;

    function importEvent() returns Events;

}
