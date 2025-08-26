export type Handler = (
    request: Request,
    url: URL,
    info: Deno.ServeHandlerInfo<Deno.Addr>,
) => Promise<Response | 'next'> | Response | 'next'
type Endpoints = {
    [route: string]: Handler
}

interface StaticEndpoint {
    route: string
    handler: Handler
}

export type Endpoint = DynEndpoint | StaticEndpoint

interface DynEndpoint {
    match: (pathname: string) => boolean
    handler: Handler
}

const endpoints: Endpoints = {}
const dynEndpoints: DynEndpoint[] = []

const check = (value: unknown) => {
    const endpoint = (
        typeof value === 'object' && value !== null &&
        'handler' in value &&
        typeof value.handler === 'function'
    )
    if(endpoint && 'route' in value) return 'endpoint'
    if(endpoint && 'match' in value && typeof value.match === 'function') return 'dynEndpoint'
    return null
}

const insert = (endpoint: any) => {
    const type = check(endpoint)
    if(type === "dynEndpoint") dynEndpoints.push(endpoint as DynEndpoint)
    else if(type === 'endpoint') endpoints[endpoint.route as string] = endpoint.handler as Handler
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
            continue;
        }
        insert(value)
    }
}

export default endpoints
