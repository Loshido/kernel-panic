export const events = {
    points: (data: { groupe: string; add: number } | { groupe: string, set: number }) => {
        if('set' in data && data.set < 0) {
            data.set = 0
        }
        return data
    },
    journal: (data: { message: string; son?: string }) => {
        const time = new Date().toLocaleTimeString(undefined, {
            timeStyle: 'short',
        })
        data.message = `${time} ${data.message}\n`
        return data
    },
    'new-stream': (id: string) => {
        return { stream: id }
    }
} as const

const check = (value: unknown): value is (() => void) => {
    // function.length -> nombre d'arguments visiblement
    if(typeof value === 'function' && value.length === 0) {
        return true
    }
    return false
}

export default async () => {
    for await (const entry of Deno.readDir('./src/events')) {
        if (
            !entry.isFile || !entry.name.endsWith('.ts') || entry.name === 'mod.ts'
        ) continue
        const mod = await import('./' + entry.name)
        for (const value of Object.values(mod)) {
            if (value instanceof Array) {
                for (const listener of value) {
                    if(check(listener)) {
                        listener()
                    }
                }
                continue
            }
            if(check(value)) {
                value()
            }
        }
    }
}