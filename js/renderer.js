/**
 * renderer.js - 渲染器模块
 * 整合所有元素的绘制调用
 */

const Renderer = (function () {
    let canvas = null;
    let ctx = null;
    let logicalWidth = 400;
    let logicalHeight = 600;

    function init(canvasElement, lWidth, lHeight) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        logicalWidth = lWidth;
        logicalHeight = lHeight;
        resize();
        window.addEventListener('resize', resize);
    }

    // ─── 自适应画布 ───
    function resize() {
        if (!canvas) return;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 保持 2:3 比例
        const scale = Math.min(windowWidth / logicalWidth, windowHeight / logicalHeight);
        const displayWidth = Math.floor(logicalWidth * scale);
        const displayHeight = Math.floor(logicalHeight * scale);

        // 使用物理像素尺寸保证清晰度，然后通过 CSS 缩放显示
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        // 设置绘制缩放，使逻辑坐标映射到实际像素
        if (ctx) {
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
        }
    }

    function getCanvas() {
        return canvas;
    }

    function getCtx() {
        return ctx;
    }

    // ─── 绘制游戏世界 ───
    function render(camera) {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, logicalWidth, logicalHeight);

        // 1. 背景
        Background.draw(ctx, camera);

        // 2. 平台
        Platforms.draw(ctx, camera);

        // 3. 道具
        Items.draw(ctx, camera);

        // 4. 障碍物
        Obstacles.draw(ctx, camera);

        // 5. 粒子
        Particles.draw(ctx, camera);

        // 6. 玩家
        Player.draw(ctx, camera);
    }

    // ─── 绘制 UI/HUD ───
    function drawHUD(player, highScore, isPaused) {
        if (!ctx) return;

        ctx.save();

        // 顶部 HUD 背景（半透明）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(5, 5, logicalWidth - 10, 30);
        Utils.drawDoodleLine(ctx, 5, 5, logicalWidth - 5, 5, '#999', 1, 1);
        Utils.drawDoodleLine(ctx, logicalWidth - 5, 5, logicalWidth - 5, 35, '#999', 1, 1);
        Utils.drawDoodleLine(ctx, logicalWidth - 5, 35, 5, 35, '#999', 1, 1);
        Utils.drawDoodleLine(ctx, 5, 35, 5, 5, '#999', 1, 1);

        // 分数文字
        const score = player ? player.score : 0;
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px "Comic Sans MS", "Chalkboard SE", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(I18n.t('score') + ': ' + score, 15, 20);

        ctx.textAlign = 'right';
        ctx.fillText(I18n.t('hi') + ': ' + highScore, logicalWidth - 50, 20);

        // 持续道具状态显示
        if (player) {
            let statusX = 15;
            const statusY = 42;
            const iconSize = 14;

            if (player.magnetTimer > 0) {
                ctx.fillStyle = 'rgba(244, 67, 54, 0.8)';
                ctx.fillRect(statusX, statusY, iconSize, iconSize);
                ctx.fillStyle = '#FFF';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(I18n.t('statusMagnet'), statusX + iconSize / 2, statusY + iconSize / 2 + 2);
                statusX += 20;
            }
            if (player.doubleScoreTimer > 0) {
                ctx.fillStyle = 'rgba(255, 235, 59, 0.8)';
                ctx.fillRect(statusX, statusY, iconSize, iconSize);
                ctx.fillStyle = '#E65100';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(I18n.t('statusDouble'), statusX + iconSize / 2, statusY + iconSize / 2 + 2);
                statusX += 20;
            }
            if (player.parachuteTimer > 0) {
                ctx.fillStyle = 'rgba(79, 195, 247, 0.8)';
                ctx.fillRect(statusX, statusY, iconSize, iconSize);
                ctx.fillStyle = '#FFF';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(I18n.t('statusParachute'), statusX + iconSize / 2, statusY + iconSize / 2 + 2);
            }
        }

        // 暂停提示
        if (isPaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, logicalWidth, logicalHeight);

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 36px "Comic Sans MS", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(I18n.t('paused'), logicalWidth / 2, logicalHeight / 2 - 30);

            ctx.font = '16px "Comic Sans MS", sans-serif';
            ctx.fillText(I18n.t('pressPToResume'), logicalWidth / 2, logicalHeight / 2 + 20);
        }

        ctx.restore();
    }

    // ─── 绘制菜单界面 ───
    function drawMenu(highScore) {
        if (!ctx) return;

        ctx.save();

        // 背景
        ctx.fillStyle = '#FDFBF7';
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        Background.draw(ctx, { x: 0, y: 0, screenWidth: logicalWidth, screenHeight: logicalHeight });

        // 标题
        ctx.fillStyle = '#333';
        ctx.font = 'bold 42px "Comic Sans MS", "Chalkboard SE", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(I18n.t('gameTitle'), logicalWidth / 2, 120);

        // 手绘标题下划线
        Utils.drawDoodleLine(ctx, 80, 140, logicalWidth - 80, 140, '#333', 3, 4);

        // 小标题
        ctx.font = 'italic 16px "Comic Sans MS", sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(I18n.t('subtitle'), logicalWidth / 2, 165);

        // 最高分
        ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
        ctx.fillStyle = '#FF9800';
        ctx.fillText(I18n.t('highScore') + ': ' + highScore, logicalWidth / 2, 240);

        // 操作说明
        ctx.fillStyle = '#555';
        ctx.font = '16px "Comic Sans MS", sans-serif';
        const instructions = [
            I18n.t('ctrlMove'),
            I18n.t('ctrlStart'),
            I18n.t('ctrlPause')
        ];
        for (let i = 0; i < instructions.length; i++) {
            ctx.fillText(instructions[i], logicalWidth / 2, 300 + i * 26);
        }

        // 开始按钮提示
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('pressSpaceToStart'), logicalWidth / 2, 420);

        // 帮助按钮提示
        ctx.fillStyle = '#2196F3';
        ctx.font = '14px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('pressHForHelp'), logicalWidth / 2, 450);

        // 语言切换提示
        ctx.fillStyle = '#9E9E9E';
        ctx.font = '12px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('pressLForLang') + ' [' + I18n.getLang().toUpperCase() + ']', logicalWidth / 2, 475);

        // 手绘装饰：一个小人
        Utils.drawDoodlePlayer(ctx, logicalWidth / 2 - 14, 485, 28, 42, true);

        ctx.restore();
    }

    // ─── 绘制游戏结束界面 ───
    function drawGameOver(score, highScore, maxHeight) {
        if (!ctx) return;

        ctx.save();

        // 半透明遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);

        // 面板
        const panelX = 40;
        const panelY = 150;
        const panelW = logicalWidth - 80;
        const panelH = 280;
        ctx.fillStyle = '#FDFBF7';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        Utils.drawDoodleLine(ctx, panelX, panelY, panelX + panelW, panelY, '#333', 3, 3);
        Utils.drawDoodleLine(ctx, panelX + panelW, panelY, panelX + panelW, panelY + panelH, '#333', 3, 3);
        Utils.drawDoodleLine(ctx, panelX + panelW, panelY + panelH, panelX, panelY + panelH, '#333', 3, 3);
        Utils.drawDoodleLine(ctx, panelX, panelY + panelH, panelX, panelY, '#333', 3, 3);

        // GAME OVER 标题
        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 36px "Comic Sans MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(I18n.t('gameOver'), logicalWidth / 2, panelY + 20);

        // 分数信息
        ctx.fillStyle = '#333';
        ctx.font = '20px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('score') + ': ' + score, logicalWidth / 2, panelY + 80);
        ctx.fillText(I18n.t('height') + ': ' + Math.abs(Math.floor(maxHeight)) + 'm', logicalWidth / 2, panelY + 115);

        if (score >= highScore) {
            ctx.fillStyle = '#FF9800';
            ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
            ctx.fillText(I18n.t('newHighScore'), logicalWidth / 2, panelY + 150);
        } else {
            ctx.fillStyle = '#666';
            ctx.fillText(I18n.t('best') + ': ' + highScore, logicalWidth / 2, panelY + 150);
        }

        // 重新开始提示
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('pressSpaceToRestart'), logicalWidth / 2, panelY + 200);

        ctx.restore();
    }

    // ─── 绘制说明页面 ───
    function drawTutorial() {
        if (!ctx) return;

        ctx.save();

        // 背景
        ctx.fillStyle = '#FDFBF7';
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        Background.draw(ctx, { x: 0, y: 0, screenWidth: logicalWidth, screenHeight: logicalHeight });

        // 标题
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px "Comic Sans MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(I18n.t('howToPlay'), logicalWidth / 2, 20);
        Utils.drawDoodleLine(ctx, 100, 52, logicalWidth - 100, 52, '#333', 2, 3);

        const col1X = 70;
        const col2X = 200;
        const col3X = 330;
        const startY = 75;
        const lineH = 58;

        // ─── 列1：平台 ───
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px "Comic Sans MS", sans-serif';
        ctx.fillStyle = '#2E7D32';
        ctx.fillText(I18n.t('platforms'), col1X, startY - 18);

        const platforms = [
            { color: '#4CAF50', stroke: '#2E7D32', name: I18n.t('platformNormal'), desc: I18n.t('platformNormalDesc') },
            { color: '#2196F3', stroke: '#1565C0', name: I18n.t('platformMoving'), desc: I18n.t('platformMovingDesc') },
            { color: '#795548', stroke: '#5D4037', name: I18n.t('platformFragile'), desc: I18n.t('platformFragileDesc') },
            { color: '#AB47BC', stroke: '#7B1FA2', name: I18n.t('platformVanish'), desc: I18n.t('platformVanishDesc') },
            { color: '#F06292', stroke: '#C2185B', name: I18n.t('platformBouncy'), desc: I18n.t('platformBouncyDesc') }
        ];

        platforms.forEach((p, i) => {
            const y = startY + i * lineH;
            ctx.fillStyle = p.color;
            ctx.fillRect(col1X - 25, y, 50, 14);
            Utils.drawDoodleLine(ctx, col1X - 25, y, col1X + 25, y, p.stroke, 1.5, 1);
            Utils.drawDoodleLine(ctx, col1X + 25, y, col1X + 25, y + 14, p.stroke, 1.5, 1);
            Utils.drawDoodleLine(ctx, col1X + 25, y + 14, col1X - 25, y + 14, p.stroke, 1.5, 1);
            Utils.drawDoodleLine(ctx, col1X - 25, y + 14, col1X - 25, y, p.stroke, 1.5, 1);

            ctx.fillStyle = '#333';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(p.name, col1X, y + 22);
            ctx.fillStyle = '#666';
            ctx.font = '9px sans-serif';
            ctx.fillText(p.desc, col1X, y + 36);
        });

        // ─── 列2：道具 ───
        ctx.fillStyle = '#E65100';
        ctx.font = 'bold 14px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('items'), col2X, startY - 18);

        const items = [
            { icon: '🔶', name: I18n.t('itemSpring'), desc: I18n.t('itemSpringDesc') },
            { icon: '🚀', name: I18n.t('itemRocket'), desc: I18n.t('itemRocketDesc') },
            { icon: '🛡️', name: I18n.t('itemShield'), desc: I18n.t('itemShieldDesc') },
            { icon: '🪙', name: I18n.t('itemCoin'), desc: I18n.t('itemCoinDesc') },
            { icon: '🧲', name: I18n.t('itemMagnet'), desc: I18n.t('itemMagnetDesc') },
            { icon: '⭐', name: I18n.t('itemDouble'), desc: I18n.t('itemDoubleDesc') },
            { icon: '🪂', name: I18n.t('itemParachute'), desc: I18n.t('itemParachuteDesc') }
        ];

        items.forEach((item, i) => {
            const y = startY + i * 42;
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.icon, col2X - 45, y + 4);
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(item.name, col2X - 20, y);
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#666';
            ctx.fillText(item.desc, col2X - 20, y + 14);
        });

        // ─── 列3：怪物 ───
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7B1FA2';
        ctx.font = 'bold 14px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('monsters'), col3X, startY - 18);

        const monsters = [
            { icon: '🛸', name: I18n.t('monsterUfo'), desc: I18n.t('monsterUfoDesc') },
            { icon: '👾', name: I18n.t('monsterMonster'), desc: I18n.t('monsterMonsterDesc') },
            { icon: '🌀', name: I18n.t('monsterBlackHole'), desc: I18n.t('monsterBlackHoleDesc') },
            { icon: '🔫', name: I18n.t('monsterTurret'), desc: I18n.t('monsterTurretDesc') }
        ];

        monsters.forEach((m, i) => {
            const y = startY + i * 72;
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(m.icon, col3X - 45, y + 6);
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(m.name, col3X - 18, y);
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#666';
            ctx.fillText(m.desc, col3X - 18, y + 14);
        });

        // ─── 底部控制提示 ───
        ctx.textAlign = 'center';
        ctx.fillStyle = '#555';
        ctx.font = '13px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('controls'), logicalWidth / 2, logicalHeight - 80);

        const controls = [
            I18n.t('ctrlMove'),
            I18n.t('ctrlStart'),
            I18n.t('ctrlPause'),
            I18n.t('ctrlHelp'),
            I18n.t('ctrlLang')
        ];
        ctx.font = '12px sans-serif';
        controls.forEach((c, i) => {
            ctx.fillText(c, logicalWidth / 2, logicalHeight - 64 + i * 14);
        });

        // 返回提示
        ctx.fillStyle = '#2196F3';
        ctx.font = 'bold 14px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('pressToGoBack'), logicalWidth / 2, logicalHeight - 14);

        ctx.restore();
    }

    return {
        init,
        resize,
        getCanvas,
        getCtx,
        render,
        drawHUD,
        drawMenu,
        drawGameOver,
        drawTutorial
    };
})();
