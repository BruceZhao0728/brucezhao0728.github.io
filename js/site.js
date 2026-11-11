function getCurrentLanguage() {
    return document.body.dataset.lang || 'en';
}

document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            const open = menuButton.getAttribute('aria-expanded') !== 'true';
            menuButton.setAttribute('aria-expanded', String(open));
            nav.classList.toggle('open', open);
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.focus();
            }
        });
        nav.addEventListener('click', event => {
            if (event.target.closest('a')) {
                nav.classList.remove('open');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
    document.querySelector('.language-link')?.addEventListener('click', event => {
        try { localStorage.setItem('site-language', event.currentTarget.dataset.language); } catch (_) {}
    });

    const cards = [...document.querySelectorAll('.blog-card[data-category]')];
    if (!cards.length) return;
    const search = document.getElementById('blog-search');
    const category = document.getElementById('blog-category');
    const tag = document.getElementById('blog-tag');
    const sort = document.getElementById('blog-sort');
    const grid = document.getElementById('blog-grid');
    const count = document.getElementById('blog-count');
    const empty = document.getElementById('blog-empty');
    const update = () => {
        const query = search.value.trim().toLocaleLowerCase();
        let shown = 0;
        for (const card of cards) {
            const visible = (!query || card.dataset.search.includes(query)) &&
                (category.value === 'all' || card.dataset.category === category.value) &&
                (!tag.value || card.dataset.tags.split('|').includes(tag.value));
            card.hidden = !visible;
            if (visible) shown++;
        }
        const ordered = [...cards].sort((a, b) => sort.value === 'oldest'
            ? a.dataset.date.localeCompare(b.dataset.date)
            : b.dataset.date.localeCompare(a.dataset.date));
        grid.append(...ordered);
        count.textContent = getCurrentLanguage() === 'zh' ? `找到 ${shown} 篇文章` : `${shown} article${shown === 1 ? '' : 's'}`;
        empty.hidden = shown !== 0;
    };
    for (const control of [search, category, tag, sort]) control.addEventListener(control === search ? 'input' : 'change', update);
    update();
});
