const width = window.innerWidth
const height = Math.floor(window.innerHeight / 2)
const maxheight = Math.floor(window.innerHeight / 3 * 2)

type Point = [number, number]
const rand = (max: number, min: number) =>
    min + Math.floor(Math.random() * (max - min))

export const svg = (
    width: number,
    height: number,
    points: [number, number][],
) => {
    const path = points.map(([x, y]) => `L${x} ${y}`).join(' ') + ' z'

    return `<svg width="${width}" height="${height}" viewport="0 0 ${width} ${height}">
        <path d="M${path.slice(1)}" fill="url(#grad)"/>
        <defs>
            <linearGradient id="grad"  x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#fff0" />
            <stop offset="100%" stop-color="#fff4" />
            </linearGradient>
        </defs>
    </svg>`
}

export const line = (): Point[] => {
    const points: Point[] = [[0, 0]]

    const n = rand(25, 10)
    for (let i = 0; i < n - 1; i++) {
        const facteur = rand(0.8, -0.5) + 0.9
        const xi = (i / n) * width
        const vi = (width / n) / 2
        const x = Math.floor(xi + Math.random() * vi)
        const y = Math.floor(points[i][1] + rand(50, 25) * facteur)

        points.push([x, y])
    }

    points.push([width + 4, height * 0.80])

    return [
        ...points,
        [width + 4, -4],
        [0, -4],
    ].map(([x, y]) => [x, maxheight - y])
}

export default () => {
    const mountain = svg(width, maxheight, line())

    const parent = document.createElement('div')
    parent.classList.add('montagne')
    parent.innerHTML = mountain

    parent.style.height = maxheight + 'px'
    document.body.appendChild(parent)
}

export const reload = () => {
    const parent = document.querySelector('div.montagne') as HTMLDivElement
    parent.innerHTML = svg(width, maxheight, line())
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'r':
            reload()
            break
    }
})
