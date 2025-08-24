import { bundle } from './bundle.ts'
import endpoints from './endpoints/mod.ts'
import { serveDir } from 'jsr:@std/http/file-server'

if(Deno.args.at(0) === 'dev') {
    // bundle([
    //     {
    //         in: 'main.ts',
    //         out: 'main.js'
    //     },
    //     {
    //         in: 'groupe/main.ts',
    //         out: 'groupe/main.js'
    //     },
    // ])
}

Deno.serve({
    port: 80,
}, async (req, info) => {
    const url = new URL(req.url)

    if (url.pathname in endpoints) {
        const resp = await endpoints[url.pathname](req, url, info)
        if(resp !== 'next') return resp
    }

    return serveDir(req, {
        fsRoot: './public',
        showDirListing: false,
        showIndex: true,
    })
})