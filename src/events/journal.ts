import { listen } from 'lib/events.ts'
import { dispatchToStream } from '../endpoints/live.ts'

export default () => {
    listen('journal', async (event) => {
        await Deno.writeTextFile('./data/journal.txt', event.message, {
            append: true,
        })

        dispatchToStream(event)
    })
}