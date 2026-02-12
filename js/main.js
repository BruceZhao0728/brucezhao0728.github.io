// ========================================
// Main JavaScript file - Handle navigation, animations and markdown conversion
// ========================================

// Navbar scroll effect
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

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Set current page navigation highlight
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

// Execute after page load
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    
    // Add fade-in animation to all sections
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });
});

// ========================================
// Markdown processing functions
// ========================================

function resolveRelativeUrl(basePath, url) {
    if (!url) return url;
    if (/^(https?:)?\/\//i.test(url)) return url;
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('data:')) return url;
    if (!basePath) return url;
    const baseDir = basePath.substring(0, basePath.lastIndexOf('/') + 1);
    return `${baseDir}${url}`;
}

const CALLOUT_TITLES = {
    note: 'Note',
    tip: 'Tip',
    important: 'Important',
    caution: 'Caution',
    warning: 'Warning'
};

function transformCallouts(html) {
    const container = document.createElement('div');
    container.innerHTML = html;

    const blockquotes = Array.from(container.querySelectorAll('blockquote'));
    blockquotes.forEach(blockquote => {
        const markerNode = findCalloutMarkerNode(blockquote);
        if (!markerNode) return;

        const rawText = markerNode.textContent || '';
        const firstLine = rawText.split(/\r?\n/, 1)[0].trim();
        const match = firstLine.match(/^\[!([a-zA-Z]+)\]\s*(.*)$/);
        if (!match) return;

        const type = match[1].toLowerCase();
        const titleText = match[2].trim() || CALLOUT_TITLES[type] || match[1];

        markerNode.textContent = markerNode.textContent.replace(/^\s*\[!([a-zA-Z]+)\][^\n\r]*[\n\r]?/, '');

        const alert = document.createElement('div');
        alert.className = `md-alert md-alert-${type}`;

        const title = document.createElement('div');
        title.className = 'md-alert-title';
        title.textContent = titleText;

        const body = document.createElement('div');
        body.className = 'md-alert-body';

        while (blockquote.firstChild) {
            body.appendChild(blockquote.firstChild);
        }

        Array.from(body.querySelectorAll('p')).forEach(p => {
            if (!p.textContent.trim() && p.children.length === 0) {
                p.remove();
            }
        });

        alert.appendChild(title);
        alert.appendChild(body);
        blockquote.replaceWith(alert);
    });

    return container.innerHTML;
}

function findFirstTextNode(node) {
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        return node;
    }
    for (const child of Array.from(node.childNodes)) {
        const result = findFirstTextNode(child);
        if (result) return result;
    }
    return null;
}

function findCalloutMarkerNode(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let current = walker.nextNode();
    while (current) {
        if (current.textContent && current.textContent.trim().startsWith('[!')) {
            nodes.push(current);
        }
        current = walker.nextNode();
    }
    return nodes.find(node => /^\s*\[!([a-zA-Z]+)\]/.test(node.textContent)) || null;
}

function parseMarkdown(markdown, basePath) {
    if (window.marked) {
        window.marked.use({
            walkTokens(token) {
                if (token.type === 'image') {
                    token.href = resolveRelativeUrl(basePath, token.href);
                }
                if (token.type === 'link') {
                    token.href = resolveRelativeUrl(basePath, token.href);
                }
            }
        });
        const html = window.marked.parse(markdown);
        return transformCallouts(html);
    }

    // Fallback if marked is not available
    return `<pre><code>${markdown}</code></pre>`;
}

// 加载并解析Markdown文件
async function loadMarkdownFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('文件加载失败');
        }
        const markdown = await response.text();
        return parseMarkdown(markdown, filePath);
    } catch (error) {
        console.error('加载Markdown文件出错:', error);
        return '<p>内容加载失败</p>';
    }
}

// 加载博客列表
async function loadBlogList() {
    try {
        const response = await fetch('data/blogs.json');
        if (!response.ok) {
            throw new Error('博客列表加载失败');
        }
        return await response.json();
    } catch (error) {
        console.error('加载博客列表出错:', error);
        return [];
    }
}

function getBlogText(value) {
    if (value && typeof value === 'object') {
        return value.en || value.zh || '';
    }
    return value || '';
}

function getBlogTitleBoth(value) {
    if (value && typeof value === 'object') {
        const en = value.en || '';
        const zh = value.zh || '';
        if (en && zh) {
            return `${en} | ${zh}`;
        }
        return en || zh;
    }
    return value || '';
}

// 渲染博客列表
async function renderBlogList() {
    const blogListContainer = document.getElementById('blog-list');
    if (!blogListContainer) return;
    
    const blogs = await loadBlogList();
    
    if (blogs.length === 0) {
        blogListContainer.innerHTML = '<p>暂无博客文章</p>';
        return;
    }
    
    blogListContainer.innerHTML = blogs.map(blog => {
        const title = getBlogTitleBoth(blog.title);
        const excerpt = getBlogText(blog.excerpt);
        const readTime = getBlogText(blog.readTime) || '5 min read';
        return `
        <div class="blog-card" onclick="location.href='blog-detail.html?id=${blog.id}'">
            <div class="blog-header">
                <h3 class="blog-title">${title}</h3>
                <div class="blog-meta">
                    <span>📅 ${blog.date}</span>
                    <span>⏱️ ${readTime}</span>
                </div>
            </div>
            <div class="blog-excerpt">
                ${excerpt}
            </div>
            ${blog.tags ? `
                <div class="blog-tags">
                    ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
    }).join('');
}

// 加载博客详情
async function loadBlogDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    
    if (!blogId) {
        document.getElementById('blog-detail').innerHTML = '<p>博客ID不存在</p>';
        return;
    }
    
    // 加载博客列表获取文章信息
    const blogs = await loadBlogList();
    const blog = blogs.find(b => b.id === blogId);
    
    if (!blog) {
        document.getElementById('blog-detail').innerHTML = '<p>博客不存在</p>';
        return;
    }
    
    const titleText = getBlogTitleBoth(blog.title);
    const readTimeText = getBlogText(blog.readTime) || '5 min read';

    // 更新页面标题
    document.title = titleText || document.title;
    
    // 加载markdown内容
    const content = await loadMarkdownFile(blog.file);
    
    // 渲染博客
    document.getElementById('blog-detail').innerHTML = `
        <div class="blog-content">
            <h1>${titleText}</h1>
            <div class="blog-meta mb-2">
                <span>📅 ${blog.date}</span>
                <span>⏱️ ${readTimeText}</span>
            </div>
            ${blog.tags ? `
                <div class="blog-tags mb-2">
                    ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <hr />
            <div class="markdown-content">
                ${content}
            </div>
        </div>
    `;

    if (window.hljs) {
        document.querySelectorAll('.markdown-content pre code').forEach(block => {
            window.hljs.highlightElement(block);
        });
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    }
}

// 平滑滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 添加返回顶部按钮（可选）
function addBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        display: none;
        box-shadow: var(--shadow-lg);
        transition: var(--transition);
        z-index: 999;
    `;
    
    button.addEventListener('click', scrollToTop);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
    
    document.body.appendChild(button);
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    addBackToTopButton();
});
