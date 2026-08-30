let installedApps = {};
const appsDatabase = [
    { id: 'store', name: '应用商店', icon: '🛍️', desc: '发现好应用', bg: '#00a94f', file: 'store-window' },
    { id: 'settings', name: '设置', icon: '⚙️', desc: '换壁纸，调声音', bg: '#37474f', file: 'settings-window' },
    { id: 'bili', name: '哔哩哔哩', icon: '📺', desc: '看视频', bg: '#fb7299', file: 'bili-window' },
    { id: 'music', name: '网易云音乐', icon: '🎵', desc: '听音乐', bg: '#ce1f3e', file: 'music-window' },
    { id: 'file', name: '文件管理器', icon: '📁', desc: '管理文件', bg: '#f9a825', file: 'file-window' },
    { id: 'weather', name: '天气', icon: '🌤️', desc: '看天气', bg: '#0b70c5', file: 'weather-window' },
    { id: 'browser', name: '浏览器', icon: '🌐', desc: '上网冲浪', bg: '#1565c0', file: 'browser-window' },
    { id: 'setup', name: '应用安装程序', icon: '📦', desc: '安装应用', bg: '#d84315', file: 'installer-window' },
    { id: 'calc', name: '计算器', icon: '🧮', desc: '简单计算', bg: '#455a64', file: 'calc-window' },
    { id: 'clock', name: '时钟', icon: '⏰', desc: '看时间', bg: '#b71c1c', file: 'clock-window' },
    { id: 'cal', name: '日历', icon: '📅', desc: '看日期', bg: '#c62828', file: 'cal-window' },
    { id: 'fb', name: '反馈', icon: '💬', desc: '提交意见', bg: '#00838f', file: 'fb-window' },
    { id: 'news', name: '资讯', icon: '📰', desc: '每日新闻', bg: '#ef6c00', file: 'news-window' }
];

// 备份的视频（截图里的两个）
const fallbackVideos = [
    { pic: 'https://img.zcool.cn/community/012d945d4f0f0da801206e9b9c742c.jpg@1280w_1l_2o_100sh.jpg', title: '加入我们 | 来影视飓风一起工作', stats: '123.6万播放 · 1100弹幕', bvid: 'BV1xx411c7mD' },
    { pic: 'https://img.zcool.cn/community/01e4c85d5d4f0fda801206e9b8c8b2e.jpg@1280w_1l_2o_100sh.jpg', title: '大灭绝 没有这颗陨石', stats: '174.3万播放 · 13.3万弹幕', bvid: 'BV1GJ411x7h7' }
];

// 开机
setTimeout(() => {
    document.getElementById('boot-screen').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    installedApps['store'] = true;
    installedApps['settings'] = true;
    addIcon('store');
    addIcon('settings');
    showSetting('personal');
    // 加载B站视频
    loadBiliVideos('home');
}, 2500);

function renderStore() {
    const grid = document.getElementById('store-grid');
    grid.innerHTML = '';
    appsDatabase.filter(app => app.id !== 'store' && app.id !== 'settings').forEach(app => {
        const isInst = installedApps[app.id];
        const card = document.createElement('div');
        card.className = 'store-card';
        card.style.backgroundColor = app.bg;
        card.innerHTML = `<div style="position:absolute; right:10px; top:10px;"><button class="install-btn" onclick="installApp('${app.id}')">${isInst ? '已安装' : '获取'}</button></div><div style="font-size:40px;">${app.icon}</div><div style="font-weight:bold;">${app.name}</div><div style="font-size:13px; opacity:0.8;">${app.desc}</div>`;
        grid.appendChild(card);
    });
}

function installApp(id) {
    if (installedApps[id]) return;
    addIcon(id);
    installedApps[id] = true;
    renderStore();
}

function addIcon(id) {
    const app = appsDatabase.find(a => a.id === id);
    const iconDiv = document.createElement('div');
    iconDiv.className = 'app-icon';
    iconDiv.innerHTML = `<div class="app-icon-ico">${app.icon}</div><span>${app.name}</span>`;
    iconDiv.onclick = () => openApp(id);
    document.getElementById('icon-area').appendChild(iconDiv);
}

