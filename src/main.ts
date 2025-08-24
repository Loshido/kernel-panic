import endpoints from './endpoints/mod.ts'
import { serveDir } from 'jsr:@std/http/file-server'

Deno.serve({
    port: 80,
}, async (req, info) => {
    const url = new URL(req.url)

    if (url.pathname in endpoints) {
        const resp = await endpoints[url.pathname](req, url, info)
        if (resp !== 'next') return resp
    }

    return serveDir(req, {
        fsRoot: './public',
        showDirListing: false,
        showIndex: true,
    })
})
