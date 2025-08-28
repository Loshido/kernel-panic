import kv from '../kv.ts'
import { nouvelleLigne } from './journal.ts'
import { Endpoint } from './mod.ts'
import { addScore } from './score.ts'

const ADMIN_TOKEN = Deno.env.get('ADMIN_TOKEN') || 'dBxG5104s<f'

export const avancer: Endpoint = {
    route: '/admin/avancer',
    async handler(_, url) {
        const token = url.searchParams.get('t')
        if (!token || token !== ADMIN_TOKEN) {
            return new Response('Unauthorized', {
                status: 401,
            })
        }

        const group = url.searchParams.get('g')
        if (!group) {
            return new Response('Bad request', {
                status: 400,
            })
        }

        await nouvelleLigne(`${group} a été avancé`)
        await addScore(group, 30)

        return new Response('ok')
    },
}

export const reculer: Endpoint = {
    route: '/admin/reculer',
    async handler(_, url) {
        const token = url.searchParams.get('t')
        if (!token || token !== ADMIN_TOKEN) {
            return new Response('Unauthorized', {
                status: 401,
            })
        }

        const group = url.searchParams.get('g')
        if (!group) {
            return new Response('Bad request', {
                status: 400,
            })
        }

        await nouvelleLigne(`${group} a été reculé`)
        await addScore(group, -30)

        return new Response('ok')
    },
}

export const reset: Endpoint = {
    route: '/admin/reset',
    async handler(_, url) {
        const token = url.searchParams.get('t')
        if (!token || token !== ADMIN_TOKEN) {
            return new Response('Unauthorized', {
                status: 401,
            })
        }

        const group = url.searchParams.get('g')
        if (!group) {
            return new Response('Bad request', {
                status: 400,
            })
        }

        const db = await kv()
        const score = await db.get<number>(['score', group])
        if (score.value === null) {
            return new Response('Bad request', {
                status: 400,
            })
        }

        await addScore(group, -score.value)
        await nouvelleLigne(`${group} a été réinitialisé`)

        for await (const niv of db.list({ prefix: ['niv'] })) {
            if (niv.key.at(2) === group) {
                await db.delete(niv.key)
            }
        }
        for await (const niv of db.list({ prefix: ['chap'] })) {
            if (niv.key.at(3) === group) {
                await db.delete(niv.key)
            }
        }

        return new Response('ok')
    },
}
export const remove: Endpoint = {
    route: '/admin/remove',
    async handler(_, url) {
        const token = url.searchParams.get('t')
        if (!token || token !== ADMIN_TOKEN) {
            return new Response('Unauthorized', {
                status: 401,
            })
        }

        const group = url.searchParams.get('g')
        if (!group) {
            return new Response('Bad request', {
                status: 400,
            })
        }

        const db = await kv()
        await db.delete(['score', group])
        await db.delete(['group', group])

        await nouvelleLigne(`${group} a été supprimé`)

        for await (const niv of db.list({ prefix: ['niv'] })) {
            if (niv.key.at(2) === group) {
                await db.delete(niv.key)
            }
        }
        for await (const niv of db.list({ prefix: ['chap'] })) {
            if (niv.key.at(3) === group) {
                await db.delete(niv.key)
            }
        }

        await Deno.remove('./public/img/' + group + '.png')

        return new Response('ok')
    },
}
