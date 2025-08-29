import groupe from './groupe.ts'
import mountain, { reload } from './mountain.ts'
import { spawnStars } from './stars.ts'
import journal from './journal.ts'
import admin from './admin.ts'
import setupStream from "./stream.ts"
import { couleurs } from 'env'

spawnStars(5)

Object.entries(couleurs).forEach(([propriete, valeur]) => {
    document.body.attributeStyleMap.set(propriete, valeur)
})

const parent = mountain()
parent.appendChild(admin())
journal()
groupe()
setupStream()

let qrcode = true
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'r':
            reload()
            break
        case 'q': {
            qrcode = !qrcode

            const e = document.getElementById('qrcode') as HTMLElement
            e.style.opacity = qrcode ? '1' : '0'
            break
        }
    }
})
