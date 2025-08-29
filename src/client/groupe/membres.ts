const membres: Membre[] = []
const parent = document.querySelector('main') as HTMLElement

// On passe sur chaque membre vérifier s'il est correcte sinon on prévient
export function validerMembres(): [boolean, [string, string][]] {
    let erreur = false
    const m: [string, string][] = membres
        .filter((m) => m.initiated)
        .map((membre) => {
            erreur = !membre.estValide()
            return [membre.nom, membre.prenom]
        })

    if (m.length === 0) {
        parent.classList.toggle('error', true)
    }

    return [!erreur, m]
}

class Membre {
    id: string
    element: HTMLElement
    nom: string = ''
    prenom: string = ''

    initiated: boolean = false
    constructor(parent: HTMLElement) {
        this.id = Math.floor(Math.random() * 10E6).toString(36)

        this.element = document.createElement('section')
        this.element.id = this.id
        this.element.innerHTML = `
            <div contenteditable="true">
            Nom
            </div>
            <div contenteditable="true">
            Prénom
            </div>
            <div>
            -
            </div>
        `
        this.setup()

        // Si le parent était en erreur
        parent.classList.toggle('error', false)
        parent.appendChild(this.element)
        membres.push(this)
    }
    static insert() {
        new Membre(parent)
    }
    estValide(): boolean {
        let erreur = false
        if (this.nom.length === 0) {
            this.element.querySelector('div:nth-child(1)')?.classList
                .toggle('error', true)
            erreur = true
        }
        if (this.prenom.length === 0) {
            this.element.querySelector('div:nth-child(2)')?.classList
                .toggle('error', true)
            erreur = true
        }
        return !erreur
    }
    setup() {
        const nom = this.element.querySelector(
            'div:nth-child(1)',
        ) as HTMLDivElement
        const prenom = this.element.querySelector(
            'div:nth-child(2)',
        ) as HTMLDivElement
        const rm = this.element.querySelector(
            'div:nth-child(3)',
        ) as HTMLDivElement

        nom.addEventListener('input', () => {
            this.nom = nom.innerText.trim()

            nom.classList.toggle('error', false)
            if (!this.initiated) {
                this.initiated = true
                this.element.classList.add('initiated')
                Membre.insert()
            }
        })
        prenom.addEventListener('input', () => {
            this.prenom = prenom.innerText.trim()

            prenom.classList.toggle('error', false)
            if (!this.initiated) {
                this.initiated = true
                this.element.classList.add('initiated')
                Membre.insert()
            }
        })
        rm.addEventListener('click', () => {
            this.element.remove()
            const i = membres.findIndex((p) => p.id === this.id)
            membres.splice(i, 1)
        })
    }
}
Membre.insert()

export default membres
