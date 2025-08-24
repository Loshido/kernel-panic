// src/client/index/mountain.ts
var width = window.innerWidth
var height = Math.floor(window.innerHeight / 2)
var maxheight = Math.floor(window.innerHeight / 3 * 2)
var rand = (max, min) => min + Math.floor(Math.random() * (max - min))
var svg = (width2, height2, points) => {
    const path = points.map(([x, y]) => `L${x} ${y}`).join(' ') + ' z'
    return `<svg width="${width2}" height="${height2}" viewport="0 0 ${width2} ${height2}">
        <path d="M${path.slice(1)}" fill="url(#grad)"/>
        <defs>
            <linearGradient id="grad"  x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#fff0" />
            <stop offset="100%" stop-color="#fff4" />
            </linearGradient>
        </defs>
    </svg>`
}
var line = () => {
    const points = [
        [
            0,
            0,
        ],
    ]
    const n2 = rand(25, 10)
    for (let i = 0; i < n2 - 1; i++) {
        const facteur = rand(0.8, -0.5) + 0.9
        const xi = i / n2 * width
        const vi = width / n2 / 2
        const x = Math.floor(xi + Math.random() * vi)
        const y = Math.floor(points[i][1] + rand(50, 25) * facteur)
        points.push([
            x,
            y,
        ])
    }
    points.push([
        width + 4,
        height * 0.8,
    ])
    return [
        ...points,
        [
            width + 4,
            -4,
        ],
        [
            0,
            -4,
        ],
    ].map(([x, y]) => [
        x,
        maxheight - y,
    ])
}
var mountain_default = () => {
    const mountain = svg(width, maxheight, line())
    const parent = document.createElement('div')
    parent.classList.add('montagne')
    parent.innerHTML = mountain
    parent.style.height = maxheight + 'px'
    document.body.appendChild(parent)
}
var reload = () => {
    const parent = document.querySelector('div.montagne')
    parent.innerHTML = svg(width, maxheight, line())
}
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'r':
            reload()
            break
    }
})

// src/client/index/stars.ts
var rand2 = (max) => Math.floor(Math.random() * max)
function spawnStars(n2) {
    let chain = ''
    const parent = document.getElementById('falling-stars')
    for (let i = 0; i < 15; i++) {
        chain += (rand2(1e5) + 1e13).toString(2)
    }
    const secret = rand2(chain.length)
    chain = chain.slice(0, secret) + '\u{1F6F0}\uFE0F' + chain.slice(secret)
    const span = document.createElement('span')
    span.style.font = '12px sora'
    span.style.visibility = 'hidden'
    span.style.position = 'absolute'
    span.textContent = '1'
    document.body.appendChild(span)
    const char = span.getBoundingClientRect().width
    document.body.removeChild(span)
    const height2 = window.innerHeight
    const length = Math.ceil(height2 / char)
    for (let i = 0; i < n2; i++) {
        const p = document.createElement('p')
        const from = rand2(chain.length - length)
        p.innerText = chain.slice(from, from + length)
        const duraction = 15 + rand2(20)
        p.style.animationDuration = duraction + 's'
        p.style.animationDelay = rand2(duraction - 5) + 's'
        p.style.left = 5 + rand2(90) + '%'
        parent?.appendChild(p)
    }
}

// src/client/index/audio.ts
var source = document.getElementById('lizard')
source.loop = false
source.volume = 1
var niv = document.getElementById('niv')
niv.loop = false
niv.volume = 1
var chap = document.getElementById('chap')
chap.loop = false
chap.volume = 1
var last = document.getElementById('last-niv')
last.loop = false
last.volume = 1
async function nivUp() {
    niv.currentTime = 0
    await niv.play()
}
async function chapUp() {
    chap.currentTime = 0
    await chap.play()
}
async function lastNiv() {
    last.currentTime = 0
    await last.play()
}

// src/client/index/stream.ts
var journal = document.querySelector('main > section:nth-child(1)')
var n = 0
var stream_default = async () => {
    const response = await fetch('/journal')
    const stream = response.body
    if (!stream) return
    const decoder = new TextDecoder()
    for await (
        const chunk of stream.values({
            preventCancel: true,
        })
    ) {
        const lignes = decoder.decode(chunk)
        const old_n = n
        setTimeout(async () => {
            if (old_n !== n - 1) return
            if (lignes.includes('a termin\xE9 le niveau 3')) await lastNiv()
            else if (!lignes.includes('chapitre')) await nivUp()
            else await chapUp()
        }, 50)
        lignes.split('\n').map((l) => [
            l.slice(0, 5),
            l.slice(6),
        ]).filter((p) => p[1].length > 4).forEach(([t, message]) => {
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

// src/client/index/main.ts
stream_default()
spawnStars(5)
mountain_default()
