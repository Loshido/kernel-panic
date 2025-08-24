import { Endpoint } from './mod.ts';

export const groupe: Endpoint = {
    route: '/groupe',
    async handler(request) {
        if(request.method === 'GET') return 'next'

        const form = await request.formData()

        const img = form.get('img') as File | null
        const nom = form.get('nom') as string | null
        const membres = form.get('membres') as string | null

        if(!img || !nom || !membres) return new Response('Mauvaise requête', {
            status: 400
        })

        return new Response('')
    }
}