/* === 动态任务栏：打开什么显示什么，关掉什么消失什么 === */
function updateTaskbar() {
    const taskbar = document.getElementById('taskbar');
    taskbar.innerHTML = ''; // 清空重建
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        if (win.style.display === 'flex') {
            const app = appsDatabase.find(a => a.file === win.id);
            if (app) {
                const btn = document.createElement('div');
                btn.className = 'task-btn';
                btn.innerText = app.icon;
                btn.onclick = () => {
                    closeAllWindows(); // 先关闭全部再打开点击的
                    document.getElementById(app.file).style.display = 'flex';
                    updateTaskbar();
                };
                taskbar.appendChild(btn);
            }
        }
    });

    // 首页返回键
    const home = document.createElement('div');
    home.className = 'home-btn';
    home.innerHTML = '<svg viewBox="0 0 100 100" width="40" height="40"><path d="M10,50 Q50,10 90,50 T90,90 Q50,50 10,90 Z" fill="#fff"/></svg>';
    home.onclick = goHome;
    taskbar.appendChild(home);
}

function openApp(id) {
    const app = appsDatabase.find(a => a.id === id);
    if (app && app.file) {
        closeAllWindows();
        document.getElementById(app.file).style.display = 'flex';
        if(id === 'clock') startClock();
        if(id === 'cal') showCalendar();
        updateTaskbar(); // 打开后更新任务栏
    }
}

function closeAllWindows() {
    document.querySelectorAll('.window').forEach(w => w.style.display = 'none');
    updateTaskbar(); // 关闭后更新任务栏（清空）
}

function closeWindow(winId) {
    document.getElementById(winId).style.display = 'none';
    updateTaskbar(); // 关闭后更新任务栏
}

function goHome() { closeAllWindows(); closePlayer(); }

/* === B站视频逻辑（包含刷新失败降级） === */
async function loadBiliVideos(type) {
    const list = document.getElementById('bili-list');
    const status = document.getElementById('bili-status');
    status.style.display = 'none';
    
    try {
        let videos = [];
        let apiUrl = '';
        
        if (type === 'home') apiUrl = 'https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?fresh_idx=1';
        else if (type === 'precious') apiUrl = 'https://api.bilibili.com/x/web-interface/popular/precious';
        else if (type === 'hot') apiUrl = 'https://api.bilibili.com/x/web-interface/wbi/search/square?limit=10';
        
        const response = await fetch(apiUrl, { headers: { 'Referer': 'https://www.bilibili.com/' }});
        const data = await response.json();
        
        if (data.code === 0 && data.data) {
            let items = data.data.item || data.data.list || [];
            videos = items.map(v => ({
                pic: v.pic.startsWith('//') ? 'https:' + v.pic : v.pic,
                title: v.title,
                stats: `${(v.play / 10000).toFixed(1)}万播放 · ${v.video_review || 0}弹幕`,
                bvid: v.bvid
            }));
        } else {
            throw new Error('API限制');
        }
        
        renderBiliList(videos);
    } catch (e) {
        // 刷新失败
        status.style.display = 'block'; // 显示“刷新失败”
        renderBiliList(fallbackVideos); // 放上备份视频
    }
}

function renderBiliList(videos) {
    const list = document.getElementById('bili-list');
    list.innerHTML = '';
    videos.forEach(v => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.onclick = () => playVideo(v);
        card.innerHTML = `<div class="video-thumb" style="background-image:url('${v.pic}')"></div><div><div class="video-title">${v.title}</div><div class="video-stats">${v.stats}</div></div>`;
        list.appendChild(card);
    });
}

/* === 播放器：只保留红按钮，点击后留在B站界面 === */
function playVideo(video) {
    const player = document.getElementById('player-window');
    const videoEl = document.getElementById('player-video');
    player.style.display = 'flex';
    // 使用备份和真实的测试视频源（前端无法直接获取真实B站清晰度链接）
    videoEl.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
}

function closePlayer() {
    const player = document.getElementById('player-window');
    const video = document.getElementById('player-video');
    player.style.display = 'none';
    video.pause();
    video.src = "";
    // 关键：不调用 closeAllWindows，所以B站界面依然保留
}

