import membres, { validerMembres } from './membres.ts'
import image from './image.ts'
import nom from './nom.ts'
const main = {
    parent: document.querySelector('main') as HTMLElement,
    notification: document.querySelector('footer > p') as HTMLParagraphElement,
    enregistrer: document.querySelector('footer > button') as HTMLButtonElement,
}

function estEnregistrable(): [boolean, string] {
    let indication = ''
    let validation = true
    const [valide, membres] = validerMembres()
    if (!valide || membres.length === 0) {
        validation = false
        indication +=
            'Veuillez remplir les noms et prénoms de tous les membres.\n'
    }

    if (nom.innerText === 'Nom du groupe') {
        indication += 'Veuillez donner un nom à votre groupe.\n'
        validation = false

        nom.classList.toggle('error', true)
    } else if (nom.innerText.includes(' ')) {
        indication += "Le nom du groupe ne doit pas contenir d'espace.\n"
        validation = false

        nom.classList.toggle('error', true)
    }

    if (image.file === null) {
        image.cadre.classList.toggle('error', true)
        indication += 'Veuillez mettre un avatar de groupe'
        validation = false
    }

    return [validation, indication]
}

main.enregistrer.addEventListener('click', async () => {
    const [enregistrable, raison] = estEnregistrable()

    main.notification.innerText = raison
    if (!enregistrable) return

    document.querySelectorAll('*[content-editable="true"').forEach((el) => {
        el.setAttribute('content-editable', 'false')
    })
    document.querySelectorAll('input').forEach((el) => {
        el.disabled = true
    })

    const form = new FormData()

    form.set('img', image.file!)
    form.set('nom', nom.innerText.trim())
    form.set('membres', JSON.stringify(membres))

    const response = await fetch('/groupe', {
        method: 'POST',
        body: form,
    })

    if (response.ok) {
        main.enregistrer.style.display = 'none'
        main.notification.innerText = nom.innerText.trim() + ' enregistré'
        main.notification.style.textAlign = 'center'
    }
})
