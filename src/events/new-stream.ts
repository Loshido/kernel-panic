import { listen, Event } from 'lib/events.ts'
import { dispatchToSpecifiedStream } from '../endpoints/live.ts'
import kv from 'lib/kv.ts'

async function lireLignes(n: number): Promise<string> {
    // lis N lignes
    const lignes = await Deno.readTextFile('./data/journal.txt')
    return lignes.split('\n').slice(-n).join('\n')
}

export default () => {
    listen('new-stream', async (event) => {
        const message = await lireLignes(30)
        const journalEvent: Event<'journal'> = {
            id: 'journal',
            message,
        }

        dispatchToSpecifiedStream(event.stream, journalEvent as unknown as Event)
        
        const db = await kv()
        for await (const groupe of db.list<number>({ prefix: ['score'] })) {
            const pointsEvent: Event<'points'> = {
                id: 'points',
                groupe: groupe.key.at(1) as string,
                set: groupe.value
            }
            dispatchToSpecifiedStream(event.stream, pointsEvent as unknown as Event)
        }
    })
}