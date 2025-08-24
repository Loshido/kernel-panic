const journaux = [
    ['ABB a complété le niveau 1', '13:06'],
    ['ACC a complété le niveau 1', '13:06'],
    ['AAA a complété le chapitre 1 niveau 1', '13:06'],
    ['AHH a complété le niveau 1', '13:06']
]

const journal = document.querySelector('main > section:nth-child(1)') as HTMLDivElement | null
if(!journal) throw new Error('mauvaise page.');

for(const ligne of journaux) {
    const p = document.createElement('p')
    p.innerText = ligne[0]

    p.setAttribute('data-at', ligne[1])

    journal.appendChild(p)
}