// 音乐数据库从 data/music.json 加载
// 说明：cover字段支持两种格式
// 1. 本地路径：'img/interests/music/filename.webp'
// 2. 网络链接：'https://...' 或 'http://...'
// videoUrl为可选字段，用来配置歌曲对应的MV / LIVE外链
let musicDatabase = {};

async function loadMusicDatabase() {
    try {
        const res = await fetch('data/music.json');
        if (!res.ok) throw new Error('Failed to load music data');
        musicDatabase = await res.json();
    } catch (e) {
        console.error('Error loading music data:', e);
        musicDatabase = {};
    }
}


// 当前选中的歌曲
let currentSong = null;

// 标题显示策略：中文缺失时回退英文，英文缺失时回退中文
function getSongTitleByLanguage(song, lang) {
    const titleCn = (song.titleCn || '').trim();
    const titleEn = (song.titleEn || '').trim();

    if (lang === 'zh') {
        return titleCn || titleEn;
    }
    return titleEn || titleCn;
}

function getMusicVideoOverlayText(lang, hasVideo) {
    if (lang === 'zh') {
        return hasVideo ? '点击查看 MV / Live' : '暂无 MV / Live';
    }
    return hasVideo ? 'Click to view MV / Live' : 'No MV / Live available';
}

// 汇总所有流派歌曲，避免新增流派后遗漏到随机/全部列表
function getAllSongs() {
    return Object.values(musicDatabase).flat();
}

// 预加载所有专辑封面图片
function preloadAlbumCovers() {
    const allSongs = getAllSongs();
    const loadedImages = [];
    
    allSongs.forEach(song => {
        const img = new Image();
        img.src = song.cover;
        loadedImages.push(img);
    });
    
    console.log(`预加载了 ${loadedImages.length} 张专辑封面`);
}

// 初始化音乐播放器
function initMusicPlayer() {
    const genreSelect = document.getElementById('genre-select');
    const songSelect = document.getElementById('song-select');
    const randomBtn = document.getElementById('random-btn');
    const coverLink = document.getElementById('music-cover-link');

    // 预加载所有专辑封面
    preloadAlbumCovers();

    // 随机选择一首歌作为初始显示
    currentSong = getRandomSong();
    updateDisplay(currentSong);
    
    // 更新流派选择框到当前歌曲的流派
    const currentGenre = getSongGenre(currentSong);
    genreSelect.value = currentGenre;
    updateSongOptions(currentGenre);

    // 流派选择事件
    genreSelect.addEventListener('change', function() {
        updateSongOptions(this.value);
    });

    // 歌曲选择事件
    songSelect.addEventListener('change', function() {
        const selectedSong = findSongById(this.value);
        if (selectedSong) {
            currentSong = selectedSong;
            updateDisplay(selectedSong);
        }
    });

    // 随机播放按钮
    randomBtn.addEventListener('click', function() {
        const randomSong = getRandomSong();
        currentSong = randomSong;
        updateDisplay(randomSong);
        
        // 更新选择框
        const genre = getSongGenre(randomSong);
        genreSelect.value = genre;
        updateSongOptions(genre);
        songSelect.value = randomSong.id;
    });

    // 监听语言切换事件，更新歌曲选项显示
    window.addEventListener('languageChanged', function() {
        updateSongOptions(genreSelect.value);
        if (currentSong) {
            updateDisplay(currentSong);
        }
        // 保持当前歌曲选中
        if (currentSong) {
            songSelect.value = currentSong.id;
        }
    });

    if (coverLink) {
        coverLink.addEventListener('click', function(event) {
            if (this.classList.contains('music-cover-link--inactive') || !this.dataset.videoUrl) {
                event.preventDefault();
            }
        });
    }
}

