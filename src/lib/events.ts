// évènements défini par configuration
import { events } from 'env'

// évènements indispensables
const staticEvents = {
    points: {
        constructor(
            data: { groupe: string; add: number } | {
                groupe: string
                set: number
            },
        ) {
            return data
        },
    },
    journal: {
        constructor(data: { message: string; son?: string }) {
            return data
        },
    },
} as const

// Ces types (/ usines à gaz) sont très importants
// Ils déclenchent des erreurs losqu'un évènement n'est pas utilisé correctement
type Empty = Record<PropertyKey, undefined>

type StaticEventId = keyof typeof staticEvents
type DynEventId = keyof typeof events
type EventId = StaticEventId | DynEventId
type EventData<T extends EventId> = T extends StaticEventId
    ? typeof staticEvents[T]
    : T extends DynEventId ? typeof events[T]
    : never
type EventConstructor<T extends EventId> = 'constructor' extends
    keyof EventData<T>
    ? (EventData<T>['constructor'] extends (...args: any) => any
        ? EventData<T>['constructor']
        : never)
    : never
type EventParamsData<T extends EventId> = EventConstructor<T> extends never ? []
    : Parameters<EventConstructor<T>>
type EventReturnedData<T extends EventId> = EventConstructor<T> extends never
    ? Empty
    : ReturnType<EventConstructor<T>>
type EventBody<T extends EventId> =
    & Omit<EventData<T>, 'constructor'>
    & EventReturnedData<T>

type Event<T extends EventId> = {
    id: T
} & EventBody<T>

type Listener<T extends EventId = EventId> = (event: Event<T>) => Promise<void>
const listeners: Map<EventId, Listener[]> = new Map()

// Déclencher un évènement
export const emit = async <T extends EventId>(
    id: T,
    ...args: EventParamsData<T>
) => {
    const meta = id in events
        ? events[id as DynEventId]
        : id in staticEvents
        ? staticEvents[id as StaticEventId]
        : {}

    if ('constructor' in meta && typeof meta.constructor === 'function') {
        Object.assign(meta, meta.constructor(...args))
        // @ts-ignore On veut pas le constructeur sur l'objet event
        delete meta.constructor
    }
    const event: Event<T> = {
        id,
        ...(meta as EventBody<T>),
    }
    const callbacks = listeners.get(event.id)
    if (!callbacks) return

    for (const listen of callbacks) {
        await listen(event as unknown as Event<EventId>)
    }
}

// Executer du code lorsqu'un évènement est déclenché
export const listen = <T extends EventId>(id: T, listener: Listener<T>) => {
    if (listeners.has(id)) {
        listeners.get(id)!.push(listener as unknown as Listener)
    } else {
        listeners.set(id, [listener as unknown as Listener])
    }
}