// 计算器逻辑
function calcInput(val) {
    let disp = document.getElementById('calc-disp');
    if (val === 'C') { disp.innerText = '0'; return; }
    if (val === '%') { disp.innerText = parseFloat(disp.innerText) / 100; return; }
    if (val === '±') { disp.innerText = -parseFloat(disp.innerText); return; }
    if (disp.innerText === '0' && val !== '.') { disp.innerText = val; } else { disp.innerText += val; }
}
function calcResult() {
    let expr = document.getElementById('calc-disp').innerText;
    try { document.getElementById('calc-disp').innerText = new Function('return ' + expr)(); } catch(e) { document.getElementById('calc-disp').innerText = '错误'; }
}

// 时钟
function startClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('clock-time').innerText = now.toLocaleTimeString();
        document.getElementById('clock-date').innerText = now.toLocaleDateString() + ' ' + ['周日','周一','周二','周三','周四','周五','周六'][now.getDay()];
    };
    update();
    setInterval(update, 1000);
}

// 日历
function showCalendar() {
    const now = new Date();
    document.getElementById('cal-content').innerHTML = `${now.getFullYear()}年${now.getMonth()+1}月<br><br><span style="font-size:80px;">${now.getDate()}</span><br><br>${['周日','周一','周二','周三','周四','周五','周六'][now.getDay()]}`;
}

// 反馈
function submitFeedback() {
    const input = document.getElementById('fb-text');
    if (input.value.trim() === '') { alert('请输入内容！'); return; }
    input.value = '';
    alert('反馈成功！感谢您的宝贵意见。');
}

// 浏览器
function loadWebsite() {
    const url = document.getElementById('browser-input').value;
    const finalUrl = url.startsWith('http') ? url : 'https://' + url;
    document.getElementById('browser-frame').src = finalUrl;
}

// 安装程序
function startInstall() {
    const box = document.querySelector('.installer-box');
    const progress = document.getElementById('install-progress');
    const bar = document.getElementById('install-bar');
    box.innerHTML = "正在安装...";
    progress.style.display = 'block';
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) { clearInterval(interval); box.innerHTML = "✅ 安装成功！"; progress.style.display = 'none'; }
        else { width += 10; bar.style.width = width + '%'; }
    }, 200);
}

// 设置可换壁纸
function showSetting(type) {
    const items = document.querySelectorAll('#settings-menu .menu-item');
    items.forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');
    
    const detail = document.getElementById('settings-detail');
    if (type === 'display') {
        detail.innerHTML = `<h3>显示</h3><p>亮度调整</p><input type="range" style="width:100%;" value="80">`;
    } else if (type === 'sound') {
        detail.innerHTML = `<h3>声音</h3><p>音量调整</p><input type="range" style="width:100%;" value="50">`;
    } else if (type === 'network') {
        detail.innerHTML = `<h3>网络与Internet</h3><p>当前连接：OrzyOS-WiFi</p>`;
    } else if (type === 'about') {
        detail.innerHTML = `<h3>关于 OrzyOS</h3><p>版本：1.0.0<br>网页版原生系统</p>`;
    } else {
        detail.innerHTML = `
            <h3>个性化</h3><p>选择壁纸</p>
            <div class="wallpaper-thumb" style="background: #101c2c;" onclick="changeWallpaper('#101c2c')"></div>
            <div class="wallpaper-thumb" style="background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);" onclick="changeWallpaper('linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)')"></div>
            <div class="wallpaper-thumb" style="background: #000;" onclick="changeWallpaper('#000')"></div>
            <div class="wallpaper-thumb" style="background: radial-gradient(circle at center, #0078d7 0%, #001f4d 100%);" onclick="changeWallpaper('radial-gradient(circle at center, #0078d7 0%, #001f4d 100%)')"></div>
        `;
    }
}

function changeWallpaper(wallpaper) {
    document.getElementById('desktop').style.background = wallpaper;
    alert("壁纸更换成功！");
    showSetting('personal');
}

// 网易云播放
function toggleMusic() {
    const audio = document.getElementById('bg-music');
    const icon = document.getElementById('play-icon');
    if (audio.paused) { audio.play(); icon.innerText = '⏸'; }
    else { audio.pause(); icon.innerText = '▶'; }
}

renderStore();