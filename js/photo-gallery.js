document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('photo-lightbox');
    if (!dialog?.showModal) return;

    const links = [...document.querySelectorAll('a[data-photo-group][href]')];
    const image = dialog.querySelector('.lightbox-image');
    const caption = dialog.querySelector('.lightbox-caption');
    const count = dialog.querySelector('.lightbox-count');
    const previous = dialog.querySelector('.lightbox-prev');
    const next = dialog.querySelector('.lightbox-next');
    const close = dialog.querySelector('.lightbox-close');
    let activeLink;
    let group = [];

    function display(link) {
        activeLink = link;
        group = links.filter(item => item.dataset.photoGroup === link.dataset.photoGroup);
        const position = group.indexOf(link);
        image.src = link.href;
        image.alt = link.dataset.caption || link.getAttribute('aria-label') || '';
        caption.textContent = link.dataset.caption || '';
        count.textContent = `${position + 1} / ${group.length}`;
        previous.disabled = next.disabled = group.length < 2;
    }

    function step(amount) {
        if (group.length < 2) return;
        const index = group.indexOf(activeLink);
        display(group[(index + amount + group.length) % group.length]);
    }

    for (const link of links) link.addEventListener('click', event => {
        event.preventDefault();
        display(link);
        dialog.showModal();
    });
    previous.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    });
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
        image.removeAttribute('src');
        activeLink?.focus();
    });
});
