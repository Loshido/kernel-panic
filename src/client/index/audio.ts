const x = document.getElementById('x') as HTMLDivElement

export default class Audio {
    static init(url: string, id: string) {
        if (document.getElementById(`audio-${id}`)) return null

        const audio = document.createElement('audio')
        audio.src = url
        audio.volume = 1
        audio.loop = false
        audio.id = `audio-${id}`

        x.appendChild(audio)

        return audio
    }

    static async play(id: string) {
        const audio = document.getElementById(`audio-${id}`) as
            | HTMLAudioElement
            | null
        if (!audio) return

        audio.currentTime = 0
        await audio.play()
    }
}

Audio.init('/sfx/chap.wav', 'chap')
Audio.init('/sfx/niv.wav', 'niv')
Audio.init('/sfx/lizard.wav', 'lizard')
