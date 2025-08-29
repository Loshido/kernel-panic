// évènements défini par configuration
import { events } from 'env'

// évènements indispensables
import { events as staticEvents } from '../events/mod.ts'

// Ces types (/ usines à gaz) sont très importants
// Ils déclenchent des erreurs losqu'un évènement n'est pas utilisé correctement
type Empty = Record<PropertyKey, undefined>

type StaticEventId = keyof typeof staticEvents
type DynEventId = keyof typeof events
type EventId = StaticEventId | DynEventId
type EventData<T extends EventId> = 
    T extends StaticEventId ? typeof staticEvents[T] : 
    T extends DynEventId ? typeof events[T] : 
    never
type EventConstructor<T extends EventId> = EventData<T> extends (...args: any) => any ? EventData<T> : never
type EventParamsData<T extends EventId> = EventConstructor<T> extends never ? []
    : Parameters<EventConstructor<T>>
type EventReturnedData<T extends EventId> = EventConstructor<T> extends never
    ? Empty
    : ReturnType<EventConstructor<T>>
type EventBody<T extends EventId = EventId> =
    & Awaited<EventReturnedData<T>>

export type Event<T extends EventId = EventId> = {
    id: T
} & EventBody<T>

export type Listener<T extends EventId = EventId> = (event: Event<T>) => (Promise<void> | void)
const listeners: Map<EventId, Listener[]> = new Map()

// Déclenche un évènement
export const dispatch = async <T extends EventId>(event: Event<T>) => {
    const callbacks = listeners.get(event.id)
    if (!callbacks) return
    
    for (const listen of callbacks) {
        await listen(event as unknown as Event<EventId>)
    }
}

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

    const event = {
        id
    }
    if (typeof meta === 'function') {
        Object.assign(event, await meta(...args))
    }
    
    await dispatch(event as unknown as Event)
}

// Executer du code lorsqu'un évènement est déclenché
export const listen = <T extends EventId>(id: T, listener: Listener<T>) => {
    if (listeners.has(id)) {
        listeners.get(id)!.push(listener as unknown as Listener)
    } else {
        listeners.set(id, [listener as unknown as Listener])
    }
}
