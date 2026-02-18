// ========================================
// Component Loader - Load navbar and footer
// ========================================

// Load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentPath}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
        return true;
    } catch (error) {
        console.error('Error loading component:', error);
        showComponentError(elementId);
        return false;
    }
}

// Display component loading error message
function showComponentError(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (elementId === 'navbar-placeholder') {
        // If navbar loading fails, display a simple navbar
        element.innerHTML = `
            <nav class="navbar" style="background: #f44336; color: white;">
                <div class="nav-container">
                    <div style="padding: 1rem; text-align: center; width: 100%;">
                        <p style="margin: 0; font-weight: bold;">⚠️ Please run this website using a local server</p>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
                            Run command: <code style="background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 4px;">python -m http.server 8000</code>
                            or double-click <code style="background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 4px;">start.bat</code>
                        </p>
                    </div>
                </div>
            </nav>
            <nav class="navbar" style="top: 80px;">
                <div class="nav-container">
                    <a href="index.html" class="nav-logo">Zichen's Website</a>
                    <ul class="nav-menu" style="display: flex;">
                        <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
                        <li class="nav-item"><a href="interests.html" class="nav-link">Interests</a></li>
                        <li class="nav-item"><a href="research.html" class="nav-link">Research</a></li>
                        <li class="nav-item"><a href="blog.html" class="nav-link">博客</a></li>
                        <li class="nav-item"><a href="awards.html" class="nav-link">荣誉</a></li>
                    </ul>
                </div>
            </nav>
        `;
    }
}

// 页面加载完成后加载组件
document.addEventListener('DOMContentLoaded', async () => {
    // 加载导航栏
    const navbarLoaded = await loadComponent('navbar-placeholder', 'components/navbar.html');
    
    // 导航栏加载完成后立即翻译
    if (navbarLoaded) {
        translateNavItems();
        setActiveNav();
        setupNavbarLanguageSelector();
    }
    
    // 加载页脚
    const footerLoaded = await loadComponent('footer-placeholder', 'components/footer.html');
    
    // 如果页脚加载失败，显示简单页脚
    if (!footerLoaded) {
        const footerElement = document.getElementById('footer-placeholder');
        if (footerElement) {
            footerElement.innerHTML = `
                <footer class="footer">
                    <div class="footer-content">
                        <p>&copy; 2026 个人主页. All rights reserved.</p>
                    </div>
                </footer>
            `;
        }
    }
    
    // 组件加载完成后，初始化导航栏功能
    initNavbar();
});

// 初始化导航栏功能
function initNavbar() {
    // 设置当前页面的导航高亮
    setActiveNav();
    
    // 移动端菜单切换
    setupMobileMenu();
    
    // 导航栏滚动效果
    setupNavbarScroll();
}

// 设置语言选择器
function setupNavbarLanguageSelector() {
    // 使用 setTimeout 确保 DOM 已完全更新
    setTimeout(() => {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            const currentLang = getCurrentLanguage();
            languageSelect.value = currentLang;
        }
    }, 0);
}

// 设置移动端菜单
function setupMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // 点击菜单项后关闭移动端菜单
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                }
            });
        });
    }
}

// 设置导航栏滚动效果
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// 翻译导航项
function translateNavItems() {
    const navLinks = document.querySelectorAll('.nav-link[data-i18n]');
    navLinks.forEach(link => {
        const key = link.getAttribute('data-i18n');
        link.textContent = translateNav(key);
    });
}

// 设置当前页面的导航高亮
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
