import type { Endpoint } from './mod.ts'
import kv from '../kv.ts'
import { verify } from 'argon2'
import { nouvelleLigne } from './journal.ts'
import { addScore } from './score.ts'

interface Entite {
    niveau: number
    chapitre: number
    code: string
}

async function verificationNiveau(
    kv: Deno.Kv,
    entite: Omit<Entite, 'chapitre'>,
): Promise<[boolean, number]> {
    const hash = await kv.get<[string, number]>(['niv', entite.niveau])
    if (!hash.value) return [false, 0]

    return [verify(entite.code, hash.value[0]), hash.value[1]]
}
async function verificationChapitre(
    kv: Deno.Kv,
    entite: Entite,
): Promise<[boolean, number]> {
    const hash = await kv.get<[string, number]>([
        'chap',
        entite.niveau,
        entite.chapitre,
    ])
    if (!hash.value) return [false, 0]

    return [verify(entite.code, hash.value[0]), hash.value[1]]
}

export const niveau: Endpoint = {
    route: '/niveau',
    async handler(request) {
        const body = await request.json()
        const group = body.groupe satisfies string | undefined
        const code = body.code satisfies string | undefined
        const niveau = body.niveau satisfies number | undefined
        const chapitre = body.chapitre satisfies number | undefined

        if (!body || !group || !code || !niveau) {
            return new Response('requête invalide', {
                status: 400,
            })
        }

        const db = await kv()

        const enregistrement = await db.get(
            chapitre
                ? ['chap', niveau, chapitre, group]
                : ['niv', niveau, group],
        )

        if (enregistrement.value !== null) {
            return new Response('code déjà validée', {
                status: 400,
            })
        }

        const [verification, recompense] = chapitre
            ? await verificationChapitre(db, {
                code,
                chapitre,
                niveau,
            })
            : await verificationNiveau(db, {
                code,
                niveau,
            })

        if (!verification) {
            return new Response('vérification échouée', {
                status: 400,
            })
        }

        await addScore(group, recompense)
        if (chapitre) {
            await db.set(['chap', niveau, chapitre, group], new Date())
            await nouvelleLigne(
                `${group} a terminé le chapitre ${chapitre} du niveau ${niveau}`,
            )
        } else {
            await db.set(['niv', niveau, group], new Date())
            await nouvelleLigne(`${group} a terminé le niveau ${niveau}`)
        }

        return new Response('ok')
    },
}
