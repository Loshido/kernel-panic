type ExternalListeners = {
    onRemove: () => void
    createNext: () => void
}

export class Membre {
    id: string
    element?: HTMLElement
    nom: string = ''
    prenom: string = ''

    initiated: boolean = false
    constructor(id: string, parent: HTMLElement, listeners: ExternalListeners) {
        this.id = id
        this.create()
        this.listener(listeners)

        this.element!.id = id

        parent.appendChild(this.element!)
    }

    private create() {
        const section = document.createElement('section')
        section.innerHTML = `
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

        this.element = section
    }
    remove() {
        this.element?.remove()
    }
    listener(external: ExternalListeners) {
        if (!this.element) return
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
