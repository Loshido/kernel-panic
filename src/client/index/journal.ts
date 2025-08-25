import { chapUp, lastNiv, nivUp } from './audio.ts'

const journal = document.querySelector(
    'main > section:nth-child(1)',
) as HTMLDivElement

let n = 0
export default async () => {
    const response = await fetch('/journal')
    const stream = response.body
    if (!stream) return
    const decoder = new TextDecoder()

    for await (const chunk of stream.values({ preventCancel: true })) {
        const lignes = decoder.decode(chunk)
        const old_n = n
        setTimeout(async () => {
            if (old_n !== n - 1) return

            if (lignes.includes('a terminé le niveau 3')) await lastNiv()
            else if (!lignes.includes('chapitre')) await nivUp()
            else await chapUp()
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
    }
}
