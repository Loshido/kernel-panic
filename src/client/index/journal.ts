import Audio from './audio.ts'
import { consume } from './stream.ts'

const journal = document.querySelector(
    'main > section:nth-child(1)',
) as HTMLDivElement

let n = 0
export default async () => {
    const decoder = new TextDecoder()
    await consume('/journal', (chunk) => {
        const lignes = decoder.decode(chunk)
        const old_n = n
        setTimeout(async () => {
            if (old_n !== n - 1) return

            if (lignes.includes('a été')) {
                await Audio.play('lizard')
            } else if (lignes.includes('chapitre')) {
                await Audio.play('chap')
            } else {
                await Audio.play('niv')
            }
        }, 50)

        lignes
            .split('\n')
            .map((l) => [l.slice(0, 5), l.slice(6)])
            .filter((p) => p[1].length > 4)
            .forEach(([t, message]) => {
                const p = document.createElement('p')
                p.innerText = message
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
