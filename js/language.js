// ========================================
// Language Management System
// ========================================

const LANGUAGE_STORAGE_KEY = 'preferred-language';
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = {
    'en': 'English',
    'zh': '中文'
};

// 翻译字典从 data/translations.json 加载（缓存 Promise，避免重复请求）
let translations = null;
let translationsPromise = null;

function loadTranslations() {
    if (!translationsPromise) {
        translationsPromise = fetch('data/translations.json')
            .then(r => {
                if (!r.ok) throw new Error('Failed to load translations');
                return r.json();
            })
            .then(data => { translations = data; })
            .catch(err => {
                console.error('Error loading translations:', err);
                translations = {};
            });
    }
    return translationsPromise;
}

// 根据字典名与 key 取翻译文本（未加载时回退为 key）
function getTranslation(dictKey, key) {
    const currentLang = getCurrentLanguage();
    const dict = (translations && translations[dictKey]) || {};
    return dict[currentLang]?.[key] || dict['en']?.[key] || key;
}

// Get current language preference
function getCurrentLanguage() {
    let lang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!lang || !SUPPORTED_LANGUAGES[lang]) {
        // Auto-detect browser language
        const browserLang = navigator.language.split('-')[0];
        lang = SUPPORTED_LANGUAGES[browserLang] ? browserLang : DEFAULT_LANGUAGE;
        // 保存到localStorage，但不重新加载页面
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
    return lang;
}

// Set language preference
function setLanguage(lang) {
    if (SUPPORTED_LANGUAGES[lang]) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        // Dispatch custom event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        // Reload components and content with new language
        location.reload();
    }
}

// Get text in current language (for blog content)
function getLocalizedText(value) {
    const currentLang = getCurrentLanguage();
    if (value && typeof value === 'object') {
        return value[currentLang] || value.en || value.zh || '';
    }
    return value || '';
}

// Get title in both languages (for blog cards)
function getBilingualText(value, separator = ' | ') {
    if (value && typeof value === 'object') {
        const en = value.en || '';
        const zh = value.zh || '';
        if (en && zh) {
            return `${en}${separator}${zh}`;
        }
        return en || zh;
    }
    return value || '';
}

// Get blog title based on language preference (only show selected language)
function getLocalizedBlogTitle(titleObj) {
    const currentLang = getCurrentLanguage();
    if (titleObj && typeof titleObj === 'object') {
        return titleObj[currentLang] || titleObj.en || titleObj.zh || '';
    }
    return titleObj || '';
}

// Translate navigation text
function translateNav(key) {
    return getTranslation('nav', key);
}

// Translate blog page text
function translateBlog(key) {
    return getTranslation('blog', key);
}

// Translate updates section text
function translateUpdates(key) {
    return getTranslation('updates', key);
}

// Translate home page text
function translateHome(key) {
    return getTranslation('home', key);
}

// Translate research page text
function translateResearch(key) {
    return getTranslation('research', key);
}

// Change language (called from navbar)
function changeLanguage(lang) {
    setLanguage(lang);
}