// 更新歌曲选项
function updateSongOptions(genre) {
    const songSelect = document.getElementById('song-select');
    songSelect.innerHTML = '';

    let songs = [];
    if (genre === 'all') {
        songs = getAllSongs();
    } else {
        songs = musicDatabase[genre] || [];
    }

    // 获取当前语言设置
    const currentLang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';

    songs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.id;
        // 根据语言设置显示歌曲名称，缺失时自动回退
        option.textContent = getSongTitleByLanguage(song, currentLang);
        songSelect.appendChild(option);
    });

    // 默认选中当前歌曲
    if (currentSong) {
        songSelect.value = currentSong.id;
    } else if (songs.length > 0) {
        currentSong = songs[0];
        updateDisplay(currentSong);
    }
}

// 更新显示
function updateDisplay(song) {
    const albumCover = document.getElementById('album-cover');
    const container = document.querySelector('.music-player-container');
    const coverLink = document.getElementById('music-cover-link');
    const coverOverlayText = document.getElementById('music-cover-overlay-text');
    const currentLang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
    
    // 添加加载状态
    albumCover.style.opacity = '0.5';
    
    // 创建新图片对象以确保图片已加载
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 支持跨域图片
    
    img.onload = function() {
        albumCover.src = song.cover;
        albumCover.alt = `${song.titleCn} album cover`;
        albumCover.crossOrigin = 'anonymous';
        albumCover.style.opacity = '1';
    };
    img.onerror = function() {
        // 如果图片加载失败，仍然显示并恢复透明度
        albumCover.src = song.cover;
        albumCover.crossOrigin = 'anonymous';
        albumCover.style.opacity = '1';
        console.error('专辑封面加载失败，可能是网络问题或链接无效:', song.cover);
    };
    img.src = song.cover;
    
    const titleCn = (song.titleCn || '').trim();
    const titleEn = (song.titleEn || '').trim();

    // 中文名缺失时，主标题回退到英文，副标题保留英文原名
    document.getElementById('song-title-cn').textContent = titleCn || titleEn;
    document.getElementById('song-title-en').textContent = titleEn || titleCn;

    // 如果当前为中文界面，进一步保证下拉与显示一致
    if (currentLang === 'zh' && !titleCn) {
        document.getElementById('song-title-cn').textContent = titleEn;
    }
    document.getElementById('artist-name').textContent = song.artist;
    document.getElementById('lyrics-text').innerHTML = song.description;

    const videoUrl = (song.videoUrl || '').trim();
    if (coverLink) {
        coverLink.dataset.videoUrl = videoUrl;
        coverLink.classList.toggle('music-cover-link--active', Boolean(videoUrl));
        coverLink.classList.toggle('music-cover-link--inactive', !videoUrl);

        if (videoUrl) {
            coverLink.href = videoUrl;
            coverLink.target = '_blank';
            coverLink.rel = 'noopener noreferrer';
            coverLink.removeAttribute('aria-disabled');
        } else {
            coverLink.href = '#';
            coverLink.removeAttribute('target');
            coverLink.removeAttribute('rel');
            coverLink.setAttribute('aria-disabled', 'true');
        }
    }

    if (coverOverlayText) {
        const overlayText = getMusicVideoOverlayText(currentLang, Boolean(videoUrl));
        coverOverlayText.textContent = overlayText;
        if (coverLink) {
            coverLink.setAttribute('aria-label', overlayText);
        }
    }

    // 添加淡入动画
    container.style.opacity = '0';
    setTimeout(() => {
        container.style.opacity = '1';
    }, 50);
}

// 根据ID查找歌曲
function findSongById(id) {
    for (let genre in musicDatabase) {
        const song = musicDatabase[genre].find(s => s.id === id);
        if (song) return song;
    }
    return null;
}

// 获取歌曲所属流派
function getSongGenre(song) {
    for (let genre in musicDatabase) {
        if (musicDatabase[genre].includes(song)) {
            return genre;
        }
    }
    return 'all';
}

// 获取随机歌曲
function getRandomSong() {
    const allSongs = getAllSongs();
    const randomIndex = Math.floor(Math.random() * allSongs.length);
    return allSongs[randomIndex];
}

// 页面加载时先加载数据，再初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await loadMusicDatabase();
        initMusicPlayer();
    });
} else {
    loadMusicDatabase().then(initMusicPlayer);
}
