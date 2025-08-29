import { groups } from './groupe.ts'

const width = window.innerWidth
const height = Math.floor(window.innerHeight / 2)
const maxheight = window.innerHeight

type Point = [number, number]
const rand = (max: number, min: number) =>
    min + Math.floor(Math.random() * (max - min))
export const points: Point[] = []

const svg = (
    width: number,
    height: number,
    points: [number, number][],
) => {
    // L -> Line to, M -> Move to, z -> close line to first point
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

const line = (): Point[] => {
    const points: Point[] = [[0, 0]]

    const n = rand(25, 10)
    for (let i = 0; i < n - 1; i++) {
        const facteur = rand(0.8, -0.5) + 0.9
        const xi = (i / n) * width
        const di = (width / n) / 2
        const x = Math.floor(xi + Math.random() * di)
        const y = Math.floor(points[i][1] + rand(50, 25) * facteur)

        points.push([x, y])
    }

    return [
        ...points, // (haut gauche à haut droit)
        [width + 4, height * 0.80], // haut droit
        [width + 4, -4], // bas droit
        [0, -4], // bas gauche
    ].map(([x, y]) => [x, maxheight - y]) // l'axe des ordonnées est inversé
}
export default () => {
    points.push(...line())
    const mountain = svg(width, maxheight, points)

    const parent = document.createElement('div')
    parent.classList.add('montagne')
    parent.innerHTML = mountain

    parent.style.height = maxheight + 'px'
    document.body.appendChild(parent)
    return parent
}

export const reload = () => {
    const parent = document.querySelector(
        'div.montagne > svg',
    ) as HTMLDivElement

    points.splice(0, points.length)
    points.push(...line())
    const path = points.map(([x, y]) => `L${x} ${y}`).join(' ') + ' z'

    parent.innerHTML = `
        <path d="M${path.slice(1)}" fill="url(#grad)"/>
        <defs>
            <linearGradient id="grad"  x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#fff0" />
            <stop offset="100%" stop-color="#fff4" />
            </linearGradient>
        </defs>
    `

    groups.forEach((g) => g.update(g.score))
}
