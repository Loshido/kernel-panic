type Data = Uint8Array<ArrayBufferLike>
type Callback = (chunk: Data) => void

export const consume = async (url: string, callback: Callback) => {
    const response = await fetch(url)
    const stream = response.body
    if (!stream) return

    // as safari doesn't support asyncIterator in ReadableStream
    // we need to do the old way.
    if (typeof stream[Symbol.asyncIterator] === 'function') {
        for await (const chunk of stream) {
            callback(chunk)
        }
    } else {
        const reader = stream.getReader()

        // Notez, qu'il s'agit d'une fonction async,
        // donc ce while ne bloque pas le reste de la page.
        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            if (value) callback(value)
        }
    }
}
