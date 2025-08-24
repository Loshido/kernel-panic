export type Handler = (
    request: Request,
    url: URL,
    info: Deno.ServeHandlerInfo<Deno.Addr>,
) => Promise<Response | 'next'> | Response | 'next'
type Endpoints = {
    [route: string]: Handler
}

export interface Endpoint {
    route: string
    handler: Handler
}

const endpoints: Endpoints = {}

const check = (value: unknown) => (
    typeof value === 'object' && value !== null &&
    'route' in value && 'handler' in value &&
    typeof value.handler === 'function'
)

const insert = (endpoint: Endpoint) => {
    endpoints[endpoint.route] = endpoint.handler
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
                if (!check(endpoint)) continue
                insert(endpoint as Endpoint)
            }
        }
        if (!check(value)) continue
        insert(value as Endpoint)
    }
}

export default endpoints
