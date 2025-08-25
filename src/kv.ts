const TIMEOUT = 1000 * 30
let kv: null | Deno.Kv = null
export default async () => {
    kv = await Deno.openKv('./data/kv.db')

    setTimeout(() => {
        if (kv) {
            kv.close()
            kv = null
        }
    }, TIMEOUT)

    return kv
}

type Membre = [string, string] // nom prenom

// Informations sur les groupes
// 'group' group-id
export interface Group {
    membres: Membre[]
    image: string
}

// 'score' group-id -> number

// Instant auquel un groupe termine un niveau
// 'niv' niv group-id -> Date

// Hash qui valide le niveau et nb de points.
// 'niv' niv -> [string, number]

// Instant auquel un groupe termine un chapitre
// 'chap' niv chap group-id -> Date

// Hash qui valide le niveau et nb de points.
// 'chap' niv chap -> [string, number]
