// évènements défini par configuration
import { events } from 'env'

// évènements indispensables
const staticEvents = {
    ddd: {
        journal: 'blabla',
        son: 'blabla',
    },
    dddd: {
        journal: 'blabla',
        points: 1000,
        aaaaaaa: 'aaaaaa',
    },
} as const

// Ces types (/ usines à gaz) sont très importants
// Ils déclenchent des erreurs losqu'un évènement n'est pas utilisé correctement
type StaticEventId = keyof typeof staticEvents
type DynEventId = keyof typeof events
type EventId = StaticEventId | DynEventId
type EventData<T extends EventId = EventId> = T extends StaticEventId
    ? typeof staticEvents[T]
    : T extends DynEventId ? typeof events[T]
    : never

type Event<T extends EventId = EventId> = {
    id: T
    cible: string // le groupe concerné
} & EventData<T>

type Listener<T extends EventId = EventId> = (event: Event<T>) => void
const listeners: Map<EventId, Listener[]> = new Map()

// Déclencher un évènement
export const emit = <T extends EventId = EventId>(id: T, cible: string) => {
    const meta = id in events
        ? events[id as DynEventId]
        : id in staticEvents
        ? staticEvents[id as StaticEventId]
        : {}
    const event: Event<T> = {
        id,
        cible,
        ...(meta as EventData<T>),
    }
    listeners.get(event.id)?.forEach((listen) => listen(event))
}

// Executer du code lorsqu'un évènement est déclenché
export const listen = <T extends EventId>(id: T, listener: Listener<T>) => {
    if (listeners.has(id)) {
        listeners.get(id)!.push(listener as Listener)
    } else {
        listeners.set(id, [listener as Listener])
    }
}
