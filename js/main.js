/**
 * main.js - 程序入口模块
 * 初始化所有模块，启动游戏
 */

(function () {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    function start() {
        console.log('🚀 SuperJump 启动中...');
        Game.init();
        console.log('✅ SuperJump 已就绪！按空格键开始游戏');
    }
})();
