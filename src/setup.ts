import { hash } from 'argon2'
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

for await (const n of db.list({
    prefix: ['niv']
})) {
    await db.delete(n.key)
}
for await (const n of db.list({
    prefix: ['chap']
})) {
    await db.delete(n.key)
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

const __config = await Deno.readTextFile('./data/config.jsonc')
const _config = __config.split('\n').filter(ligne => !ligne.trimStart().startsWith('//')).join('\n')
const config = JSON.parse(_config) as { niveaux: Niveau[] }
config.niveaux.forEach(async (niveau, i) => await setupNiveau(i + 1, niveau))

for await (
    const group of db.list({
        prefix: ['group'],
    })
) {
    console.log(group.key.at(1))
    await db.set(['score', group.key.at(1) as string], 0)
    
}

Deno.exit(0)
