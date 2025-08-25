const source = document.getElementById('lizard') as HTMLMediaElement
source.loop = false
source.volume = 1
const niv = document.getElementById('niv') as HTMLMediaElement
niv.loop = false
niv.volume = 1
const chap = document.getElementById('chap') as HTMLMediaElement
chap.loop = false
chap.volume = 1

export async function lizard() {
    source.currentTime = 0
    await source.play()
}
export async function nivUp() {
    niv.currentTime = 0
    await niv.play()
}
export async function chapUp() {
    chap.currentTime = 0
    await chap.play()
}
