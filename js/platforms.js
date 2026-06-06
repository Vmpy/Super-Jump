/**
 * platforms.js - 平台系统模块
 * 平台生成算法、类型管理、碰撞检测、对象池
 */

const Platforms = (function () {
    const PLATFORM_WIDTH = 60;
    const PLATFORM_HEIGHT = 15;
    const BASE_GAP = 60;
    const MAX_GAP = 120;
    const INITIAL_COUNT = 8;

    let platforms = [];
    let highestPlatformY = 0; // 最上方的平台y坐标（越小越高）

    // ─── 平台类 ───
    class Platform {
        constructor(x, y, type = 'normal') {
            this.x = x;
            this.y = y;
            this.width = PLATFORM_WIDTH;
            this.height = PLATFORM_HEIGHT;
            this.type = type;
            this.alive = true;
            this.moveSpeed = 0;
            this.moveRange = 0;
            this.moveCenter = x;
            this.moveDir = 1;

            // 消失平台专用
            this.vanishTimer = 0;
            this.stepped = false;
            this.blinkVisible = true;
            this.blinkTimer = 0;

            if (type === 'moving') {
                this.moveSpeed = Utils.random(30, 80);
                this.moveRange = Utils.random(40, 100);
            }
        }

        update(dt, canvasWidth) {
            if (this.type === 'moving') {
                this.x += this.moveSpeed * this.moveDir * dt;
                if (this.x > this.moveCenter + this.moveRange || this.x < this.moveCenter - this.moveRange) {
                    this.moveDir *= -1;
                }
                // 穿墙
                if (this.x + this.width < 0) this.x = canvasWidth;
                if (this.x > canvasWidth) this.x = -this.width;
            }

            // 消失平台逻辑
            if (this.type === 'vanishing' && this.stepped && this.alive) {
                this.vanishTimer -= dt;
                // 最后0.3秒开始闪烁
                if (this.vanishTimer < 0.3) {
                    this.blinkTimer -= dt;
                    if (this.blinkTimer <= 0) {
                        this.blinkVisible = !this.blinkVisible;
                        this.blinkTimer = 0.08;
                    }
                }
                if (this.vanishTimer <= 0) {
                    this.alive = false;
                    AudioManager.breakPlatform();
                    Particles.emitBreak(this.x, this.y, this.width, '#9C27B0');
                }
            }
        }

        break() {
            this.alive = false;
            AudioManager.breakPlatform();
            Particles.emitBreak(this.x, this.y, this.width);
        }

        draw(ctx, camera) {
            const screenY = this.y - camera.y;
            if (screenY < -50 || screenY > camera.screenHeight + 50) return;

            // 消失平台闪烁时隐藏填充
            if (this.type === 'vanishing' && this.stepped && !this.blinkVisible) {
                // 只画边框虚线表示即将消失
                ctx.setLineDash([4, 4]);
                Utils.drawDoodleLine(ctx, this.x, screenY, this.x + this.width, screenY, '#9C27B0', 2, 2);
                Utils.drawDoodleLine(ctx, this.x + this.width, screenY, this.x + this.width, screenY + this.height, '#9C27B0', 2, 2);
                Utils.drawDoodleLine(ctx, this.x + this.width, screenY + this.height, this.x, screenY + this.height, '#9C27B0', 2, 2);
                Utils.drawDoodleLine(ctx, this.x, screenY + this.height, this.x, screenY, '#9C27B0', 2, 2);
                ctx.setLineDash([]);
                return;
            }

            let fillColor, strokeColor;
            switch (this.type) {
                case 'normal':
                    fillColor = '#4CAF50';
                    strokeColor = '#2E7D32';
                    break;
                case 'moving':
                    fillColor = '#2196F3';
                    strokeColor = '#1565C0';
                    break;
                case 'breakable':
                    fillColor = '#795548';
                    strokeColor = '#5D4037';
                    break;
                case 'vanishing':
                    fillColor = '#AB47BC';
                    strokeColor = '#7B1FA2';
                    break;
                case 'bouncy':
                    fillColor = '#F06292';
                    strokeColor = '#C2185B';
                    break;
                case 'sticky':
                    fillColor = '#8BC34A';
                    strokeColor = '#558B2F';
                    break;
                case 'teleport':
                    fillColor = '#00BCD4';
                    strokeColor = '#00838F';
                    break;
                default:
                    fillColor = '#4CAF50';
                    strokeColor = '#2E7D32';
            }

            // 填充
            ctx.fillStyle = fillColor;
            ctx.fillRect(this.x, screenY, this.width, this.height);

            // 手绘边框
            Utils.drawDoodleLine(ctx, this.x, screenY, this.x + this.width, screenY, strokeColor, 2, 2);
            Utils.drawDoodleLine(ctx, this.x + this.width, screenY, this.x + this.width, screenY + this.height, strokeColor, 2, 2);
            Utils.drawDoodleLine(ctx, this.x + this.width, screenY + this.height, this.x, screenY + this.height, strokeColor, 2, 2);
            Utils.drawDoodleLine(ctx, this.x, screenY + this.height, this.x, screenY, strokeColor, 2, 2);

            // 弹力平台画个弹簧标记
            if (this.type === 'bouncy') {
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('~', this.x + this.width / 2, screenY + this.height / 2 + 1);
            }

            // 消失平台画个时钟标记
            if (this.type === 'vanishing') {
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('◷', this.x + this.width / 2, screenY + this.height / 2 + 1);
            }

            // 粘液平台画个波浪标记
            if (this.type === 'sticky') {
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('≈', this.x + this.width / 2, screenY + this.height / 2 + 1);
            }

            // 传送平台画个星形标记
            if (this.type === 'teleport') {
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✦', this.x + this.width / 2, screenY + this.height / 2 + 1);
            }
        }
    }

    // ─── 初始化 ───
    function init(canvasWidth, canvasHeight) {
        platforms = [];
        highestPlatformY = canvasHeight - 80;

        // 安全平台：固定在中央，确保玩家出生正下方一定有落脚点
        // 避免"出生即死"的新手体验问题
        const safetyX = canvasWidth / 2 - PLATFORM_WIDTH / 2;
        const safetyY = canvasHeight - 80;
        platforms.push(new Platform(safetyX, safetyY, 'normal'));

        // 再生成更多起始平台（随机位置，但避免与中央安全平台重叠）
        for (let i = 0; i < 4; i++) {
            const y = canvasHeight - 50 - i * 80;
            // 如果这个 y 位置与安全平台太近，则跳过（避免完全重叠）
            if (Math.abs(y - safetyY) < 30) {
                continue;
            }
            const x = Utils.randomInt(20, canvasWidth - PLATFORM_WIDTH - 20);
            platforms.push(new Platform(x, y, 'normal'));
            if (y < highestPlatformY) highestPlatformY = y;
        }

        // 再生成一些随机平台
        generateBatch(canvasWidth, canvasHeight, INITIAL_COUNT);
    }

    // ─── 生成一批平台 ───
    function generateBatch(canvasWidth, canvasHeight, count) {
        for (let i = 0; i < count; i++) {
            generateOne(canvasWidth);
        }
    }

    function generateOne(canvasWidth) {
        const player = Player.get();
        const currentHeight = player ? Math.abs(player.maxHeight) : 0;
        const difficulty = Math.min(currentHeight / 5000, 1.5);

        // 间距随难度增加
        const gap = BASE_GAP + difficulty * (MAX_GAP - BASE_GAP);
        const y = highestPlatformY - gap;

        // 随机类型（7种平台）
        const typeItem = Utils.weightedRandom([
            { type: 'normal', weight: Math.max(0.2, 0.6 - difficulty * 0.2) },
            { type: 'moving', weight: Math.min(0.25, 0.2 + difficulty * 0.1) },
            { type: 'breakable', weight: Math.min(0.2, 0.1 + difficulty * 0.1) },
            { type: 'vanishing', weight: Math.min(0.15, 0.05 + difficulty * 0.08) },
            { type: 'bouncy', weight: 0.08 },
            { type: 'sticky', weight: Math.min(0.15, 0.05 + difficulty * 0.08) },
            { type: 'teleport', weight: Math.min(0.1, 0.03 + difficulty * 0.05) }
        ]);

        const x = Utils.randomInt(20, canvasWidth - PLATFORM_WIDTH - 20);
        const p = new Platform(x, y, typeItem.type);
        platforms.push(p);
        highestPlatformY = y;

        // 随机生成道具（只在运行时调用，此时 Items 已加载）
        if (typeof Items !== 'undefined' && Math.random() < 0.15) {
            const typeRoll = Math.random();
            let itemType;
            if (typeRoll < 0.22) itemType = 'spring';
            else if (typeRoll < 0.37) itemType = 'coin';
            else if (typeRoll < 0.47) itemType = 'shield';
            else if (typeRoll < 0.55) itemType = 'magnet';
            else if (typeRoll < 0.62) itemType = 'double_score';
            else if (typeRoll < 0.69) itemType = 'parachute';
            else if (typeRoll < 0.75) itemType = 'super_spring';
            else if (typeRoll < 0.81) itemType = 'shrink';
            else if (typeRoll < 0.87) itemType = 'slow_mo';
            else if (typeRoll < 0.93) itemType = 'bomb';
            else itemType = 'rocket';
            Items.addItem(x + PLATFORM_WIDTH / 2 - 10, y - 25, itemType, p);
        }
    }

    // ─── 更新 ───
    function update(dt, canvasWidth, canvasHeight) {
        const player = Player.get();
        if (!player) return;

        // 更新所有平台
        for (const p of platforms) {
            p.update(dt, canvasWidth);
        }

        // 动态生成：当最上方平台进入屏幕时，生成更多
        const cameraTop = player.y - canvasHeight * 0.4;
        if (highestPlatformY > cameraTop - canvasHeight) {
            generateOne(canvasWidth);
        }

        // 清理屏幕下方很远的平台
        const cleanupY = cameraTop + canvasHeight * 2;
        platforms = platforms.filter(p => p.y < cleanupY && p.alive);
    }

    // ─── 碰撞检测 ───
    function checkCollisions(canvasWidth) {
        const player = Player.get();
        if (!player || !player.alive) return;

        for (const p of platforms) {
            if (!p.alive) continue;
            if (Utils.checkPlatformCollision(player, p)) {
                // 消失平台：触发倒计时
                if (p.type === 'vanishing' && !p.stepped) {
                    p.stepped = true;
                    p.vanishTimer = 1.0; // 1.0秒后消失
                    p.blinkTimer = 0.08;
                }

                // 弹力平台：超级跳跃
                if (p.type === 'bouncy') {
                    player.y = p.y - player.height;
                    player.vy = 0;
                    Player.jump('bouncy');
                    Particles.emitSpring(player.x + player.width / 2, player.y + player.height);
                } else if (p.type === 'breakable') {
                    p.break();
                    player.y = p.y - player.height;
                    player.vy = 0;
                    Player.jump('normal');
                } else if (p.type === 'sticky') {
                    if (player.stickyTimer <= 0) {
                        player.y = p.y - player.height;
                        player.vy = 0;
                        player.stickyTimer = 0.5;
                    }
                } else if (p.type === 'teleport') {
                    player.y = p.y - player.height;
                    player.vy = 0;
                    Player.teleport(canvasWidth);
                    Player.jump('normal');
                } else {
                    player.y = p.y - player.height;
                    player.vy = 0;
                    Player.jump('normal');
                }
                break;
            }
        }
    }

    function getPlatforms() {
        return platforms;
    }

    function getHighestPlatformY() {
        return highestPlatformY;
    }

    function draw(ctx, camera) {
        for (const p of platforms) {
            if (p.alive) {
                p.draw(ctx, camera);
            }
        }
    }

    return {
        init,
        update,
        checkCollisions,
        getPlatforms,
        getHighestPlatformY,
        draw,
        PLATFORM_WIDTH,
        PLATFORM_HEIGHT
    };
})();
