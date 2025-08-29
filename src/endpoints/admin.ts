import kv from 'lib/kv.ts'
import { Endpoint } from './mod.ts'
import { emit } from 'lib/events.ts'

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

        const groupe = url.searchParams.get('g')
        if (!groupe) {
            return new Response('Bad request', {
                status: 400,
            })
        }

        emit('journal', {
            message: `${groupe} a été avancé`,
            son: 'lizard',
        })
        await emit('points', {
            groupe: groupe,
            add: 30,
        })

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

        const groupe = url.searchParams.get('g')
        if (!groupe) {
            return new Response('Bad request', {
                status: 400,
            })
        }

        emit('journal', {
            message: `${groupe} a été reculé`,
            son: 'lizard',
        })
        await emit('points', {
            groupe,
            add: -30,
        })

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

        const groupe = url.searchParams.get('g')
        if (!groupe) {
            return new Response('Bad request', {
                status: 400,
            })
        }

        const db = await kv()
        emit('journal', {
            message: `${groupe} a été réinitialisé`,
            son: 'lizard',
        })
        await emit('points', {
            groupe,
            set: 0,
        })

        for await (const niv of db.list({ prefix: ['niv'] })) {
            if (niv.key.at(2) === groupe) {
                await db.delete(niv.key)
            }
        }
        for await (const niv of db.list({ prefix: ['chap'] })) {
            if (niv.key.at(3) === groupe) {
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

        emit('journal', {
            message: `${group} a été supprimé`,
            son: 'lizard',
        })

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
