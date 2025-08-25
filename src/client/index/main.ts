import group from './group.ts'
import mountain from './mountain.ts'
import { spawnStars } from './stars.ts'
import journal from './journal.ts'
import admin from './admin.ts'

journal()
spawnStars(5)

const parent = mountain()
parent.appendChild(admin())
group()

let qrcode = true
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'q': {
            qrcode = !qrcode

            const e = document.getElementById('qrcode') as HTMLElement
            e.style.opacity = qrcode ? '1' : '0'
            break
        }
    }
})
