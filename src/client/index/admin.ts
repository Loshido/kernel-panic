interface Action {
    action: () => void
}
type ActionProps = Action & ({ label: string } | { html: string } | { children: HTMLElement[] })

const action = (props: ActionProps): HTMLElement => {
    const element = document.createElement('div')
    if('label' in props) {
        element.innerText = props.label
    } else if('html' in props) {
        element.innerHTML = props.html
    } else if('children' in props) {
        element.append(...props.children)
    }
    element.addEventListener('click', props.action)

    return element
}

let groupe: string | null = null
const admin = localStorage.getItem('admin')

const confirmationAction = (props: { label: string, onClick: () => void }) => {
    let open = false
    const button = document.createElement('div')
    const confirmation = document.createElement('div')
    button.addEventListener('click', () => {
        if(!open) open = true
        confirmation.style.display = 'block'
    })
    confirmation.addEventListener('click', () => {
        open = false
        confirmation.style.display = 'none'
        props.onClick()
    })
    
    confirmation.style.display = 'none'
    confirmation.classList.add('prompt')
    button.innerText = props.label
    confirmation.innerText = 'Confirmation'
    return [button, confirmation]
}

export default (): HTMLElement => {
    const context = document.createElement('div')  
    let opened = false
    const close = () => {
        context.style.display = 'none'
        opened = false
    }
    const open = (x: number, y: number) => {
        opened = true
        context.style.display = 'flex'

        const rect = context.getBoundingClientRect()

        if(window.innerWidth - rect.width < x) {
            context.style.right = x + 'px'
        } else context.style.left = x + 'px'
        
        const _y = Math.min(y, window.innerHeight - rect.height)
        context.style.top = _y + 'px'
        
    }

    [
        {
            label: "Avancer",
            async action() {
                if(!groupe) return
                const response = await fetch(`/admin/avancer?t=${admin}&g=${groupe}`)
                if(response.ok) close()
            }
        },
        {
            label: "Reculer",
            async action() {
                if(!groupe) return
                const response = await fetch(`/admin/reculer?t=${admin}&g=${groupe}`)
                if(response.ok) close()
            }
        },
        {
            label: "Informations",
            action() {
                console.log('todo()')
            }
        },
        {
            children: confirmationAction({
                    label: 'Reset',
                    async onClick() {
                        if(!groupe) return
                        const response = await fetch(`/admin/reset?t=${admin}&g=${groupe}`)
                        if(response.ok) close()
                    }
                }),
            action() {
            }
        },
    ].forEach(a => {
        context.appendChild(action(a))
    })

    const montagne = document.querySelector('div.montagne') as HTMLElement | null
    document.addEventListener('contextmenu', (event) => {
        const target = event.target as HTMLElement | null
        if(!target || !montagne) {
            if(opened) close()
            return
        };
        if(montagne.contains(target) && target.tagName === 'IMG') {
            event.preventDefault()
            open(event.pageX, event.pageY)
            groupe = target.title
        } else if(opened) close()
    })
    document.addEventListener('click', event => {
        const target = event.target as HTMLElement | null
        if(!target || !montagne) return
        if(!(context.isSameNode(target) || context.contains(target)) && opened) {
            close()
        }
    }) 

    context.style.display = 'none'
    context.id = "context"
    return context
}