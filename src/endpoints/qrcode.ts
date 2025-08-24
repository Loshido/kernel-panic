import { qrcode } from "@libs/qrcode"
import { Endpoint } from './mod.ts'

export const groupe: Endpoint = {
    route: '/groupe.svg',
    handler(_, url, ) {
        const newUrl = new URL('/groupe', url)
        return new Response(
            qrcode(newUrl, {
                border: 0,
                dark: '#fff',
                light: '#191919',
                output: "svg",
            }),
            {
                headers: {
                    'Content-Type': 'image/svg+xml'
                }
            }
        )
    }
}