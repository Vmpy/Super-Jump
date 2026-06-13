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
    let highestPlatformY = 0;
    let portalPairs = [];

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
            this.hasItem = false;
            this.portalPair = null;

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
                if (this.x + this.width > canvasWidth) {
                    this.x = canvasWidth - this.width;
                    this.moveDir = -1;
                }
                if (this.x < 0) {
                    this.x = 0;
                    this.moveDir = 1;
                }
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
                case 'speed':
                    fillColor = '#FF9800';
                    strokeColor = '#E65100';
                    break;
                case 'springbed':
                    fillColor = '#E91E63';
                    strokeColor = '#880E4F';
                    break;
                case 'chain':
                    fillColor = '#D32F2F';
                    strokeColor = '#B71C1C';
                    break;
                case 'portal':
                    fillColor = '#7C4DFF';
                    strokeColor = '#6200EA';
                    break;
                default:
                    fillColor = '#4CAF50';
                    strokeColor = '#2E7D32';
            }

            // 填充
            ctx.fillStyle = fillColor;
            ctx.fillRect(this.x, screenY, this.width, this.height);

            // 手绘斜线阴影（涂鸦风格）
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < this.width; i += 6) {
                ctx.beginPath();
                ctx.moveTo(this.x + i, screenY + this.height);
                ctx.lineTo(this.x + i + 4, screenY);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // 手绘边框
            Utils.drawDoodleLine(ctx, this.x, screenY, this.x + this.width, screenY, strokeColor, 2, 2);
            Utils.drawDoodleLine(ctx, this.x + this.width, screenY, this.x + this.width, screenY + this.height, strokeColor, 2, 2);
            Utils.drawDoodleLine(ctx, this.x + this.width, screenY + this.height, this.x, screenY + this.height, strokeColor, 2, 2);
            Utils.drawDoodleLine(ctx, this.x, screenY + this.height, this.x, screenY, strokeColor, 2, 2);

            // 弹力平台画个弹簧标记
            if (this.type === 'bouncy') {
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                const bx = this.x + this.width / 2;
                const by = screenY + this.height / 2;
                ctx.moveTo(bx - 6, by + 3);
                ctx.lineTo(bx - 3, by - 3);
                ctx.lineTo(bx + 3, by + 3);
                ctx.lineTo(bx + 6, by - 3);
                ctx.stroke();
            }

            // 消失平台画个时钟标记
            if (this.type === 'vanishing') {
                const tx = this.x + this.width / 2;
                const ty = screenY + this.height / 2;
                Utils.drawDoodleCircle(ctx, tx, ty, 4, '#FFF', 1.5, 1);
                Utils.drawDoodleLine(ctx, tx, ty, tx, ty - 3, '#FFF', 1.5, 1);
                Utils.drawDoodleLine(ctx, tx, ty, tx + 2, ty + 1, '#FFF', 1.5, 1);
            }

            // 粘液平台画个波浪标记
            if (this.type === 'sticky') {
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                const sx = this.x + this.width / 2;
                const sy = screenY + this.height / 2;
                ctx.beginPath();
                ctx.moveTo(sx - 8, sy);
                ctx.lineTo(sx - 4, sy - 3);
                ctx.lineTo(sx, sy);
                ctx.lineTo(sx + 4, sy + 3);
                ctx.lineTo(sx + 8, sy);
                ctx.stroke();
            }

            // 传送平台画个星形标记
            if (this.type === 'teleport') {
                const tx = this.x + this.width / 2;
                const ty = screenY + this.height / 2;
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const r = i % 2 === 0 ? 5 : 2;
                    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
                    const px = tx + Math.cos(a) * r;
                    const py = ty + Math.sin(a) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            }

            // 加速平台画箭头标记
            if (this.type === 'speed') {
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                const ax = this.x + this.width / 2;
                const ay = screenY + this.height / 2;
                ctx.beginPath();
                ctx.moveTo(ax - 6, ay);
                ctx.lineTo(ax + 2, ay);
                ctx.moveTo(ax - 1, ay - 3);
                ctx.lineTo(ax + 3, ay);
                ctx.lineTo(ax - 1, ay + 3);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(ax + 1, ay);
                ctx.lineTo(ax + 7, ay);
                ctx.moveTo(ax + 4, ay - 3);
                ctx.lineTo(ax + 8, ay);
                ctx.lineTo(ax + 4, ay + 3);
                ctx.stroke();
            }

            // 弹簧床平台画弹簧标记
            if (this.type === 'springbed') {
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                const bx = this.x + this.width / 2;
                const by = screenY + this.height / 2;
                ctx.beginPath();
                ctx.moveTo(bx - 5, by + 4);
                ctx.lineTo(bx - 3, by - 2);
                ctx.lineTo(bx + 3, by + 2);
                ctx.lineTo(bx + 5, by - 4);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(bx - 2, by - 5);
                ctx.lineTo(bx, by - 7);
                ctx.lineTo(bx + 2, by - 5);
                ctx.stroke();
            }

            // 连锁平台画链接标记
            if (this.type === 'chain') {
                const lx = this.x + this.width / 2;
                const ly = screenY + this.height / 2;
                Utils.drawDoodleCircle(ctx, lx - 3, ly, 3, '#FFF', 1.5, 1);
                Utils.drawDoodleCircle(ctx, lx + 3, ly, 3, '#FFF', 1.5, 1);
            }

            // 传送门平台画门标记
            if (this.type === 'portal') {
                const px = this.x + this.width / 2;
                const py = screenY + this.height / 2;
                Utils.drawDoodleCircle(ctx, px, py, 4, '#FFF', 1.5, 1);
                Utils.drawDoodleCircle(ctx, px, py, 2, '#FFF', 1.5, 1);
            }
        }
    }

    // ─── 初始化 ───
    function init(canvasWidth, canvasHeight) {
        platforms = [];
        portalPairs = [];
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

        // 随机类型（11种平台）
        const typeItem = Utils.weightedRandom([
            { type: 'normal', weight: Math.max(0.2, 0.5 - difficulty * 0.2) },
            { type: 'moving', weight: Math.min(0.2, 0.15 + difficulty * 0.1) },
            { type: 'breakable', weight: Math.min(0.15, 0.08 + difficulty * 0.08) },
            { type: 'vanishing', weight: Math.min(0.12, 0.04 + difficulty * 0.06) },
            { type: 'bouncy', weight: 0.06 },
            { type: 'sticky', weight: Math.min(0.1, 0.04 + difficulty * 0.06) },
            { type: 'teleport', weight: Math.min(0.08, 0.02 + difficulty * 0.04) },
            { type: 'speed', weight: 0.05 },
            { type: 'springbed', weight: 0.05 },
            { type: 'chain', weight: Math.min(0.08, 0.03 + difficulty * 0.04) },
            { type: 'portal', weight: 0.04 }
        ]);

        const x = Utils.randomInt(20, canvasWidth - PLATFORM_WIDTH - 20);
        const p = new Platform(x, y, typeItem.type);
        platforms.push(p);
        highestPlatformY = y;

        // 传送门平台需要成对生成
        if (typeItem.type === 'portal') {
            const gap2 = BASE_GAP + difficulty * (MAX_GAP - BASE_GAP);
            const y2 = highestPlatformY - gap2;
            let x2;
            do {
                x2 = Utils.randomInt(20, canvasWidth - PLATFORM_WIDTH - 20);
            } while (Math.abs(x2 - x) < PLATFORM_WIDTH);
            const p2 = new Platform(x2, y2, 'portal');
            p.portalPair = p2;
            p2.portalPair = p;
            platforms.push(p2);
            highestPlatformY = y2;
            portalPairs.push([p, p2]);
        }

        // 随机生成道具（只在运行时调用，此时 Items 已加载）
        if (typeof Items !== 'undefined' && !p.hasItem && Math.random() < 0.15) {
            p.hasItem = true;
            const typeRoll = Math.random();
            let itemType;
            if (typeRoll < 0.20) itemType = 'spring';
            else if (typeRoll < 0.35) itemType = 'coin';
            else if (typeRoll < 0.44) itemType = 'shield';
            else if (typeRoll < 0.52) itemType = 'magnet';
            else if (typeRoll < 0.58) itemType = 'double_score';
            else if (typeRoll < 0.64) itemType = 'parachute';
            else if (typeRoll < 0.70) itemType = 'super_spring';
            else if (typeRoll < 0.76) itemType = 'shrink';
            else if (typeRoll < 0.82) itemType = 'slow_mo';
            else if (typeRoll < 0.88) itemType = 'bomb';
            else if (typeRoll < 0.94) itemType = 'ship';
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
        portalPairs = portalPairs.filter(([a, b]) => a.alive && b.alive && a.y < cleanupY && b.y < cleanupY);
    }

    // ─── 连锁碎裂 ───
    function chainBreak(brokenPlatform, canvasWidth) {
        const chainRange = 120;
        const broken = new Set();
        const queue = [brokenPlatform];
        broken.add(brokenPlatform);

        while (queue.length > 0) {
            const current = queue.shift();
            for (const p of platforms) {
                if (p.type !== 'chain' || !p.alive || broken.has(p)) continue;
                const dx = (p.x + p.width / 2) - (current.x + current.width / 2);
                const dy = (p.y + p.height / 2) - (current.y + current.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < chainRange) {
                    broken.add(p);
                    queue.push(p);
                    setTimeout(() => {
                        if (p.alive) {
                            p.alive = false;
                            AudioManager.breakPlatform();
                            Particles.emitBreak(p.x, p.y, p.width, '#D32F2F');
                        }
                    }, 50 * queue.length);
                }
            }
        }
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
                } else if (p.type === 'speed') {
                    player.y = p.y - player.height;
                    player.vy = 0;
                    Player.activateSpeedBoost();
                    Player.jump('normal');
                } else if (p.type === 'springbed') {
                    player.y = p.y - player.height;
                    player.vy = 0;
                    Player.jump('springbed');
                } else if (p.type === 'chain') {
                    p.break();
                    chainBreak(p, canvasWidth);
                    player.y = p.y - player.height;
                    player.vy = 0;
                    Player.jump('normal');
                } else if (p.type === 'portal') {
                    player.y = p.y - player.height;
                    player.vy = 0;
                    if (p.portalPair && p.portalPair.alive) {
                        player.x = p.portalPair.x + p.portalPair.width / 2 - player.width / 2;
                        player.y = p.portalPair.y - player.height;
                        Particles.emitTeleport(player.x + player.width / 2, player.y + player.height / 2);
                    }
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
