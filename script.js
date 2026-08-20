document.addEventListener('DOMContentLoaded', () => {
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

    const messageModal = document.getElementById('messageModal');
    const inputModal = document.getElementById('inputModal');
    const downloadModal = document.getElementById('downloadModal');
    const downloadList = document.getElementById('downloadList');
    const messageList = document.getElementById('messageList');
    const msgInput = document.getElementById('msgInput');

    // 生成下载列表
    function generateDownloadList() {
        downloadList.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const item = document.createElement('div');
            item.className = 'download-item';
            item.innerText = `测试v0.0.0`;
            downloadList.appendChild(item);
        }
    }
    generateDownloadList();

    // 核心动作
    const doAction = (target) => {
        if (!target) return;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        target.classList.add('active');
        if (target === navDownload) downloadModal.classList.add('active');
        else if (target === navMessage) messageModal.classList.add('active');
        else if (target === navTheme) {
            body.classList.toggle('dark-mode');
            themeLabel.innerText = body.classList.contains('dark-mode') ? '浅色' : '深色';
        }
    };

    // 透镜逻辑 (点击/滑动)
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

    // 点击飞行
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

    // 滑动跟手
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

    // 中间圆圈：下载列表
    circleBtn.addEventListener('click', () => downloadModal.classList.add('active'));

    // ================= 弹窗交互 =================
    const closeModal = (modal) => modal.classList.remove('active');

    document.getElementById('closeMessageModal').addEventListener('click', () => closeModal(messageModal));
    document.getElementById('closeDownloadModal').addEventListener('click', () => closeModal(downloadModal));

    [messageModal, downloadModal, inputModal].forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
    });

    document.getElementById('openInputModal').addEventListener('click', () => {
        inputModal.classList.add('active');
        setTimeout(() => msgInput.focus(), 300);
    });

    document.getElementById('confirmMsg').addEventListener('click', () => {
        const text = msgInput.value.trim();
        if (text) {
            const newMsg = document.createElement('div');
            newMsg.className = 'msg-item';
            newMsg.innerText = text;
            messageList.appendChild(newMsg);
            messageList.scrollTop = messageList.scrollHeight;
            msgInput.value = '';
            closeModal(inputModal);
        }
    });
    msgInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('confirmMsg').click();
        }
    });
});