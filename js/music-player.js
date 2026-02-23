// 音乐数据库
const musicDatabase = {
    mandopop: [
        {
            id: 'mayday-suddenly-missing-you-so-bad',
            titleCn: '突然好想你',
            titleEn: 'Suddenly Missing You So Bad',
            artist: '五月天 | Mayday',
            cover: 'img/interests/music/mayday_poetry_of_the_day_after.webp',
            description: '<i>突然好想你<br>你会在哪里<br>过得快乐或委屈</i>'
        },
        {
            id: 'cheer-chen-too-smart',
            titleCn: '太聪明',
            titleEn: 'Too Smart',
            artist: '陈绮贞 | Cheer Chen',
            cover: 'img/interests/music/cheer_chen_groupies.webp',
            description: '<i>我开始后悔不应该太聪明地卖弄<br>只是怕亲手将我的真心葬送</i>'
        },
        {
            id: 'jj-lin-romantic',
            titleCn: '浪漫血液',
            titleEn: 'Romantic',
            artist: '林俊杰 | JJ Lin',
            cover: 'img/interests/music/jj_lin_genisis.webp',
            description: '<i>什么伤口都会痊愈 炽热的渴望是勇气<br>在我身上流着浪漫血液</i>'
        },
        {
            id: 'hebe-tien-a-little-happiness',
            titleCn: '小幸运',
            titleEn: 'A Little Happiness',
            artist: '田馥甄 | Hebe Tien',
            cover: 'img/interests/music/hebe_tien_our_times.webp',
            description: '<i>也许当时忙着微笑和哭泣 忙着追逐天空中的流星<br>人理所当然的忘记<br>是谁一直风里雨里默默守护在原地</i>'
        },
        {
            id: 'she-wings-of-my-words',
            titleCn: '你曾是少年',
            titleEn: 'Wings of My Words',
            artist: 'S.H.E',
            cover: 'img/interests/music/she_wings_of_my_words.webp',
            description: '<i>想看遍这世界 去最遥远的远方<br>感觉有双翅膀 能飞越高山和海洋</i>'
        },
        {
            id: 'stephanie-sun-against-the-light',
            titleCn: '逆光',
            titleEn: 'Against the Light',
            artist: '孙燕姿 | Stephanie Sun',
            cover: 'img/interests/music/stephanie_sun_against_the_light.webp',
            description: '<i>有一束光 那瞬间 是什么痛得刺眼<br>你的视线 是谅解 为什么舍不得熄灭</i>'
        }
    ],
    cantopop: [
        {
            id: 'kay-tse-wedding-card-street',
            titleCn: '喜帖街',
            titleEn: 'Wedding Card Street',
            artist: '谢安琪 | Kay Tse',
            cover: 'img/interests/music/kay_tse_binary.webp',
            description: '<i>忘掉砌过的沙<br>回忆的堡垒 刹那已倒下</i>'
        },
        {
            id: 'eason-chan-people-come-and-go',
            titleCn: '人来人往',
            titleEn: 'People Come and Go',
            artist: '陈奕迅 | Eason Chan',
            cover: 'img/interests/music/eason_chan_the_line_up.webp',
            description: '<i>拥不拥有也会记住谁<br>快不快乐留在身体里</i>'
        },
        {
            id: 'sammi-cheng-beautiful-life',
            titleCn: '终身美丽',
            titleEn: 'Beautiful Life',
            artist: '郑秀文 | Sammi Cheng',
            cover: 'img/interests/music/sammi_cheung_shocking_pink.webp',
            description: '充满力量的励志歌曲，向身边所有人展现自信与美丽的态度'
        },
        {
            id: 'twins-next-station-tin-hau',
            titleCn: '下一站天后',
            titleEn: 'Next Station: Tin Hau',
            artist: 'Twins',
            cover: 'img/interests/music/twins_touch_of_love.webp',
            description: '<i>再下个车站 到天后 当然最好</i>'
        }
    ],
    classical: [
        {
            id: 'vivaldi-four-seasons',
            titleCn: '维瓦尔第：四季',
            titleEn: 'Vivaldi: The Four Seasons',
            artist: 'Anne-Sophie Mutter',
            cover: 'img/interests/music/anne_sophie_mutter_vivaldi_the_four_seasons.webp',
            description: '巴洛克时期的经典之作，用音乐描绘四季的变化与美景，辅之以小提琴的悠扬音色，堪称经典中的经典'
        },
        {
            id: 'rachmaninoff-piano-concerto-no3',
            titleCn: '拉赫玛尼诺夫第三钢琴协奏曲',
            titleEn: 'Rachmaninoff Piano Concerto No.3',
            artist: '王羽佳 | Yuja Wang',
            cover: 'img/interests/music/yuja_wang_rachmaninoff.webp',
            description: '技术难度极高的钢琴协奏曲，充满激情与浪漫主义色彩'
        },
        {
            id: 'beethoven-piano-concerto-no1',
            titleCn: '贝多芬第一钢琴协奏曲',
            titleEn: "Beethoven Piano Concerto No.1",
            artist: 'Krystian Zimerman',
            cover: 'img/interests/music/krystian_zimerman_beethoven.webp',
            description: '贝多芬早期代表作，展现了古典主义的优雅与力量'
        }
    ]
};

// 当前选中的歌曲
let currentSong = null;

// 初始化音乐播放器
function initMusicPlayer() {
    const genreSelect = document.getElementById('genre-select');
    const songSelect = document.getElementById('song-select');
    const randomBtn = document.getElementById('random-btn');

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
        // 保持当前歌曲选中
        if (currentSong) {
            songSelect.value = currentSong.id;
        }
    });
}

// 更新歌曲选项
function updateSongOptions(genre) {
    const songSelect = document.getElementById('song-select');
    songSelect.innerHTML = '';

    let songs = [];
    if (genre === 'all') {
        songs = [...musicDatabase.mandopop, ...musicDatabase.cantopop, ...musicDatabase.classical];
    } else {
        songs = musicDatabase[genre] || [];
    }

    // 获取当前语言设置
    const currentLang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';

    songs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.id;
        // 根据语言设置显示歌曲名称，不显示艺术家
        option.textContent = currentLang === 'zh' ? song.titleCn : song.titleEn;
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
    document.getElementById('album-cover').src = song.cover;
    document.getElementById('album-cover').alt = `${song.titleCn} album cover`;
    document.getElementById('song-title-cn').textContent = song.titleCn;
    document.getElementById('song-title-en').textContent = song.titleEn;
    document.getElementById('artist-name').textContent = song.artist;
    document.getElementById('lyrics-text').innerHTML = song.description;

    // 添加淡入动画
    const container = document.querySelector('.music-player-container');
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
    const allSongs = [...musicDatabase.mandopop, ...musicDatabase.cantopop, ...musicDatabase.classical];
    const randomIndex = Math.floor(Math.random() * allSongs.length);
    return allSongs[randomIndex];
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
} else {
    initMusicPlayer();
}
