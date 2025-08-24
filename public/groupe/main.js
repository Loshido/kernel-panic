// src/client/groupe/membres.ts
var Membre = class {
    id
    element
    nom = ''
    prenom = ''
    initiated = false
    constructor(id, parent, listeners) {
        this.id = id
        this.create()
        this.listener(listeners)
        this.element.id = id
        parent.appendChild(this.element)
    }
    create() {
        const section = document.createElement('section')
        section.innerHTML = `
            <div contenteditable="true">
                Nom
            </div>
            <div contenteditable="true">
                Pr\xE9nom
            </div>
            <div>
                -
            </div>
        `
        this.element = section
    }
    remove() {
        this.element?.remove()
    }
    listener(external) {
        if (!this.element) return
        const nom = this.element.querySelector('div:nth-child(1)')
        const prenom = this.element.querySelector('div:nth-child(2)')
        const rm = this.element.querySelector('div:nth-child(3)')
        nom.addEventListener('input', () => {
            this.nom = nom.innerText
            nom.classList.toggle('error', false)
            if (!this.initiated) {
                this.initiated = true
                this.element?.classList.add('initiated')
                external.createNext()
            }
        })
        prenom.addEventListener('input', () => {
            this.prenom = prenom.innerText
            prenom.classList.toggle('error', false)
            if (!this.initiated) {
                this.initiated = true
                this.element?.classList.add('initiated')
                external.createNext()
            }
        })
        rm.addEventListener('click', () => {
            this.remove()
            external.onRemove()
        })
    }
}

// src/client/groupe/main.ts
var groupe = document.querySelector('header > h1')
var buttonImage = document.querySelector('header > label > input')
var image = document.querySelector('header > label > img')
var main = document.querySelector('main')
var erreurs = document.querySelector('footer > p')
var enregistrer = document.querySelector('footer > button')
var membres = []
function createMembre() {
    const id = Math.floor(Math.random() * 1e7).toString(36)
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
function validerMembres() {
    let erreur = false
    const m = membres.filter((m2) => m2.initiated).map((membre) => {
        if (membre.nom.length === 0) {
            membre.element?.querySelector('div:nth-child(1)')?.classList.toggle(
                'error',
                true,
            )
            erreur = true
        }
        if (membre.prenom.length === 0) {
            membre.element?.querySelector('div:nth-child(2)')?.classList.toggle(
                'error',
                true,
            )
            erreur = true
        }
        return [
            membre.nom,
            membre.prenom,
        ]
    })
    if (m.length === 0) {
        main.classList.toggle('error', true)
    }
    return [
        !erreur,
        m,
    ]
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
    const [valide, membres2] = validerMembres()
    if (!valide || membres2.length === 0) {
        validation = false
        indication +=
            'Veuillez remplir les noms et pr\xE9noms de tous les membres.\n'
    }
    if (groupe.innerText === 'Nom du groupe') {
        indication += 'Veuillez donner un nom \xE0 votre groupe.\n'
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
        prompt("Entrez 'oui' pour cr\xE9er le groupe " + groupe.innerText) !==
            'oui'
    ) return
    const form = new FormData()
    form.set('img', img)
    form.set('nom', groupe.innerText.trim())
    form.set('membres', JSON.stringify(membres2))
    const response = await fetch('/groupe', {
        method: 'POST',
        body: form,
    })
    if (response.ok) {
        enregistrer.style.display = 'none'
        erreurs.innerText = groupe.innerText.trim() + ' enregistr\xE9'
        erreurs.style.textAlign = 'center'
    }
})
