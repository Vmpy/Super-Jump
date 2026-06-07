/**
 * game.js - 游戏引擎模块
 * 状态机、游戏循环、场景管理、localStorage最高分
 */

const Game = (function () {
    const GameState = {
        MENU: 'menu',
        TUTORIAL: 'tutorial',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAMEOVER: 'gameover'
    };

    let state = GameState.MENU;
    let lastTimestamp = 0;
    let isRunning = false;
    let highScore = 0;
    let animFrameId = null;
    let obstacleSpawnTimer = 0;   // 怪物生成计时器
    let obstacleSpawnInterval = 2.0; // 初始生成间隔（秒）

    // 游戏常量
    const LOGICAL_WIDTH = 400;
    const LOGICAL_HEIGHT = 600;
    const STORAGE_KEY = 'superjump_highscore';

    function init() {
        // 读取最高分
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) highScore = parseInt(saved, 10) || 0;
        } catch (e) {
            console.warn('localStorage 不可用');
        }

        // 初始化语言
        I18n.init();

        // 初始化渲染器
        const canvas = document.getElementById('game-canvas');
        Renderer.init(canvas, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        // 初始化输入
        Input.init(canvas, LOGICAL_WIDTH);

        // 初始化音频（在用户交互后才能真正初始化，这里先标记）
        document.addEventListener('keydown', firstInteraction);
        document.addEventListener('click', firstInteraction);

        // 初始化背景
        Background.init();

        // 开始游戏循环
        isRunning = true;
        lastTimestamp = performance.now();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    let audioInitialized = false;
    function firstInteraction() {
        if (!audioInitialized) {
            AudioManager.init();
            audioInitialized = true;
        }
    }

    function startGame() {
        state = GameState.PLAYING;
        obstacleSpawnTimer = 1.0; // 给玩家1秒缓冲时间

        // 创建玩家
        const startX = LOGICAL_WIDTH / 2 - Player.PLAYER_WIDTH / 2;
        const startY = LOGICAL_HEIGHT - 150;
        Player.create(startX, startY);

        // 初始化平台（generateOne 会自动生成道具）
        Platforms.init(LOGICAL_WIDTH, LOGICAL_HEIGHT);

        // 初始化相机
        Camera.init(LOGICAL_WIDTH, LOGICAL_HEIGHT);
        Camera.reset();

        // 清理障碍和粒子
        Obstacles.clear();
        Particles.clear();
        Items.clear();
    }

    function restartGame() {
        startGame();
    }

    function pauseGame() {
        if (state === GameState.PLAYING) {
            state = GameState.PAUSED;
        } else if (state === GameState.PAUSED) {
            state = GameState.PLAYING;
        }
    }

    function gameOver() {
        state = GameState.GAMEOVER;
        const player = Player.get();
        if (player && player.score > highScore) {
            highScore = player.score;
            try {
                localStorage.setItem(STORAGE_KEY, highScore.toString());
            } catch (e) {}
        }
    }

    // ─── 游戏主循环 ───
    function gameLoop(timestamp) {
        if (!isRunning) return;
        animFrameId = requestAnimationFrame(gameLoop);

        const rawDt = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        // 限制 dt 防止过大跳跃（如切换标签页回来）
        let dt = Math.min(rawDt, 0.05);

        // 时间缓速效果
        const player = Player.get();
        if (player && player.slowMoTimer > 0) {
            dt *= 0.5;
        }

        update(dt);
        render();

        Input.clearFrame();
    }

    // ─── 逻辑更新 ───
    function update(dt) {
        switch (state) {
            case GameState.MENU:
                updateMenu();
                break;
            case GameState.TUTORIAL:
                updateTutorial();
                break;
            case GameState.PLAYING:
                updatePlaying(dt);
                break;
            case GameState.PAUSED:
                updatePaused();
                break;
            case GameState.GAMEOVER:
                updateGameOver();
                break;
        }
    }

    function updateMenu() {
        if (Input.isPressed('start')) {
            startGame();
        }
        if (Input.isPressed('help')) {
            state = GameState.TUTORIAL;
        }
        if (Input.isPressed('lang')) {
            I18n.toggle();
        }
    }

    function updateTutorial() {
        if (Input.isPressed('back') || Input.isPressed('help') || Input.isPressed('start')) {
            state = GameState.MENU;
        }
        if (Input.isPressed('lang')) {
            I18n.toggle();
        }
    }

    function updatePlaying(dt) {
        // 暂停
        if (Input.isPressed('pause')) {
            pauseGame();
            return;
        }
        if (Input.isPressed('lang')) {
            I18n.toggle();
        }

        const player = Player.get();
        if (!player) return;

        // 更新玩家
        Player.update(dt, LOGICAL_WIDTH);

        // 更新平台
        Platforms.update(dt, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        // 平台碰撞
        Platforms.checkCollisions(LOGICAL_WIDTH);

        // 更新道具
        Items.update(dt);
        Items.checkCollisions(player);
        Items.cleanup(Camera.get().y, LOGICAL_HEIGHT);

        // 磁铁吸附金币
        if (player.magnetTimer > 0) {
            const magnetRange = Player.getMagnetRange();
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            for (const item of Items.getItems()) {
                if (!item.alive || item.type !== 'coin') continue;
                const itemCenterX = item.x + item.width / 2;
                const itemCenterY = item.y + item.height / 2;
                const dx = itemCenterX - playerCenterX;
                const dy = itemCenterY - playerCenterY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < magnetRange && dist > 5) {
                    const speed = 300 * dt;
                    item.x -= (dx / dist) * speed;
                    item.y -= (dy / dist) * speed;
                }
            }
        }

        // 更新障碍
        Obstacles.update(dt);
        if (Obstacles.checkCollisions(player)) {
            gameOver();
            return;
        }

        // 动态生成怪物（限制生成频率）
        obstacleSpawnTimer -= dt;
        if (obstacleSpawnTimer <= 0) {
            const difficulty = Math.min(player.score / 5000, 1.5);
            Obstacles.spawn(LOGICAL_WIDTH, Camera.get().y, LOGICAL_HEIGHT, difficulty);
            // 间隔随难度缩短：2.0s -> 0.8s
            obstacleSpawnInterval = Math.max(0.8, 2.0 - difficulty * 0.8);
            obstacleSpawnTimer = obstacleSpawnInterval;
        }

        // 更新粒子
        Particles.update(dt);

        // 更新背景云层
        Background.update(dt, Camera.get());

        // 更新相机
        Camera.update(player);

        // 检查掉落死亡（低于屏幕底部）
        const cameraBottom = Camera.get().y + LOGICAL_HEIGHT;
        if (player.y > cameraBottom + 100) {
            gameOver();
            return;
        }

        // 得分音效（每500分一次）
        if (!player._lastScoreSound) player._lastScoreSound = 0;
        const currentMilestone = Math.floor(player.score / 500);
        if (currentMilestone > player._lastScoreSound) {
            player._lastScoreSound = currentMilestone;
            AudioManager.score();
        }
    }

    function updatePaused() {
        if (Input.isPressed('pause') || Input.isPressed('start')) {
            pauseGame();
        }
        if (Input.isPressed('help')) {
            state = GameState.TUTORIAL;
        }
        if (Input.isPressed('lang')) {
            I18n.toggle();
        }
    }

    function updateGameOver() {
        if (Input.isPressed('start')) {
            restartGame();
        }
        if (Input.isPressed('help')) {
            state = GameState.TUTORIAL;
        }
        if (Input.isPressed('lang')) {
            I18n.toggle();
        }
    }

    // ─── 渲染 ───
    function render() {
        const camera = Camera.get();
        const player = Player.get();

        switch (state) {
            case GameState.MENU:
                Renderer.drawMenu(highScore);
                break;
            case GameState.TUTORIAL:
                Renderer.drawTutorial();
                break;
            case GameState.PLAYING:
                Renderer.render(camera);
                Renderer.drawHUD(player, highScore, false);
                break;
            case GameState.PAUSED:
                Renderer.render(camera);
                Renderer.drawHUD(player, highScore, true);
                break;
            case GameState.GAMEOVER:
                Renderer.render(camera);
                Renderer.drawGameOver(
                    player ? player.score : 0,
                    highScore,
                    player ? player.maxHeight : 0
                );
                break;
        }
    }

    return {
        init,
        startGame,
        restartGame,
        pauseGame,
        getState: () => state,
        getHighScore: () => highScore
    };
})();
