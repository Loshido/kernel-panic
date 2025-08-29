import type { Endpoint } from './mod.ts'
import kv from 'lib/kv.ts'
import { verify } from 'argon2'
import { emit } from 'lib/events.ts'

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
        const groupe = body.groupe satisfies string | undefined
        const code = body.code satisfies string | undefined
        const niveau = body.niveau satisfies number | undefined
        const chapitre = body.chapitre satisfies number | undefined

        if (!body || !groupe || !code || !niveau) {
            return new Response('requête invalide', {
                status: 400,
            })
        }

        const db = await kv()

        const enregistrement = await db.get(
            chapitre
                ? ['chap', niveau, chapitre, groupe]
                : ['niv', niveau, groupe],
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

        await emit('points', {
            groupe,
            add: recompense,
        })
        if (chapitre) {
            await db.set(['chap', niveau, chapitre, groupe], new Date())
            emit('journal', {
                message:
                    `${groupe} a terminé le chapitre ${chapitre} du niveau ${niveau}`,
                son: 'chap',
            })
        } else {
            await db.set(['niv', niveau, groupe], new Date())
            emit('journal', {
                message: `${groupe} a terminé le niveau ${niveau}`,
                son: 'niv',
            })
        }

        return new Response('ok')
    },
}
