import kv from 'lib/kv.ts'
import { Endpoint } from './mod.ts'
import { listen } from 'lib/events.ts'

const streams: Map<string, ReadableStreamDefaultController> = new Map()

listen('points', async (event) => {
    let score = 0
    const db = await kv()
    if ('set' in event) {
        await db.set(['score', event.groupe], event.set)
        score = event.set
    } else {
        const old_score = await db.get<number>(['score', event.groupe])
        if (old_score.value === null) return
        score = old_score.value + event.add
        await db.set(['score', event.groupe], score)
    }

    const encoder = new TextEncoder()
    const _payload = JSON.stringify([[event.groupe, score]])
    const payload = encoder.encode(_payload)
    streams.forEach((stream) => {
        stream.enqueue(payload)
    })
})

export const score: Endpoint = {
    route: '/score',
    async handler() {
        const id = Math.floor(Math.random() * 10E6).toString(36)
        const db = await kv()
        const scores = await Array.fromAsync(
            db.list<number>({ prefix: ['score'] }),
        )

        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder()
                const payload = JSON.stringify(
                    scores.map((s) => [s.key.at(1), s.value]),
                )
                controller.enqueue(encoder.encode(payload))

                streams.set(id, controller)
            },
            cancel() {
                streams.delete(id)
            },
        })

        return new Response(stream, {
            headers: {
                'content-type': 'application/octet-stream',
            },
        })
    },
}
