document.addEventListener('DOMContentLoaded', () => {
    const circleBtn = document.getElementById('circleBtn');
    const glassNavbar = document.getElementById('glassNavbar');
    const lens = document.getElementById('glassLens');

    const navHome = document.getElementById('navHome');
    const navDownload = document.getElementById('navDownload');
    const navTheme = document.getElementById('navTheme');
    const themeLabel = document.getElementById('themeLabel');
    const body = document.body;
    const allNavItems = [navHome, navDownload, navTheme];

    // ================= 1. 核心动作执行（防拦截） =================
    const doAction = (target) => {
        if (!target) return;
        // 高亮处理
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        target.classList.add('active');

        if (target === navDownload) {
            // 必跳转
            window.location.href = 'https://www.bilibili.com';
        } else if (target === navTheme) {
            // 必换肤
            body.classList.toggle('dark-mode');
            themeLabel.innerText = body.classList.contains('dark-mode') ? '浅色' : '深色';
        }
    };

    // ================= 2. 透镜逻辑：克隆内容与位置设定 =================
    const updateLensContent = (item) => {
        lens.innerHTML = '';
        if (!item) return;
        const clone = item.cloneNode(true);
        clone.className = 'lens-content';
        clone.classList.remove('nav-item', 'active');
        lens.appendChild(clone);
    };

    const updateLensPosition = (clientX) => {
        if (!lens.classList.contains('active')) return;
        const navRect = glassNavbar.getBoundingClientRect();
        let left = clientX - navRect.left - 40;
        left = Math.max(0, Math.min(left, glassNavbar.offsetWidth - 80));
        lens.style.left = left + 'px';
        lens.style.top = '4px';
    };

    const getTargetFromCoords = (clientX, clientY) => {
        for (let item of allNavItems) {
            const rect = item.getBoundingClientRect();
            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {
                return item;
            }
        }
        return null;
    };

    // ================= 3. 彻底分开“点击”和“滑动”事件 =================

    // 【A】点击事件：用户点一下，必定触发 0.5 秒飞行
    allNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // 如果正在滑动中，忽略点击
            if (isSwiping) return; 
            
            // 执行飞行动画
            updateLensContent(item);
            lens.classList.add('active');
            lens.classList.remove('fly-anim');
            void lens.offsetWidth; 
            lens.classList.add('fly-anim');

            const rect = item.getBoundingClientRect();
            const navRect = glassNavbar.getBoundingClientRect();
            let left = rect.left - navRect.left + rect.width / 2 - 40;
            left = Math.max(0, Math.min(left, glassNavbar.offsetWidth - 80));
            lens.style.left = left + 'px';
            lens.style.top = '4px';

            // 0.5秒后必定触发对应功能
            setTimeout(() => {
                doAction(item);
                lens.classList.remove('active', 'fly-anim');
                lens.innerHTML = '';
            }, 500);
        });
    });

    // 【B】滑动事件：长按滑动，内容动态变化
    let isSwiping = false;
    let startTarget = null;
    let lastHoveredTarget = null;
    let longPressTimer = null;

    glassNavbar.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startTarget = e.target.closest('.nav-item');
        if (!startTarget) return;

        isSwiping = false;
        lastHoveredTarget = startTarget;

        // 250ms 判定为长按
        longPressTimer = setTimeout(() => {
            isSwiping = true;
            updateLensContent(startTarget);
            lens.classList.add('active');
            lens.classList.remove('fly-anim');
            updateLensPosition(touch.clientX);
        }, 250);
    }, { passive: true });

    glassNavbar.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const moveX = touch.clientX;
        const moveY = touch.clientY;

        // 提前解锁滑动（如果手指在250ms内移动了）
        if (!isSwiping && (Math.abs(moveX - touch.clientX) > 10)) {
            clearTimeout(longPressTimer);
            isSwiping = true;
            updateLensContent(startTarget);
            lens.classList.add('active');
            lens.classList.remove('fly-anim');
        }

        if (isSwiping) {
            e.preventDefault();
            lens.classList.remove('fly-anim');
            updateLensPosition(moveX);

            // ===== 核心修复：滑动时动态检测并切换放大内容 =====
            const currentHover = getTargetFromCoords(moveX, moveY);
            if (currentHover && currentHover !== lastHoveredTarget) {
                lastHoveredTarget = currentHover;
                updateLensContent(currentHover);
            }
        }
    }, { passive: false });

    glassNavbar.addEventListener('touchend', (e) => {
        clearTimeout(longPressTimer);

        // 如果在滑动状态下松手
        if (isSwiping && lens.classList.contains('active')) {
            const lensRect = lens.getBoundingClientRect();
            const centerX = lensRect.left + lensRect.width / 2;
            const centerY = lensRect.top + lensRect.height / 2;

            const target = getTargetFromCoords(centerX, centerY);
            if (target) {
                doAction(target);
            }

            lens.classList.remove('active', 'fly-anim');
            setTimeout(() => { lens.innerHTML = ''; }, 300);
        }

        isSwiping = false;
        startTarget = null;
    }, { passive: true });

    // ================= 4. 中间大圆圈点击跳转 =================
    circleBtn.addEventListener('click', () => {
        window.location.href = 'https://www.bilibili.com';
    });
});