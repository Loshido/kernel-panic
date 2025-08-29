import { SCORE_MAX } from 'env'
import { points } from './mountain.ts'
import { consume } from './stream.ts'

const maxheight = window.innerHeight
export const groups: Group[] = []

export default async function listen() {
    const decoder = new TextDecoder()
    await consume('/score', (chunk) => {
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
            groups.sort((a, b) => b.score - a.score)
            groups.forEach((g, i) => g.reclassement(i + 1))
        }
    })
}

class Group {
    id: string
    score: number
    classement: number
    x: number = 0
    y: number = 0
    element: HTMLElement
    constructor(id: string, score: number) {
        this.id = id
        this.score = score
        this.classement = 0

        const parent = document.querySelector('div.montagne') as HTMLElement
        this.element = document.createElement('div')
        this.element.classList.add('group')
        this.element.innerHTML =
            `<img src="/img/${id}.png" alt="${id}" title="${id}"/>`
        parent.appendChild(this.element)

        this.update(score)
    }

    reclassement(place: number) {
        this.classement = place
        this.element.classList.toggle('premier', this.classement === 1)
    }

    update(score: number) {
        this.score = score
        const x = Math.floor((window.innerWidth - 80) / SCORE_MAX * score)

        // ne dépasse pas des côtés
        this.x = Math.max(Math.min(window.innerWidth - 80, x), 0)
        let y = Group.nearest_height(this.x)
        let ok = 0
        do {
            ok = 0
            groups.forEach((g) => {
                if (
                    Math.abs(g.y - y) <= 16 && Math.abs(g.x - this.x) <= 16 &&
                    g.id !== this.id
                ) {
                    y += 80
                } else ok++
            })
        } while (ok !== groups.length)
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
