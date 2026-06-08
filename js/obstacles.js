/**
 * obstacles.js - 障碍物/怪物系统模块
 * UFO、黑洞等怪物，碰到即游戏结束
 */

const Obstacles = (function () {
    let obstacles = [];
    let bullets = [];

    class Bullet {
        constructor(x, y, dir) {
            this.x = x;
            this.y = y;
            this.width = 8;
            this.height = 4;
            this.speed = 120;
            this.dir = dir; // 1 = right, -1 = left
            this.alive = true;
        }

        update(dt) {
            this.x += this.speed * this.dir * dt;
            if (this.x < -20 || this.x > 420) this.alive = false;
        }

        draw(ctx, camera) {
            const screenY = this.y - camera.y;
            if (screenY < -50 || screenY > camera.screenHeight + 50) return;
            ctx.fillStyle = '#FFEB3B';
            ctx.fillRect(this.x, screenY, this.width, this.height);
            Utils.drawDoodleLine(ctx, this.x, screenY, this.x + this.width, screenY, '#F57F17', 1.5, 2);
            Utils.drawDoodleLine(ctx, this.x, screenY + this.height, this.x + this.width, screenY + this.height, '#F57F17', 1.5, 2);
        }
    }

    class Obstacle {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.width = 40;
            this.height = 30;
            this.type = type; // 'ufo', 'monster', 'blackhole', 'turret'
            this.alive = true;
            this.moveSpeed = Utils.random(40, 80);
            this.moveRange = Utils.random(50, 120);
            this.moveCenterX = x;
            this.moveDir = Math.random() < 0.5 ? 1 : -1;
            this.wobble = 0;
            this.shootTimer = 0;
            this.shootInterval = Utils.random(1.5, 3.0);

            if (type === 'blackhole') {
                this.width = 36;
                this.height = 36;
                this.moveSpeed = 30; // 缓慢下坠
            } else if (type === 'turret') {
                this.width = 32;
                this.height = 28;
                this.moveSpeed = 0; // 固定位置
            }
        }

        update(dt, canvasWidth, canvasHeight) {
            if (this.type === 'blackhole') {
                // 黑洞：缓慢下坠
                this.y += this.moveSpeed * dt;
                this.wobble += dt * 2;
                // 超出屏幕底部很远则销毁
                if (this.y > canvasHeight + 200) this.alive = false;
            } else if (this.type === 'turret') {
                // 炮台：定期发射子弹
                this.shootTimer -= dt;
                if (this.shootTimer <= 0) {
                    this.shootTimer = this.shootInterval;
                    // 朝玩家方向发射
                    const player = Player.get();
                    const dir = player && player.x < this.x ? -1 : 1;
                    bullets.push(new Bullet(
                        this.x + this.width / 2,
                        this.y + this.height / 2,
                        dir
                    ));
                }
            } else {
                // UFO 和怪物：左右移动
                this.x += this.moveSpeed * this.moveDir * dt;
                this.wobble += dt * 4;

                if (this.x > this.moveCenterX + this.moveRange || this.x < this.moveCenterX - this.moveRange) {
                    this.moveDir *= -1;
                }
            }
        }

        draw(ctx, camera) {
            const screenY = this.y - camera.y;
            if (screenY < -80 || screenY > camera.screenHeight + 80) return;

            const cx = this.x + this.width / 2;
            const cy = screenY + this.height / 2;

            if (this.type === 'ufo') {
                drawUFO(ctx, cx, cy);
            } else if (this.type === 'monster') {
                drawMonster(ctx, cx, cy);
            } else if (this.type === 'blackhole') {
                drawBlackHole(ctx, cx, cy, this.wobble);
            } else if (this.type === 'turret') {
                drawTurret(ctx, cx, cy, this.shootTimer, this.shootInterval);
            }
        }
    }

    // ─── 绘制 UFO ───
    function drawUFO(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#9C27B0';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 20, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 20, cy + 2, cx + 20, cy + 2, '#6A1B9A', 2, 2);
        ctx.fillStyle = '#CE93D8';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 1, 10, 9, 0, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 10, cy - 1, cx + 10, cy - 1, '#6A1B9A', 2, 2);
        Utils.drawDoodleCircle(ctx, cx, cy - 5, 9, '#6A1B9A', 2, 2);
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(cx - 8, cy + 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(cx, cy + 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(cx + 8, cy + 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // ─── 绘制小怪物 ───
    function drawMonster(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#8BC34A';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy, 14, '#558B2F', 2, 2);
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(cx - 5, cy - 3, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 5, cy - 3, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx - 5, cy - 3, 5, '#558B2F', 1.5, 2);
        Utils.drawDoodleCircle(ctx, cx + 5, cy - 3, 5, '#558B2F', 1.5, 2);
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 5, cy - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 9, cy - 9, cx - 3, cy - 7, '#558B2F', 2, 2);
        Utils.drawDoodleLine(ctx, cx + 9, cy - 9, cx + 3, cy - 7, '#558B2F', 2, 2);
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + 6);
        ctx.lineTo(cx - 3, cy + 10);
        ctx.lineTo(cx, cy + 6);
        ctx.lineTo(cx + 3, cy + 10);
        ctx.lineTo(cx + 6, cy + 6);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 6, cy + 6, cx - 3, cy + 10, '#558B2F', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx, cy + 6, cx + 3, cy + 10, '#558B2F', 1.5, 2);
        ctx.restore();
    }

    // ─── 绘制黑洞 ───
    function drawBlackHole(ctx, cx, cy, wobble) {
        ctx.save();
        const r = 16 + Math.sin(wobble) * 2;
        ctx.fillStyle = '#4A148C';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy, r, '#7B1FA2', 2, 2);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E1BEE7';
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + wobble;
            const rr = 11 + Math.sin(wobble * 2 + i) * 3;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // ─── 绘制炮台 ───
    function drawTurret(ctx, cx, cy, shootTimer, shootInterval) {
        ctx.save();
        ctx.fillStyle = '#546E7A';
        ctx.fillRect(cx - 12, cy + 6, 24, 10);
        Utils.drawDoodleLine(ctx, cx - 12, cy + 6, cx + 12, cy + 6, '#37474F', 2, 2);
        Utils.drawDoodleLine(ctx, cx + 12, cy + 6, cx + 12, cy + 16, '#37474F', 2, 2);
        Utils.drawDoodleLine(ctx, cx + 12, cy + 16, cx - 12, cy + 16, '#37474F', 2, 2);
        Utils.drawDoodleLine(ctx, cx - 12, cy + 16, cx - 12, cy + 6, '#37474F', 2, 2);
        const charge = 1 - (shootTimer / shootInterval);
        const barrelColor = charge > 0.7 ? '#FF5722' : '#78909C';
        ctx.fillStyle = barrelColor;
        ctx.fillRect(cx - 4, cy - 8, 8, 14);
        Utils.drawDoodleLine(ctx, cx - 4, cy - 8, cx + 4, cy - 8, '#37474F', 2, 2);
        Utils.drawDoodleLine(ctx, cx + 4, cy - 8, cx + 4, cy + 6, '#37474F', 2, 2);
        Utils.drawDoodleLine(ctx, cx + 4, cy + 6, cx - 4, cy + 6, '#37474F', 2, 2);
        Utils.drawDoodleLine(ctx, cx - 4, cy + 6, cx - 4, cy - 8, '#37474F', 2, 2);
        ctx.fillStyle = '#263238';
        ctx.fillRect(cx - 2, cy - 12, 4, 4);
        if (charge > 0.7) {
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.arc(cx, cy - 12, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // ─── 生成怪物 ───
    function spawn(canvasWidth, cameraY, screenHeight, difficulty) {
        // 清理旧的
        const threshold = cameraY + screenHeight * 2;
        obstacles = obstacles.filter(o => o.y < threshold && o.alive);
        bullets = bullets.filter(b => b.alive);

        // 难度越高，怪物出现概率越高
        const spawnChance = Math.min(0.35, 0.05 + difficulty * 0.15);
        if (Math.random() > spawnChance) return;

        // 随机类型（4种怪物）
        const roll = Math.random();
        let type, x, y;

        if (roll < 0.4) {
            type = 'ufo';
            y = cameraY - Utils.random(100, screenHeight);
            x = Utils.randomInt(40, canvasWidth - 80);
        } else if (roll < 0.7) {
            type = 'monster';
            y = cameraY - Utils.random(100, screenHeight);
            x = Utils.randomInt(40, canvasWidth - 80);
        } else if (roll < 0.85) {
            type = 'blackhole';
            y = cameraY - Utils.random(50, 150); // 从屏幕上方进入
            x = Utils.randomInt(50, canvasWidth - 50);
        } else {
            type = 'turret';
            y = cameraY - Utils.random(100, screenHeight);
            x = Utils.randomInt(60, canvasWidth - 60);
        }

        obstacles.push(new Obstacle(x, y, type));
    }

    // ─── 更新 ───
    function update(dt, canvasWidth, canvasHeight) {
        for (const o of obstacles) {
            o.update(dt, canvasWidth, canvasHeight);
        }
        for (const b of bullets) {
            b.update(dt);
        }
    }

    // ─── 碰撞检测 ───
    function checkCollisions(player) {
        if (!player || !player.alive) return false;

        // 怪物碰撞
        for (const o of obstacles) {
            if (!o.alive) continue;
            // 稍微缩小碰撞箱，让玩家有喘息空间
            const hitBox = {
                x: o.x + 5,
                y: o.y + 5,
                width: o.width - 10,
                height: o.height - 10
            };
            if (Utils.checkAABB(player, hitBox)) {
                // 检查是否踩头（UFO和怪物可以被踩死）
                if ((o.type === 'ufo' || o.type === 'monster') && isStomping(player, o)) {
                    o.alive = false;
                    Particles.emitBreak(o.x + o.width / 2, o.y + o.height / 2, o.width, '#8BC34A');
                    AudioManager.breakPlatform();
                    // 踩头后弹跳
                    player.vy = -400;
                    player.y = o.y - player.height;
                } else {
                    if (Player.takeDamage()) {
                        return true; // 游戏结束
                    }
                }
            }
        }

        // 子弹碰撞
        for (const b of bullets) {
            if (!b.alive) continue;
            if (Utils.checkAABB(player, b)) {
                b.alive = false;
                if (Player.takeDamage()) {
                    return true;
                }
            }
        }

        return false;
    }

    // 判断是否踩头
    function isStomping(player, obstacle) {
        // 玩家必须在下落
        if (player.vy <= 0) return false;
        // 玩家上一帧底部在障碍物顶部之上（或接近）
        const prevBottom = player.prevY + player.height;
        const obstacleTop = obstacle.y;
        if (prevBottom > obstacleTop + 10) return false;
        // 玩家当前底部在障碍物上半部分
        const playerBottom = player.y + player.height;
        const obstacleMid = obstacle.y + obstacle.height / 2;
        return playerBottom < obstacleMid;
    }

    function draw(ctx, camera) {
        for (const o of obstacles) {
            o.draw(ctx, camera);
        }
        for (const b of bullets) {
            b.draw(ctx, camera);
        }
    }

    function clear() {
        obstacles = [];
        bullets = [];
    }

    function clearAll() {
        for (const o of obstacles) {
            if (o.alive) {
                o.alive = false;
                Particles.emitBreak(o.x + o.width / 2, o.y + o.height / 2, o.width, '#546E7A');
            }
        }
        bullets = [];
    }

    return {
        spawn,
        update,
        checkCollisions,
        draw,
        clear,
        clearAll
    };
})();
