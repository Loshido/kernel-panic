import { qrcode } from '@libs/qrcode'
import { Endpoint } from './mod.ts'

export const groupe: Endpoint = {
    route: '/groupe.svg',
    handler(_, url) {
        const newUrl = new URL('/groupe', url)
        return new Response(
            qrcode(newUrl, {
                border: 0,
                dark: '#fff',
                light: '#191919',
                output: 'svg',
            }),
            {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    // Le QRCode ne change jamais pour l'url donnée
                    // ex: http://192.168.1.2/groupe.svg -> QRCode http://192.168.1.2/groupe
                    //     http://localhost/groupe.svg -> QRCode http://localhost/groupe
                    // donc jamais de réponse différente
                    'Cache-Control': 'max-age=31536000, immutable',
                },
            },
        )
    },
}
