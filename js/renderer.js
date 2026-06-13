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
                statusX += 20;
            }
            if (player.shrinkTimer > 0) {
                ctx.fillStyle = 'rgba(156, 39, 176, 0.8)';
                ctx.fillRect(statusX, statusY, iconSize, iconSize);
                ctx.fillStyle = '#FFF';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(I18n.t('statusShrink'), statusX + iconSize / 2, statusY + iconSize / 2 + 2);
                statusX += 20;
            }
            if (player.slowMoTimer > 0) {
                ctx.fillStyle = 'rgba(0, 188, 212, 0.8)';
                ctx.fillRect(statusX, statusY, iconSize, iconSize);
                ctx.fillStyle = '#FFF';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(I18n.t('statusSlowMo'), statusX + iconSize / 2, statusY + iconSize / 2 + 2);
                statusX += 20;
            }
            if (player.isShiping) {
                ctx.fillStyle = 'rgba(96, 125, 139, 0.8)';
                ctx.fillRect(statusX, statusY, iconSize, iconSize);
                ctx.fillStyle = '#FFF';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(I18n.t('statusShip'), statusX + iconSize / 2, statusY + iconSize / 2 + 2);
                statusX += 20;
            }
            if (player.speedBoostTimer > 0) {
                ctx.fillStyle = 'rgba(255, 152, 0, 0.8)';
                ctx.fillRect(statusX, statusY, iconSize, iconSize);
                ctx.fillStyle = '#FFF';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(I18n.t('statusSpeed'), statusX + iconSize / 2, statusY + iconSize / 2 + 2);
            }
        }

        // 风力指示器
        if (Wind.isActive()) {
            const windDir = Wind.getDirection();
            const windStr = Wind.getStrength();
            const indicatorX = logicalWidth - 40;
            const indicatorY = 50;
            const arrowLen = 15 + (windStr / 120) * 15;

            ctx.save();
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            // 箭头主线
            ctx.beginPath();
            ctx.moveTo(indicatorX - windDir * arrowLen / 2, indicatorY);
            ctx.lineTo(indicatorX + windDir * arrowLen / 2, indicatorY);
            ctx.stroke();

            // 箭头头部
            ctx.beginPath();
            ctx.moveTo(indicatorX + windDir * arrowLen / 2, indicatorY);
            ctx.lineTo(indicatorX + windDir * (arrowLen / 2 - 6), indicatorY - 5);
            ctx.moveTo(indicatorX + windDir * arrowLen / 2, indicatorY);
            ctx.lineTo(indicatorX + windDir * (arrowLen / 2 - 6), indicatorY + 5);
            ctx.stroke();

            // 风力强度条
            ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
            ctx.fillRect(indicatorX - 20, indicatorY + 10, 40, 6);
            ctx.fillStyle = '#2196F3';
            const barWidth = (windStr / 120) * 40;
            ctx.fillRect(indicatorX - 20, indicatorY + 10, barWidth, 6);

            ctx.restore();
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

    let tutorialPage = 0;
    const TUTORIAL_PAGES = 2;

    function setTutorialPage(page) {
        tutorialPage = page;
    }

    function getTutorialPage() {
        return tutorialPage;
    }

    function nextTutorialPage() {
        tutorialPage = (tutorialPage + 1) % TUTORIAL_PAGES;
    }

    function prevTutorialPage() {
        tutorialPage = (tutorialPage - 1 + TUTORIAL_PAGES) % TUTORIAL_PAGES;
    }

    // ─── 绘制说明页面 ───
    function drawTutorial() {
        if (!ctx) return;

        ctx.save();

        ctx.fillStyle = '#FDFBF7';
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        Background.draw(ctx, { x: 0, y: 0, screenWidth: logicalWidth, screenHeight: logicalHeight });

        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px "Comic Sans MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(I18n.t('howToPlay'), logicalWidth / 2, 10);
        Utils.drawDoodleLine(ctx, 100, 38, logicalWidth - 100, 38, '#333', 2, 3);

        if (tutorialPage === 0) {
            drawTutorialPlatforms();
        } else {
            drawTutorialItemsMonsters();
        }

        // 页码指示器
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < TUTORIAL_PAGES; i++) {
            const dotX = logicalWidth / 2 - (TUTORIAL_PAGES - 1) * 12 + i * 24;
            const dotY = logicalHeight - 40;
            ctx.beginPath();
            if (i === tutorialPage) {
                ctx.fillStyle = '#333';
                ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = '#CCC';
                ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            }
            ctx.fill();
        }

        // 翻页提示
        ctx.fillStyle = '#999';
        ctx.font = '11px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('tutorialNav'), logicalWidth / 2, logicalHeight - 22);

        // 返回提示
        ctx.fillStyle = '#2196F3';
        ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('pressToGoBack'), logicalWidth / 2, logicalHeight - 6);

        ctx.restore();
    }

    function drawTutorialPlatforms() {
        const startY = 56;
        const lineH = 34;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
        ctx.fillStyle = '#2E7D32';
        ctx.fillText(I18n.t('platforms'), logicalWidth / 2, startY - 16);

        const platforms = [
            { color: '#4CAF50', stroke: '#2E7D32', name: I18n.t('platformNormal'), desc: I18n.t('platformNormalDesc') },
            { color: '#2196F3', stroke: '#1565C0', name: I18n.t('platformMoving'), desc: I18n.t('platformMovingDesc') },
            { color: '#795548', stroke: '#5D4037', name: I18n.t('platformFragile'), desc: I18n.t('platformFragileDesc') },
            { color: '#AB47BC', stroke: '#7B1FA2', name: I18n.t('platformVanish'), desc: I18n.t('platformVanishDesc') },
            { color: '#F06292', stroke: '#C2185B', name: I18n.t('platformBouncy'), desc: I18n.t('platformBouncyDesc') },
            { color: '#8BC34A', stroke: '#558B2F', name: I18n.t('platformSticky'), desc: I18n.t('platformStickyDesc') },
            { color: '#00BCD4', stroke: '#00838F', name: I18n.t('platformTeleport'), desc: I18n.t('platformTeleportDesc') },
            { color: '#FF9800', stroke: '#E65100', name: I18n.t('platformSpeed'), desc: I18n.t('platformSpeedDesc') },
            { color: '#E91E63', stroke: '#880E4F', name: I18n.t('platformSpringbed'), desc: I18n.t('platformSpringbedDesc') },
            { color: '#D32F2F', stroke: '#B71C1C', name: I18n.t('platformChain'), desc: I18n.t('platformChainDesc') },
            { color: '#7C4DFF', stroke: '#6200EA', name: I18n.t('platformPortal'), desc: I18n.t('platformPortalDesc') }
        ];

        const leftCX = 100;
        const rightCX = 300;
        const boxW = 50;
        const boxH = 10;

        platforms.forEach((p, i) => {
            const col = i < 6 ? 0 : 1;
            const row = col === 0 ? i : i - 6;
            const cx = col === 0 ? leftCX : rightCX;
            const y = startY + row * lineH;

            ctx.fillStyle = p.color;
            ctx.fillRect(cx - boxW / 2, y, boxW, boxH);
            Utils.drawDoodleLine(ctx, cx - boxW / 2, y, cx + boxW / 2, y, p.stroke, 1, 1);
            Utils.drawDoodleLine(ctx, cx + boxW / 2, y, cx + boxW / 2, y + boxH, p.stroke, 1, 1);
            Utils.drawDoodleLine(ctx, cx + boxW / 2, y + boxH, cx - boxW / 2, y + boxH, p.stroke, 1, 1);
            Utils.drawDoodleLine(ctx, cx - boxW / 2, y + boxH, cx - boxW / 2, y, p.stroke, 1, 1);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#333';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(p.name, cx, y + boxH + 2);
            ctx.fillStyle = '#888';
            ctx.font = '9px sans-serif';
            ctx.fillText(p.desc, cx, y + boxH + 14);
        });

        const ctrlY = startY + 6 * lineH + 10;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#555';
        ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('controls'), logicalWidth / 2, ctrlY);
        const controls = [
            I18n.t('ctrlMove'),
            I18n.t('ctrlStart'),
            I18n.t('ctrlPause'),
            I18n.t('ctrlHelp'),
            I18n.t('ctrlLang')
        ];
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#666';
        controls.forEach((c, i) => {
            ctx.fillText(c, logicalWidth / 2, ctrlY + 18 + i * 15);
        });
    }

    function drawTutorialItemsMonsters() {
        const startY = 56;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
        ctx.fillStyle = '#E65100';
        ctx.fillText(I18n.t('items'), logicalWidth / 2, startY - 16);

        const items = [
            { icon: '🔶', name: I18n.t('itemSpring'), desc: I18n.t('itemSpringDesc') },
            { icon: '🔴', name: I18n.t('itemSuperSpring'), desc: I18n.t('itemSuperSpringDesc') },
            { icon: '🚀', name: I18n.t('itemRocket'), desc: I18n.t('itemRocketDesc') },
            { icon: '🛡️', name: I18n.t('itemShield'), desc: I18n.t('itemShieldDesc') },
            { icon: '🪙', name: I18n.t('itemCoin'), desc: I18n.t('itemCoinDesc') },
            { icon: '🧲', name: I18n.t('itemMagnet'), desc: I18n.t('itemMagnetDesc') },
            { icon: '⭐', name: I18n.t('itemDouble'), desc: I18n.t('itemDoubleDesc') },
            { icon: '🪂', name: I18n.t('itemParachute'), desc: I18n.t('itemParachuteDesc') },
            { icon: '🔮', name: I18n.t('itemShrink'), desc: I18n.t('itemShrinkDesc') },
            { icon: '⏱️', name: I18n.t('itemSlowMo'), desc: I18n.t('itemSlowMoDesc') },
            { icon: '💣', name: I18n.t('itemBomb'), desc: I18n.t('itemBombDesc') },
            { icon: '🛸', name: I18n.t('itemShip'), desc: I18n.t('itemShipDesc') }
        ];

        const itemLineH = 26;
        const itemStartY = startY;
        const leftX = 10;
        const rightX = 210;

        items.forEach((item, i) => {
            const col = i < 6 ? 0 : 1;
            const row = col === 0 ? i : i - 6;
            const baseX = col === 0 ? leftX : rightX;
            const y = itemStartY + row * itemLineH;

            ctx.textBaseline = 'top';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.icon, baseX, y);
            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(item.name, baseX + 22, y);
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#888';
            ctx.fillText(item.desc, baseX + 22, y + 12);
        });

        const monsterStartY = itemStartY + 6 * itemLineH + 16;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#7B1FA2';
        ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
        ctx.fillText(I18n.t('monsters'), logicalWidth / 2, monsterStartY - 16);

        const monsters = [
            { icon: '🛸', name: I18n.t('monsterUfo'), desc: I18n.t('monsterUfoDesc') },
            { icon: '👾', name: I18n.t('monsterMonster'), desc: I18n.t('monsterMonsterDesc') },
            { icon: '🌀', name: I18n.t('monsterBlackHole'), desc: I18n.t('monsterBlackHoleDesc') },
            { icon: '🔫', name: I18n.t('monsterTurret'), desc: I18n.t('monsterTurretDesc') }
        ];

        const monsterLineH = 28;
        const monsterBaseX = logicalWidth / 2 - 90;
        monsters.forEach((m, i) => {
            const y = monsterStartY + i * monsterLineH;
            ctx.textBaseline = 'top';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(m.icon, monsterBaseX, y);
            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(m.name, monsterBaseX + 24, y);
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#888';
            ctx.fillText(m.desc, monsterBaseX + 24, y + 13);
        });
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
        drawTutorial,
        prevTutorialPage,
        nextTutorialPage
    };
})();
