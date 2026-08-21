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

    // 核心修复：隐藏底下的图标
    const hideUnderLens = (targetItem) => {
        // 先把之前隐藏的全部显示出来
        document.querySelectorAll('.nav-item.lens-hidden').forEach(el => el.classList.remove('lens-hidden'));
        // 再把圆球当前所在的这个隐藏掉
        if (targetItem) {
            targetItem.classList.add('lens-hidden');
        }
    };

    const updateLensContent = (item) => {
        lens.innerHTML = '';
        if (!item) return;
        // 隐藏底部的文字和图标
        hideUnderLens(item);

        const container = document.createElement('div');
        container.className = 'lens-content';
        const iconNode = item.querySelector('.nav-icon').cloneNode(true);
        container.appendChild(iconNode);
        lens.appendChild(container);
    };

    const updateLensPosition = (clientX) => {
        if (!lens.classList.contains('active')) return;
        const navRect = glassNavbar.getBoundingClientRect();
        let left = clientX - navRect.left - 38;
        left = Math.max(0, Math.min(left, glassNavbar.offsetWidth - 76));
        lens.style.left = left + 'px';
        lens.style.top = '4px';
    };
    
    const resetLensToActive = () => {
        const activeItem = document.querySelector('.nav-item.active');
        if (!activeItem) return;
        updateLensContent(activeItem);
        const rect = activeItem.getBoundingClientRect();
        const navRect = glassNavbar.getBoundingClientRect();
        let left = rect.left - navRect.left + rect.width / 2 - 38;
        left = Math.max(0, Math.min(left, glassNavbar.offsetWidth - 76));
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

    const triggerJelly = () => {
        lens.classList.remove('jelly-tap');
        void lens.offsetWidth; 
        lens.classList.add('jelly-tap');
    };

    // 点击飞行
    allNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (isSwiping) return; 
            triggerJelly(); 
            
            updateLensContent(item);
            lens.classList.add('active');
            lens.classList.remove('fly-anim');
            void lens.offsetWidth; 
            lens.classList.add('fly-anim');

            const rect = item.getBoundingClientRect();
            const navRect = glassNavbar.getBoundingClientRect();
            let left = rect.left - navRect.left + rect.width / 2 - 38;
            left = Math.max(0, Math.min(left, glassNavbar.offsetWidth - 76));
            lens.style.left = left + 'px';
            lens.style.top = '4px';

            setTimeout(() => {
                doAction(item);
                lens.classList.remove('fly-anim');
                lens.innerHTML = ''; 

                if (item !== navHome) {
                    // 点击非首页后，放大镜立刻回首页
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    navHome.classList.add('active');
                    
                    updateLensContent(navHome);
                    
                    lens.classList.remove('fly-anim');
                    void lens.offsetWidth;
                    lens.classList.add('fly-anim');
                    
                    const homeRect = navHome.getBoundingClientRect();
                    let homeLeft = homeRect.left - navRect.left + homeRect.width / 2 - 38;
                    homeLeft = Math.max(0, Math.min(homeLeft, glassNavbar.offsetWidth - 76));
                    lens.style.left = homeLeft + 'px';
                    lens.style.top = '4px';

                    setTimeout(() => {
                        lens.classList.remove('fly-anim');
                    }, 500);
                } else {
                    updateLensContent(item);
                }
            }, 400);
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
            
            if (target) {
                doAction(target);
                lens.classList.remove('fly-anim');
                setTimeout(() => { lens.innerHTML = ''; }, 300);
                // 判断如果滑到的不是首页，也要立刻弹回首页！
                if (target !== navHome) {
                   resetLensToActive(); // 强制归位到首页
                } else {
                    updateLensContent(target);
                }
            } else {
                resetLensToActive();
            }
        }
        isSwiping = false; startTarget = null;
    }, { passive: true });

    circleBtn.addEventListener('click', () => downloadModal.classList.add('active'));

    // 弹窗关闭
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

    // 初始化：默认锁定在首页
    setTimeout(() => {
        const rect = navHome.getBoundingClientRect();
        const navRect = glassNavbar.getBoundingClientRect();
        let left = rect.left - navRect.left + rect.width / 2 - 38;
        left = Math.max(0, Math.min(left, glassNavbar.offsetWidth - 76));
        lens.style.left = left + 'px';
        lens.style.top = '4px';
        lens.classList.add('active');
        updateLensContent(navHome);
    }, 100);
});