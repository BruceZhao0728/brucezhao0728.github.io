// ========================================
// Language Management System
// ========================================

const LANGUAGE_STORAGE_KEY = 'preferred-language';
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = {
    'en': 'English',
    'zh': '中文'
};

// Navigation translations
const navTranslations = {
    'en': {
        'home': 'Home',
        'interests': 'Interests',
        'research': 'Research',
        'blog': 'Blog',
        'awards': 'Awards'
    },
    'zh': {
        'home': '主页',
        'interests': '兴趣',
        'research': '研究',
        'blog': '博客',
        'awards': '荣誉'
    }
};

// Blog page translations
const blogTranslations = {
    'en': {
        'btnAll': 'All',
        'btnTech': 'Tech',
        'btnLife': 'Life',
        'btnStudy': 'Study',
        'sortTime': 'Time (newest first)',
        'sortTimeOld': 'Time (oldest first)',
        'sortZhAsc': 'Chinese title (A-Z)',
        'sortZhDesc': 'Chinese title (Z-A)',
        'sortEnAsc': 'English title (A-Z)',
        'sortEnDesc': 'English title (Z-A)',
        'loading': 'Loading blog posts...',
        'noBlogs': 'No blog posts available',
        'backToBlog': '← Back to Blog',
        'categoryLabel': 'Category: ',
        'tagsLabel': 'Tags: ',
        'searchLabel': 'Search: ',
        'sortLabel': 'Sort: ',
        'searchPlaceholder': 'Search...',
        'allTags': 'All Tags',
        'clearSearch': 'Clear',
        'catAll': 'All',
        'catTech': 'Tech',
        'catLife': 'Life',
        'catStudy': 'Study'
    },
    'zh': {
        'btnAll': '全部',
        'btnTech': '技术',
        'btnLife': '生活',
        'btnStudy': '学习',
        'sortTime': '时间（最新优先）',
        'sortTimeOld': '时间（最旧优先）',
        'sortZhAsc': '中文标题（A-Z）',
        'sortZhDesc': '中文标题（Z-A）',
        'sortEnAsc': '英文标题（A-Z）',
        'sortEnDesc': '英文标题（Z-A）',
        'loading': '正在加载博客文章...',
        'noBlogs': '暂无博客文章',
        'backToBlog': '← 返回博客',
        'categoryLabel': '分类: ',
        'tagsLabel': '标签: ',
        'searchLabel': '搜索: ',
        'sortLabel': '排序: ',
        'searchPlaceholder': '搜索文章...',
        'allTags': '全部标签',
        'clearSearch': '清空',
        'catAll': '全部',
        'catTech': '技术',
        'catLife': '生活',
        'catStudy': '学习'
    }
};

// Updates section translations
const updatesTranslations = {
    'en': {
        'sectionTitle': 'Recent Updates',
        'loading': 'Loading updates...',
        'noUpdates': 'No updates available'
    },
    'zh': {
        'sectionTitle': '近期更新',
        'loading': '正在加载更新...',
        'noUpdates': '暂无更新'
    }
};

// Home page translations
const homeTranslations = {
    'en': {
        'viewBlog': 'View Blog',
        'research': 'Research'
    },
    'zh': {
        'viewBlog': '查看博客',
        'research': '研究经历'
    }
};

// Research page translations
const researchTranslations = {
    'en': {
        'sendEmail': 'Send Email',
        'viewResume': 'View Resume'
    },
    'zh': {
        'sendEmail': '发送邮件',
        'viewResume': '查看简历'
    }
};

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
    const currentLang = getCurrentLanguage();
    return navTranslations[currentLang]?.[key] || navTranslations['en'][key] || key;
}

// Translate blog page text
function translateBlog(key) {
    const currentLang = getCurrentLanguage();
    return blogTranslations[currentLang]?.[key] || blogTranslations['en'][key] || key;
}

// Translate updates section text
function translateUpdates(key) {
    const currentLang = getCurrentLanguage();
    return updatesTranslations[currentLang]?.[key] || updatesTranslations['en'][key] || key;
}

// Translate home page text
function translateHome(key) {
    const currentLang = getCurrentLanguage();
    return homeTranslations[currentLang]?.[key] || homeTranslations['en'][key] || key;
}

// Translate research page text
function translateResearch(key) {
    const currentLang = getCurrentLanguage();
    return researchTranslations[currentLang]?.[key] || researchTranslations['en'][key] || key;
}

// Change language (called from navbar)
function changeLanguage(lang) {
    setLanguage(lang);
}
