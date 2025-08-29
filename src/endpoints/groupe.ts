import kv, { type Membre } from 'lib/kv.ts'
import { Endpoint } from './mod.ts'
import sharp from 'sharp'
import { emit } from 'lib/events.ts'

export const groupe: Endpoint = {
    route: '/groupe',
    async handler(request) {
        if (request.method !== 'POST') return 'next'

        const form = await request.formData()

        const img = form.get('img') as File | null
        const groupe = form.get('nom') as string | null
        const membres = form.get('membres') as string | null

        if (!img || !groupe || !membres) {
            return new Response('Mauvaise requête', {
                status: 400,
            })
        }

        try {
            const url = './public/img/' + groupe + '.png'
            await sharp(await img.bytes())
                .resize(128, 128, { fit: 'cover' })
                .withMetadata() // on garde le sens de l'image
                .toFile(url)
        } catch (e) {
            console.error("L'image n'a pas pu être enregistré!", e)
            return new Response("error d'importation", {
                status: 400,
            })
        }

        const db = await kv()
        await db.set(['group', groupe], JSON.parse(membres))
        await db.set(['score', groupe], 0)

        emit('journal', {
            message: `Nouveau groupe inscrit ${groupe}`,
            son: 'chap',
        })
        await emit('points', {
            groupe,
            set: 0,
        })

        return new Response('ok', {
            status: 200,
        })
    },
}

export const exist: Endpoint = {
    route: '/groupe/exist',
    async handler(_, url) {
        const db = await kv()
        const group = url.searchParams.get('g')
        if (group) {
            const exist = await db.get<number>(['score', group])
            if (exist.value !== null) return new Response('ye', { status: 200 })
        }
        return new Response('no', { status: 400 })
    },
}

export const informationAPI: Endpoint = {
    route: '/informations',
    async handler(_, url) {
        // /informations renvoie vers la page html
        // /informations?api la réponse de l'endpoint
        if (!url.searchParams.has('api')) {
            return 'next'
        }

        const groupe = url.searchParams.get('g')
        if (!groupe) {
            return new Response('Bad Request', { status: 400 })
        }

        const db = await kv()
        const score = await db.get<number>(['score', groupe])
        const membres = await db.get<Membre[]>(['group', groupe])

        if (score.value === null || membres.value === null) {
            return new Response('Not Found', {
                status: 404,
            })
        }

        return new Response(
            JSON.stringify({
                nom: groupe,
                score: score.value,
                membres: membres.value,
            }),
            {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                },
            },
        )
    },
}

export const information: Endpoint = {
    route: '/informations/',
    async handler(req, url, info) {
        if (url.searchParams.has('api')) {
            return 'next'
        }
        url.searchParams.append('api', '')
        const response = await informationAPI.handler(req, url, info)
        if (response === 'next' || !response.ok) return response
        const data = await response.json()

        const membres = data.membres
            .map((m: [string, string]) =>
                `<section><div>${m[0]}</div><div>${m[1]}</div></section>`
            )
            .join('')

        let journal = await Deno.readTextFile('./data/journal.txt')
        let lignes = 0
        journal = journal
            .split('\n')
            .filter((ligne) => {
                const i = ligne.includes(` ${data.nom} `)
                if (i) lignes++
                return i
            })
            .map((ligne) =>
                `<p data-at="${ligne.slice(0, 5)}">${ligne.slice(6)}</p>`
            )
            .join('')

        journal = `<section style="grid-template-rows: repeat(${
            Math.ceil(lignes / 2)
        }, 1fr);">${journal}</section>`

        let html = await Deno.readTextFile('./public/informations/index.html')
        html = html
            .replaceAll('${groupe}', data.nom)
            .replaceAll('${membres}', membres)
            .replaceAll('${journal}', journal)

        return new Response(html, {
            headers: {
                'content-type': 'text/html',
            },
        })
    },
}
