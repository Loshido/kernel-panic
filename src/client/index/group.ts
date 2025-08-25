import { SCORE_MAX } from '../../env.ts'
import { points } from './mountain.ts'

const maxheight = Math.floor(window.innerHeight / 3 * 2)
export const groups: Group[] = []

export default async function listen() {
    const response = await fetch('/score')
    const stream = response.body
    if (!stream) return
    const decoder = new TextDecoder()

    for await (const chunk of stream.values({ preventCancel: true })) {
        const _payload = decoder.decode(chunk)
        const payload = JSON.parse(_payload)
        for (const data of payload) {
            const group = groups.find((g) => g.id === data[0])
            if (group) {
                group.update(data[1])
            } else {
                const g = new Group(data[0], data[1])
                groups.push(g)
            }
        }
    }
}

class Group {
    id: string
    score: number
    x: number = 0
    y: number = 0
    element: HTMLElement
    constructor(id: string, score: number) {
        this.id = id
        this.score = score

        const parent = document.querySelector('div.montagne') as HTMLElement
        this.element = document.createElement('div')
        this.element.classList.add('group')
        this.element.innerHTML = `<img src="/img/${id}.png" alt="${id}"/>`
        parent.appendChild(this.element)

        this.update(score)
    }

    update(score: number) {
        this.x = Math.floor(window.innerWidth / SCORE_MAX * score)
        let y = Group.nearest_height(this.x)
        let ok = 0
        do {
            groups.forEach((g) => {
                if (Math.abs(g.y - y) <= 16 && Math.abs(g.x - this.x) <= 16) {
                    y += 80
                } else ok++
            })
        } while(ok !== groups.length) 
        this.y = y
        this.element.style.left = this.x + 'px'
        this.element.style.bottom = this.y + 'px'
    }

    static nearest_height(x: number) {
        if (points.length == 0) return 0
        let closest = 0

        for (let i = 1; i < points.length - 1; i++) {
            if (Math.abs(points[i][0] - x) < Math.abs(points[closest][0] - x)) {
                closest = i
            }
        }

        if (points[closest][0] > x && closest !== 0) {
            closest--
        }

        const w = points[closest + 1][0] - points[closest][0]
        const h = points[closest + 1][1] - points[closest][1]
        const a = h / w
        const y = a * (x - points[closest][0]) + points[closest][1]

        return Math.ceil(maxheight - y)
    }
}
