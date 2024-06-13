
export function createModal() {
    const modalContent = Object.assign(document.createElement('div'), {
        id: 'modal-content'
    });
    const modal = Object.assign(document.createElement('div'),{
        id: 'modal',
        className: 'modal hidden',
    });
    modal.appendChild(modalContent);

    return {modal, modalContent};
}

export function showModal(item) {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'visible');
    modal.innerHTML = `<h2>${item.title}</h2><p>${item.description}</p>`;

    document.body.appendChild(modal);

    modal.addEventListener('click', () => {
        modal.classList.remove('visible');
        setTimeout(() => document.body.removeChild(modal), 300);
    });
}
