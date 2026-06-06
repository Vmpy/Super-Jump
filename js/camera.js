/**
 * camera.js - 相机系统模块
 * 平滑跟随玩家，只上不下
 */

const Camera = (function () {
    let camera = {
        x: 0,
        y: 0,
        targetY: 0,
        screenWidth: 400,
        screenHeight: 600,
        followRatio: 0.1  // Lerp 因子
    };

    function init(screenWidth, screenHeight) {
        camera.screenWidth = screenWidth;
        camera.screenHeight = screenHeight;
        camera.x = 0;
        camera.y = 0;
        camera.targetY = 0;
    }

    function update(player) {
        if (!player) return;

        // 目标：玩家位于屏幕中上部（约 40% 位置）
        camera.targetY = player.y + player.height - camera.screenHeight * 0.6;

        // 只上不下：相机只能向上移动（y 值减小）
        if (camera.targetY < camera.y) {
            camera.y = Utils.lerp(camera.y, camera.targetY, camera.followRatio);
        }
    }

    function get() {
        return camera;
    }

    function reset() {
        camera.y = 0;
        camera.targetY = 0;
    }

    return {
        init,
        update,
        get,
        reset
    };
})();
