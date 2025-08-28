const rand = (max: number) => Math.floor(Math.random() * max)

export function spawnStars(n: number) {
    let chain = ''
    const parent = document.getElementById('falling-stars')

    for (let i = 0; i < 15; i++) {
        chain += (rand(10E4) + 10E12).toString(2)
    }

    const secret = rand(chain.length)
    chain = chain.slice(0, secret) + '🛰️' + chain.slice(secret)

    // on cherche le nb de lettres qu'on peut mettre
    // sur la hauteur de l'écran à la vertical
    const span = document.createElement('span')
    span.style.font = '12px sora'
    span.style.visibility = 'hidden'
    span.style.position = 'absolute'
    span.textContent = '1'
    document.body.appendChild(span)

    const char = span.getBoundingClientRect().width // largeur de '1' sur la page
    document.body.removeChild(span)

    const height = window.innerHeight
    const length = Math.ceil(height / char)

    for (let i = 0; i < n; i++) {
        const p = document.createElement('p')
        const from = rand(chain.length - length)
        p.innerText = chain.slice(from, from + length)
        const duraction = 15 + rand(20)
        p.style.animationDuration = duraction + 's'
        p.style.animationDelay = rand(duraction - 5) + 's'
        p.style.left = 5 + rand(90) + '%'
        parent?.appendChild(p)
    }
}
