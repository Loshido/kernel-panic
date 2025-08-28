import { Endpoint } from './mod.ts'

async function lireLignes(n: number): Promise<string> {
    // lis N lignes
    const lignes = await Deno.readTextFile('./data/journal.txt')
    return lignes.split('\n').slice(-n).join('\n')
}

const streams: Map<string, ReadableStreamDefaultController> = new Map()

export async function nouvelleLigne(ligne: string) {
    const time = new Date().toLocaleTimeString(undefined, {
        timeStyle: 'short',
    })

    const data = `${time} ${ligne}\n`
    await Deno.writeTextFile('./data/journal.txt', data, {
        append: true,
    })
    const encoder = new TextEncoder()

    streams.forEach((stream) => {
        stream.enqueue(encoder.encode(data))
    })
}

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
