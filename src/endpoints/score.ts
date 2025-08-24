import kv from '../kv.ts'
import { Endpoint } from './mod.ts'

const streams: Map<string, ReadableStreamDefaultController> = new Map()

export async function addScore(group: string, score: number) {
    const db = await kv()
    const old_score = await db.get<number>(['score', group])

    if (!old_score.value) return

    await db.set(['score', group], old_score.value + score)

    const encode = new TextEncoder().encode
    const payload = JSON.stringify([group, score + old_score.value])
    streams.forEach((stream) => {
        stream.enqueue(
            encode(payload),
        )
    })
}

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
                const encode = new TextEncoder().encode
                scores.forEach((score) => {
                    const payload = JSON.stringify([
                        score.key.at(1),
                        score.value,
                    ])
                    controller.enqueue(encode(payload))
                })

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
