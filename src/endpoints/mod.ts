export type Handler = (
    request: Request,
    url: URL,
    info: Deno.ServeHandlerInfo<Deno.Addr>,
) => Promise<Response | 'next'> | Response | 'next'

export type Endpoint = StaticEndpoint

interface StaticEndpoint {
    route: string
    handler: Handler
}

const endpoints: { [route: string]: Handler } = {}

const check = (value: unknown) => {
    const endpoint = typeof value === 'object' && value !== null &&
        'handler' in value &&
        typeof value.handler === 'function'
    if (endpoint && 'route' in value) return 'endpoint'
    return null
}

const insert = (endpoint: any) => {
    const type = check(endpoint)
    if (type === 'endpoint') {
        endpoints[endpoint.route as string] = endpoint.handler as Handler
    }
}

// On parcourt tous les fichiers du dossier
for await (const entry of Deno.readDir('./src/endpoints')) {
    if (
        !entry.isFile || !entry.name.endsWith('.ts') || entry.name === 'mod.ts'
    ) continue
    const mod = await import('./' + entry.name)
    for (const value of Object.values(mod)) {
        if (value instanceof Array) {
            for (const endpoint of value) {
                insert(endpoint)
            }
            continue
        }
        insert(value)
    }
}

export default endpoints
