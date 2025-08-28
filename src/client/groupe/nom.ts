const groupe = document.querySelector('header > h1') as HTMLHeadingElement
groupe.addEventListener('input', () => {
    groupe.classList.toggle('error', false)
})

export default groupe
