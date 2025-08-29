import Audio from './audio.ts'
import { listen } from 'lib/events.ts'

const journal = document.querySelector(
    'main > section:nth-child(1)',
) as HTMLDivElement

let n = 0
let t1 = 0
export default () => {
    listen('journal', (event) => {
        t1 = Date.now()
        if(event.son) {
            const t2 = t1
            setTimeout(async () => {
                if(t2 !== t1 || !event.son) return
    
                await Audio.play(event.son)
            }, 50)
        }
        event.message.split('\n').filter(el => el.length > 5).forEach(message => {
            const [t, msg] = [message.slice(0, 5), message.slice(6)]
        
            const p = document.createElement('p')
            p.innerText = msg
            p.setAttribute('data-at', t)
            n++
            if (n >= 30) {
                journal.querySelector(
                    'main > section:nth-child(1) > p:nth-child(2)',
                )?.remove()
            }
            journal.appendChild(p)
        })
    })
}