import { listen } from 'lib/events.ts'
import { Endpoint } from './mod.ts'

async function lireLignes(n: number): Promise<string> {
    // lis N lignes
    const lignes = await Deno.readTextFile('./data/journal.txt')
    return lignes.split('\n').slice(-n).join('\n')
}

const streams: Map<string, ReadableStreamDefaultController> = new Map()

listen('journal', async (event) => {
    const time = new Date().toLocaleTimeString(undefined, {
        timeStyle: 'short',
    })

    event.message = `${time} ${event.message}\n`
    await Deno.writeTextFile('./data/journal.txt', event.message, {
        append: true,
    })
    const encoder = new TextEncoder()

    streams.forEach((stream) => {
        stream.enqueue(encoder.encode(event.message))
    })
})

export const journal: Endpoint = {
    route: '/journal',
    handler() {
        const id = Math.floor(Math.random() * 10E6).toString(36)
        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder()
                lireLignes(30).then((lignes) => {
                    controller.enqueue(encoder.encode(lignes))
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
