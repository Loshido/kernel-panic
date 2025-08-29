import { listen } from 'lib/events.ts'
import kv from 'lib/kv.ts'
import { dispatchToStream } from '../endpoints/live.ts'

export default () => {
    listen('points', async (event) => {
        const db = await kv()
        if ('set' in event) {
            await db.set(['score', event.groupe], event.set)
        } else {
            const old_score = await db.get<number>(['score', event.groupe])
            if (old_score.value === null) return
            await db.set(['score', event.groupe], old_score.value + event.add)
        }

        dispatchToStream(event)
    })
}