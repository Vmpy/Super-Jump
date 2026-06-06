/**
 * input.js - 输入管理模块
 * 处理键盘事件：方向键/AD移动，空格开始，P暂停
 */

const Input = (function () {
    const keys = {
        left: false,
        right: false,
        jump: false,
        pause: false,
        start: false
    };

    // 按键映射
    const KEY_MAP = {
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'a': 'left',
        'A': 'left',
        'd': 'right',
        'D': 'right',
        ' ': 'start',
        'Space': 'start',
        'p': 'pause',
        'P': 'pause',
        'Enter': 'start',
        'h': 'help',
        'H': 'help',
        'l': 'lang',
        'L': 'lang',
        'Escape': 'back'
    };

    // 防止连续触发的按键（如空格、P）
    const keyPressedThisFrame = {};

    // 鼠标状态
    let canvas = null;
    let logicalWidth = 400;
    let mouseX = 0;
    let mouseLeft = false;

    function init(canvasElement, lWidth) {
        canvas = canvasElement;
        logicalWidth = lWidth;

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // 鼠标事件
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // 阻止方向键滚动页面
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    function onKeyDown(e) {
        const action = KEY_MAP[e.key];
        if (action) {
            keys[action] = true;
            keyPressedThisFrame[action] = true;
        }
    }

    function onKeyUp(e) {
        const action = KEY_MAP[e.key];
        if (action) {
            keys[action] = false;
        }
    }

    // 鼠标事件
    function onMouseDown(e) {
        if (e.button === 0) {
            mouseLeft = true;
            updateMousePos(e);
        }
    }

    function onMouseUp(e) {
        if (e.button === 0) {
            mouseLeft = false;
        }
    }

    function onMouseMove(e) {
        updateMousePos(e);
    }

    function updateMousePos(e) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = logicalWidth / rect.width;
        mouseX = (e.clientX - rect.left) * scaleX;
    }

    // 检查某按键是否在本帧被按下（用于单次触发）
    function isPressed(action) {
        if (keyPressedThisFrame[action]) {
            keyPressedThisFrame[action] = false;
            return true;
        }
        return false;
    }

    // 检查某按键是否持续按住
    function isDown(action) {
        return keys[action] === true;
    }

    // 鼠标左键是否按住
    function isMouseDown() {
        return mouseLeft;
    }

    // 获取鼠标逻辑坐标 X
    function getMouseX() {
        return mouseX;
    }

    // 清理本帧按键状态（每帧结束时调用）
    function clearFrame() {
        for (const key in keyPressedThisFrame) {
            keyPressedThisFrame[key] = false;
        }
    }

    return {
        init,
        isPressed,
        isDown,
        isMouseDown,
        getMouseX,
        clearFrame,
        keys
    };
})();
