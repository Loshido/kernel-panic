import { hash } from 'argon2'
import config from '../config.jsonc' with { type: 'json' }
import kv from './kv.ts'

const db = await kv()

interface Chapitre {
    recompense: number
    code: string
}

interface Niveau {
    code: string
    recompense: number
    chapitres: Chapitre[]
}

const setupChapitre = async (
    niveau: number,
    chapitre: number,
    data: Chapitre,
) => {
    const hashed = hash(data.code)
    await db.set(['chap', niveau, chapitre], [hashed, data.recompense])
}
const setupNiveau = async (niveau: number, data: Niveau) => {
    const hashed = hash(data.code)
    await db.set(['niv', niveau], [hashed, data.recompense])
    data.chapitres.forEach(async (chap, i) => {
        await setupChapitre(niveau, i + 1, chap)
    })
}
config.niveaux.forEach(async (niveau, i) => await setupNiveau(i + 1, niveau))
