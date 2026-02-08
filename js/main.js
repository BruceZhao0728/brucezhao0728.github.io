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

// Simple Markdown to HTML parser
class MarkdownParser {
    constructor() {
        this.rules = [
            // 标题
            { pattern: /^### (.*$)/gim, replacement: '<h3>$1</h3>' },
            { pattern: /^## (.*$)/gim, replacement: '<h2>$1</h2>' },
            { pattern: /^# (.*$)/gim, replacement: '<h1>$1</h1>' },
            
            // 粗体和斜体
            { pattern: /\*\*\*(.+?)\*\*\*/g, replacement: '<strong><em>$1</em></strong>' },
            { pattern: /\*\*(.+?)\*\*/g, replacement: '<strong>$1</strong>' },
            { pattern: /\*(.+?)\*/g, replacement: '<em>$1</em>' },
            { pattern: /___(.+?)___/g, replacement: '<strong><em>$1</em></strong>' },
            { pattern: /__(.+?)__/g, replacement: '<strong>$1</strong>' },
            { pattern: /_(.+?)_/g, replacement: '<em>$1</em>' },
            
            // 链接
            { pattern: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: '<a href="$2">$1</a>' },
            
            // 图片
            { pattern: /!\[([^\]]*)\]\(([^)]+)\)/g, replacement: '<img src="$2" alt="$1" />' },
            
            // 行内代码
            { pattern: /`([^`]+)`/g, replacement: '<code>$1</code>' },
            
            // 分割线
            { pattern: /^\s*---\s*$/gim, replacement: '<hr />' },
            { pattern: /^\s*\*\*\*\s*$/gim, replacement: '<hr />' },
            
            // 无序列表
            { pattern: /^\s*[\*\-]\s+(.+)$/gim, replacement: '<li>$1</li>' },
            
            // 有序列表
            { pattern: /^\s*\d+\.\s+(.+)$/gim, replacement: '<li>$1</li>' },
            
            // 引用
            { pattern: /^>\s+(.+)$/gim, replacement: '<blockquote>$1</blockquote>' },
            
            // 段落
            { pattern: /\n\n/g, replacement: '</p><p>' }
        ];
    }
    
    parse(markdown) {
        let html = markdown;
        
        // 处理代码块
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre>`;
        });
        
        // 应用所有规则
        this.rules.forEach(rule => {
            html = html.replace(rule.pattern, rule.replacement);
        });
        
        // 包装列表
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // 包装段落
        html = '<p>' + html + '</p>';
        
        // 清理多余的段落标签
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr \/>)/g, '$1');
        html = html.replace(/(<hr \/>)<\/p>/g, '$1');
        
        return html;
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// 加载并解析Markdown文件
async function loadMarkdownFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('文件加载失败');
        }
        const markdown = await response.text();
        const parser = new MarkdownParser();
        return parser.parse(markdown);
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
