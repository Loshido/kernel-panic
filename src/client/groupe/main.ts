import { Membre } from './membres.ts'

const groupe = document.querySelector('header > h1') as HTMLHeadingElement
const buttonImage = document.querySelector(
    'header > label > input',
) as HTMLInputElement
const image = document.querySelector('header > label > img') as HTMLInputElement
const main = document.querySelector('main') as HTMLElement
const erreurs = document.querySelector('footer > p') as HTMLParagraphElement
const enregistrer = document.querySelector(
    'footer > button',
) as HTMLButtonElement

const membres: Membre[] = []

function createMembre() {
    const id = Math.floor(Math.random() * 10E6).toString(36)

    const m = new Membre(id, main, {
        createNext: createMembre,
        onRemove() {
            const i = membres.findIndex((p) => p.id === id)
            membres.splice(i, 1)
        },
    })
    main.classList.toggle('error', false)
    membres.push(m)
}

// On passe sur chaque membre vérifier s'il est correcte sinon on prévient
function validerMembres(): [boolean, [string, string][]] {
    let erreur = false
    const m: [string, string][] = membres
        .filter((m) => m.initiated)
        .map((membre) => {
            if (membre.nom.length === 0) {
                membre.element?.querySelector('div:nth-child(1)')?.classList
                    .toggle('error', true)
                erreur = true
            }
            if (membre.prenom.length === 0) {
                membre.element?.querySelector('div:nth-child(2)')?.classList
                    .toggle('error', true)
                erreur = true
            }
            return [membre.nom, membre.prenom]
        })

    if (m.length === 0) {
        main.classList.toggle('error', true)
    }

    return [!erreur, m]
}

createMembre()

buttonImage.addEventListener('input', () => {
    if ((buttonImage.files?.length || 0) > 0 && buttonImage.files) {
        const img = buttonImage.files.item(0)
        if (!img) return

        image.classList.toggle('error', false)
        image.src = URL.createObjectURL(img)
    }
})

groupe.addEventListener('input', () => {
    groupe.classList.toggle('error', false)
})

enregistrer.addEventListener('click', async () => {
    let indication = ''
    let validation = true
    const [valide, membres] = validerMembres()
    if (!valide || membres.length === 0) {
        validation = false
        indication +=
            'Veuillez remplir les noms et prénoms de tous les membres.\n'
    }

    if (groupe.innerText === 'Nom du groupe') {
        indication += 'Veuillez donner un nom à votre groupe.\n'
        validation = false

        groupe.classList.toggle('error', true)
    }

    const img = buttonImage.files?.item(0)
    if (!(img instanceof File)) {
        image.classList.toggle('error', true)
        indication += 'Veuillez mettre un avatar de groupe'
        validation = false
    }

    erreurs.innerText = indication

    if (!validation) return
    if (
        prompt("Entrez 'oui' pour créer le groupe " + groupe.innerText) !==
            'oui'
    ) return

    const form = new FormData()

    form.set('img', img!)
    form.set('nom', groupe.innerText.trim())
    form.set('membres', JSON.stringify(membres))

    const response = await fetch('/groupe', {
        method: 'POST',
        body: form,
    })

    if (response.ok) {
        enregistrer.style.display = 'none'
        erreurs.innerText = groupe.innerText.trim() + ' enregistré'
        erreurs.style.textAlign = 'center'
    }
})
