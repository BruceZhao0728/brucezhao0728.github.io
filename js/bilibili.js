// ========================================
// Bilibili Video Display
// 从 data/bilibili-videos.json 读取预获取的视频数据并渲染
//
// 数据更新方式:
//   运行 python fetch_bilibili.py 来刷新视频数据
//   或运行 start.bat 自动获取最新数据
// ========================================

// ========================================
// 配置
// ========================================
const BILIBILI_UID = '1989971992';  // 仅用于 "去 B 站主页" 链接

// ========================================
// 工具函数
// ========================================

function formatBilibiliCount(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return String(num);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatBilibiliDate(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp * 1000;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const mins = Math.floor(diff / (1000 * 60));
            return mins <= 0 ? '刚刚' : mins + '分钟前';
        }
        return hours + '小时前';
    } else if (days < 30) {
        return days + '天前';
    } else if (days < 365) {
        return Math.floor(days / 30) + '个月前';
    } else {
        return Math.floor(days / 365) + '年前';
    }
}

// ========================================
// 渲染
// ========================================

function createBilibiliVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'bilibili-video-card';

    card.innerHTML =
        '<div class="bilibili-video-cover-wrapper">' +
            '<img class="bilibili-video-cover"' +
                 ' src="' + escapeHtml(video.cover) + '"' +
                 ' alt="' + escapeHtml(video.title) + '"' +
                 ' loading="lazy"' +
                 ' referrerpolicy="no-referrer"' +
                 ' onerror="this.src=\'data:image/svg+xml,' +
                     '<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22>' +
                     '<rect fill=%22%23e2e8f0%22 width=%22320%22 height=%22180%22/>' +
                     '<text fill=%22%2394a3b8%22 x=%22160%22 y=%2290%22 text-anchor=%22middle%22 font-size=%2214%22>' +
                     '封面加载失败</text></svg>\'">' +
            '<span class="bilibili-video-duration">' + escapeHtml(video.duration) + '</span>' +
            '<div class="bilibili-video-play-overlay">' +
                '<svg viewBox="0 0 24 24" width="48" height="48" fill="white">' +
                    '<path d="M8 5v14l11-7z"/>' +
                '</svg>' +
            '</div>' +
        '</div>' +
        '<div class="bilibili-video-info">' +
            '<h3 class="bilibili-video-title" title="' + escapeHtml(video.title) + '">' +
                escapeHtml(video.title) +
            '</h3>' +
            '<div class="bilibili-video-meta">' +
                '<span class="bilibili-video-stat" title="播放量">' +
                    '▶ ' + formatBilibiliCount(video.playCount) +
                '</span>' +
                '<span class="bilibili-video-stat" title="弹幕数">' +
                    '💬 ' + formatBilibiliCount(video.danmakuCount) +
                '</span>' +
                '<span class="bilibili-video-date">' +
                    escapeHtml(formatBilibiliDate(video.created)) +
                '</span>' +
            '</div>' +
        '</div>';

    card.addEventListener('click', function () {
        window.open(video.url, '_blank', 'noopener,noreferrer');
    });
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', '观看视频: ' + video.title);
    card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.open(video.url, '_blank', 'noopener,noreferrer');
        }
    });

    return card;
}

function renderVideos(videos) {
    var container = document.getElementById('bilibili-videos-container');
    if (!container) return;

    container.innerHTML = '';

    if (!videos || videos.length === 0) {
        container.innerHTML =
            '<div class="bilibili-empty">' +
                '<p>暂无视频</p>' +
                '<p class="bilibili-empty-sub">No videos found</p>' +
            '</div>';
        return;
    }

    var grid = document.createElement('div');
    grid.className = 'bilibili-video-grid';

    for (var i = 0; i < videos.length; i++) {
        grid.appendChild(createBilibiliVideoCard(videos[i]));
    }

    container.appendChild(grid);
}

// ========================================
// 数据加载
// ========================================

