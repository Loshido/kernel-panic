import { emit, Listener, Event } from 'lib/events.ts'
import { Endpoint } from './mod.ts'

const streams: Map<string, ReadableStreamDefaultController> = new Map()
const queues: Map<string, Set<Event>> = new Map() 

const encoder = new TextEncoder()
export const dispatchToStream: Listener = (event) => {
    if(!queues.has('global')) queues.set('global', new Set())
    const queue = queues.get('global')!.add(event)

    const length = queue.size
    setTimeout(() => {
        if(length !== queue.size) {
            return
        }
        const txt = JSON.stringify(Array.from(queue.values())) + '\n'
        queue.clear()
        const buffer = encoder.encode(txt)
        streams.forEach(stream => {
            stream.enqueue(buffer)
        })
    }, 50)
}

export const dispatchToSpecifiedStream = (id: string, event: Event) => {
    const stream = streams.get(id)
    if(!stream) return

    if(!queues.has(id)) queues.set(id, new Set())
    const queue = queues.get(id)!.add(event)

    const length = queue.size
    setTimeout(() => {
        if(length !== queue.size) {
            return
        }
        
        const txt = JSON.stringify(Array.from(queue.values())) + '\n'
        queue.clear()
        const buffer = encoder.encode(txt)
        stream.enqueue(buffer)
    }, 50)
}

export const score: Endpoint = {
    route: '/live',
    handler() {
        const id = Math.floor(Math.random() * 10E6).toString(36)
        
        const stream = new ReadableStream({
            start(controller) {
                streams.set(id, controller)
                emit('new-stream', id)
            },
            cancel() {
                streams.delete(id)
                queues.delete(id)
            },
        })

        return new Response(stream, {
            headers: {
                'content-type': 'application/octet-stream',
            },
        })
    },
}
