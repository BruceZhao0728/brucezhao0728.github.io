// ========================================
// Updates Management - Load and display updates
// ========================================

// Load updates from JSON file
async function loadUpdates() {
    try {
        const response = await fetch('data/updates.json');
        if (!response.ok) {
            throw new Error('Failed to load updates');
        }
        const updates = await response.json();
        return updates.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error loading updates:', error);
        return [];
    }
}

// Format date to readable format
function formatUpdateDate(dateStr) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(getCurrentLanguage() === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Render updates section
async function renderUpdates() {
    const container = document.getElementById('updates-container');
    if (!container) return;

    // Show loading state
    container.innerHTML = `<div class="timeline"><p class="loading-text">${translateUpdates('loading')}</p></div>`;

    const updates = await loadUpdates();

    if (updates.length === 0) {
        container.innerHTML = `<div class="timeline"><p class="no-updates-text">${translateUpdates('noUpdates')}</p></div>`;
        return;
    }

    const currentLang = getCurrentLanguage();
    const timelineItems = updates.map(update => `
        <div class="timeline-item">
            <div class="timeline-content">
                <h3 class="timeline-title">${update.emoji || '📝'} ${update.title[currentLang]}</h3>
                <p class="timeline-date">${formatUpdateDate(update.date)}</p>
                <p>${update.content[currentLang]}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="timeline">${timelineItems}</div>`;
}

// Re-render updates when language changes
function onLanguageChange() {
    renderUpdates();
}

// Listen for language changes
window.addEventListener('languageChanged', onLanguageChange);