function loadBilibiliVideos() {
    var container = document.getElementById('bilibili-videos-container');
    if (!container) return;

    // 显示加载状态
    container.innerHTML =
        '<div class="bilibili-loading">' +
            '<div class="bilibili-spinner"></div>' +
            '<p>加载视频中...</p>' +
            '<p class="bilibili-loading-sub">Loading videos from Bilibili</p>' +
        '</div>';

    fetch('data/bilibili-videos.json')
        .then(function (resp) {
            if (!resp.ok) {
                throw new Error('HTTP ' + resp.status);
            }
            return resp.json();
        })
        .then(function (data) {
            if (data.videos && data.videos.length > 0) {
                renderVideos(data.videos);

                // 显示更新时间
                if (data.updatedStr) {
                    var updateInfo = document.createElement('p');
                    updateInfo.className = 'text-center';
                    updateInfo.style.cssText =
                        'margin-top: 1rem; font-size: 0.78rem; color: var(--text-light);';
                    updateInfo.textContent = '数据更新于 ' + data.updatedStr +
                        ' | Data updated on ' + data.updatedStr;
                    container.parentElement.appendChild(updateInfo);

                    // 存储引用以便语言切换时移除
                    updateInfo.setAttribute('data-bilibili-update-info', 'true');
                }
            } else if (data.error) {
                showError('获取视频数据时出错: ' + data.error);
            } else {
                showEmpty();
            }
        })
        .catch(function (err) {
            console.warn('[Bilibili] 加载静态数据失败:', err.message);
            showSetupGuide();
        });
}

function showError(message) {
    var container = document.getElementById('bilibili-videos-container');
    if (!container) return;

    container.innerHTML =
        '<div class="bilibili-error">' +
            '<p>😿 视频加载失败</p>' +
            '<p class="bilibili-error-sub">' + escapeHtml(message) + '</p>' +
            '<p class="bilibili-error-sub" style="margin-top: 0.75rem;">' +
                '请运行 <code>python fetch_bilibili.py</code> 刷新数据' +
            '</p>' +
            '<a href="https://space.bilibili.com/' + escapeHtml(BILIBILI_UID) + '"' +
               ' target="_blank" rel="noopener noreferrer"' +
               ' class="btn btn-primary"' +
               ' style="margin-top: 1rem; display: inline-block;">' +
                '前往 Bilibili 主页 →' +
            '</a>' +
        '</div>';
}

function showEmpty() {
    var container = document.getElementById('bilibili-videos-container');
    if (!container) return;

    container.innerHTML =
        '<div class="bilibili-empty">' +
            '<p>暂无视频</p>' +
            '<p class="bilibili-empty-sub">该账号暂未发布视频</p>' +
            '<a href="https://space.bilibili.com/' + escapeHtml(BILIBILI_UID) + '"' +
               ' target="_blank" rel="noopener noreferrer"' +
               ' class="btn btn-outline"' +
               ' style="margin-top: 1rem; display: inline-block;">' +
                '前往 Bilibili 主页 →' +
            '</a>' +
        '</div>';
}

function showSetupGuide() {
    var container = document.getElementById('bilibili-videos-container');
    if (!container) return;

    container.innerHTML =
        '<div class="bilibili-placeholder">' +
            '<p>🔧 首次使用需要获取视频数据</p>' +
            '<p class="bilibili-placeholder-sub">' +
                '在项目根目录运行以下命令来拉取你的 Bilibili 视频列表：' +
            '</p>' +
            '<p class="bilibili-placeholder-sub" style="margin-top: 0.5rem;">' +
                '<code style="font-size: 1rem; padding: 0.4em 0.8em;">python fetch_bilibili.py</code>' +
            '</p>' +
            '<p class="bilibili-placeholder-hint">' +
                '或直接运行 <code>start.bat</code> 自动获取并启动网站' +
            '</p>' +
        '</div>';
}

// ========================================
// 初始化
// ========================================

if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBilibiliVideos);
    } else {
        loadBilibiliVideos();
    }
}
