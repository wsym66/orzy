document.addEventListener('DOMContentLoaded', () => {
    const circleBtn = document.getElementById('circleBtn');
    const navHome = document.getElementById('navHome');
    const navDownload = document.getElementById('navDownload');
    const navTheme = document.getElementById('navTheme');
    const themeLabel = document.getElementById('themeLabel');
    const body = document.body;

    // 跳转B站功能
    const jumpToBilibili = () => {
        window.open('https://www.bilibili.com', '_blank');
    };

    // ================= 1. 圆圈：点击直接跳转 =================
    circleBtn.addEventListener('click', () => {
        jumpToBilibili();
    });

    // ================= 2. 圆圈：长按拖拽跳转 =================
    let longPressTimer = null;
    let isDragging = false;
    let isDragTriggered = false; // 记录拖拽是否已触发跳转，防止冲突

    const pointerDown = (e) => {
        isDragging = false;
        isDragTriggered = false;
        // 触发长按定时器，250ms后进入拖拽模式
        longPressTimer = setTimeout(() => {
            isDragging = true;
            circleBtn.classList.add('dragging');
        }, 250);
    };

    const pointerMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        circleBtn.style.position = 'fixed';
        circleBtn.style.left = (clientX - 75) + 'px';
        circleBtn.style.top = (clientY - 75) + 'px';
        circleBtn.style.zIndex = '9999';
        
        // 高亮检测
        const rect = navDownload.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right &&
            clientY >= rect.top && clientY <= rect.bottom) {
            navDownload.classList.add('drag-hover');
        } else {
            navDownload.classList.remove('drag-hover');
        }
    };

    const pointerUp = (e) => {
        clearTimeout(longPressTimer);
        if (isDragging) {
            circleBtn.classList.remove('dragging');
            circleBtn.style.position = 'relative';
            circleBtn.style.left = 'auto';
            circleBtn.style.top = 'auto';
            circleBtn.style.zIndex = '1';

            if (navDownload.classList.contains('drag-hover')) {
                navDownload.classList.remove('drag-hover');
                isDragTriggered = true; // 标记已触发跳转
                jumpToBilibili();
            }
            isDragging = false;
        }
    };

    circleBtn.addEventListener('mousedown', pointerDown);
    document.addEventListener('mousemove', pointerMove);
    document.addEventListener('mouseup', pointerUp);

    circleBtn.addEventListener('touchstart', pointerDown, { passive: true });
    document.addEventListener('touchmove', pointerMove, { passive: false });
    document.addEventListener('touchend', pointerUp, { passive: true });


    // ================= 3. 底部导航栏交互 =================

    // 【首页】
    navHome.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navHome.classList.add('active');
    });

    // 【下载】(直接点击底部下载也会跳转)
    navDownload.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navDownload.classList.add('active');
        jumpToBilibili();
    });

    // 【主题切换】
    navTheme.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navTheme.classList.add('active');

        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeLabel.innerText = '浅色';
        } else {
            themeLabel.innerText = '深色';
        }
        
        setTimeout(() => {
            navTheme.classList.remove('active');
        }, 300);
    });
});