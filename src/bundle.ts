export const exec = (args: string[]) =>
    new Deno.Command(Deno.execPath(), {
        args,
        stdin: 'null',
        stdout: 'null',
        stderr: 'inherit',
    })

type Entry = {
    in: string,
    out: string
}

export function bundle(entries: Entry[]) {
    if(entries.length > 2) {
        console.warn('Attention, trop de processus de bundling en cours.')
    }
    for(const entry of entries) {
        exec([
            'bundle',
            '--watch',
            '-q',
            '--platform',
            'browser',
            '-o',
            './public/' + entry.out,
            './src/client/' + entry.in,
        ]).spawn()
    } 
}
