import kv from '../kv.ts'
import { Endpoint } from './mod.ts'
import sharp from 'sharp'

export const groupe: Endpoint = {
    route: '/groupe',
    async handler(request) {
        if (request.method === 'GET') return 'next'

        const form = await request.formData()

        const img = form.get('img') as File | null
        const nom = form.get('nom') as string | null
        const membres = form.get('membres') as string | null

        if (!img || !nom || !membres) {
            return new Response('Mauvaise requête', {
                status: 400,
            })
        }

        try {
            const url = './public/img/' + nom + '.png'
            await sharp(await img.bytes())
                .resize(128, 128)
                .toFile(url)
        } catch (e) {
            console.error("L'image n'a pas pu être enregistré!", e)
            return new Response("error d'importation", {
                status: 400,
            })
        }

        const db = await kv()
        const tr = db.atomic()

        tr.set(['group', nom], {
            membres: JSON.parse(membres),
            image: '/img/' + nom + '.png',
        })

        tr.set(['score', nom], 0)

        await tr.commit()
        return new Response('ok', {
            status: 200,
        })
    },
}
