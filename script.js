document.addEventListener('DOMContentLoaded', () => {
    // ================= 基础元素获取 =================
    const circleBtn = document.getElementById('circleBtn');
    const glassNavbar = document.getElementById('glassNavbar');
    const lens = document.getElementById('glassLens');
    const body = document.body;

    const navHome = document.getElementById('navHome');
    const navDownload = document.getElementById('navDownload');
    const navMessage = document.getElementById('navMessage');
    const navTheme = document.getElementById('navTheme');
    const themeLabel = document.getElementById('themeLabel');
    const allNavItems = [navHome, navDownload, navMessage, navTheme];

    // ================= 弹窗元素获取 =================
    const messageModal = document.getElementById('messageModal');
    const inputModal = document.getElementById('inputModal');
    const downloadModal = document.getElementById('downloadModal');
    const downloadList = document.getElementById('downloadList');
    const messageList = document.getElementById('messageList');
    const msgInput = document.getElementById('msgInput');
    
    // ================= 生成下载列表 =================
    function generateDownloadList() {
        downloadList.innerHTML = ''; // 清空原有内容
        // 循环生成 4 个版本号（满足你要求的 "测试v0.0.0" 四遍）
        for (let i = 0; i < 4; i++) {
            const item = document.createElement('div');
            item.className = 'download-item';
            item.innerText = `测试v0.0.0`;
            downloadList.appendChild(item);
        }
    }
    // 页面加载时立刻生成
    generateDownloadList();

    // ================= 核心动作执行 =================
    const doAction = (target) => {
        if (!target) return;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        target.classList.add('active');

        // 业务分发
        if (target === navDownload) {
            // 弹出下载列表窗口
            downloadModal.classList.add('active');
        } else if (target === navMessage) {
            messageModal.classList.add('active');
        } else if (target === navTheme) {
            body.classList.toggle('dark-mode');
            themeLabel.innerText = body.classList.contains('dark-mode') ? '浅色' : '深色';
        }
    };

    // ================= 透镜逻辑 =================
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
            if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return item;
        }
        return null;
    };

    // ================= 底部导航：点击飞行 =================
    allNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (isSwiping) return; 
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

            setTimeout(() => {
                doAction(item);
                lens.classList.remove('active', 'fly-anim');
                lens.innerHTML = '';
            }, 500);
        });
    });

    // ================= 底部导航：滑动跟手 =================
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
            const currentHover = getTargetFromCoords(moveX, moveY);
            if (currentHover && currentHover !== lastHoveredTarget) {
                lastHoveredTarget = currentHover;
                updateLensContent(currentHover);
            }
        }
    }, { passive: false });

    glassNavbar.addEventListener('touchend', (e) => {
        clearTimeout(longPressTimer);
        if (isSwiping && lens.classList.contains('active')) {
            const lensRect = lens.getBoundingClientRect();
            const centerX = lensRect.left + lensRect.width / 2;
            const centerY = lensRect.top + lensRect.height / 2;
            const target = getTargetFromCoords(centerX, centerY);
            if (target) doAction(target);
            lens.classList.remove('active', 'fly-anim');
            setTimeout(() => { lens.innerHTML = ''; }, 300);
        }
        isSwiping = false; startTarget = null;
    }, { passive: true });

    // ================= 中间圆圈：也打开下载列表 =================
    circleBtn.addEventListener('click', () => {
        downloadModal.classList.add('active');
    });

    // ================= 消息弹窗交互 =================
    // 1. 关闭消息主窗口
    document.getElementById('closeMessageModal').addEventListener('click', () => {
        messageModal.classList.remove('active');
    });
    // 点击背景关闭
    messageModal.addEventListener('click', (e) => {
        if (e.target === messageModal) messageModal.classList.remove('active');
    });

    // 2. 点击加号弹出输入子窗口
    document.getElementById('openInputModal').addEventListener('click', () => {
        inputModal.classList.add('active');
        setTimeout(() => msgInput.focus(), 300); // 自动唤出键盘
    });

    // 3. 点击对号发表消息
    document.getElementById('confirmMsg').addEventListener('click', () => {
        const text = msgInput.value.trim();
        if (text) {
            const newMsg = document.createElement('div');
            newMsg.className = 'msg-item';
            newMsg.innerText = text;
            messageList.appendChild(newMsg);
            messageList.scrollTop = messageList.scrollHeight; // 滚动到底部
            msgInput.value = ''; // 清空
            inputModal.classList.remove('active'); // 关闭子窗口
        }
    });
    // 支持回车键发送（部分虚拟键盘支持）
    msgInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('confirmMsg').click();
        }
    });

    // ================= 下载弹窗交互 =================
    document.getElementById('closeDownloadModal').addEventListener('click', () => {
        downloadModal.classList.remove('active');
    });
    downloadModal.addEventListener('click', (e) => {
        if (e.target === downloadModal) downloadModal.classList.remove('active');
    });
});