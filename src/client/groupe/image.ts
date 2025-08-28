const input = document.querySelector(
    'header > label > input',
) as HTMLInputElement
const image = {
    cadre: document.querySelector('header > label > img') as HTMLImageElement,
    file: null as File | null,
}

input.addEventListener('input', () => {
    if (input.files && input.files.length > 0) {
        const img = input.files.item(0)
        if (!img) return

        image.file = img
        image.cadre.src = URL.createObjectURL(img)
        image.cadre.classList.toggle('error', false)
    }
})

export default image
