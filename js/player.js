/**
 * player.js - 玩家角色模块
 * 物理运动、碰撞响应、穿墙、动画状态
 */

const Player = (function () {
    const PLAYER_WIDTH = 28;
    const PLAYER_HEIGHT = 42;
    const MOVE_SPEED = 300;
    const GRAVITY = 800;
    const BASE_JUMP_VELOCITY = -500;
    const SPRING_JUMP_VELOCITY = -800;
    const BOUNCY_JUMP_VELOCITY = -1000;
    const MAX_FALL_SPEED = 600;
    const PARACHUTE_FALL_SPEED = 250; // 降落伞时下落速度
    const ROCKET_DURATION = 2.0;   // 火箭持续时间（秒）
    const ROCKET_SPEED = -600;     // 火箭上升速度
    const SHIP_DURATION = 5.0;   // 飞船持续时间（秒）
    const SHIP_SPEED = -500;       // 飞船上升速度
    const MAGNET_DURATION = 6.0;   // 磁铁持续时间
    const DOUBLE_SCORE_DURATION = 8.0; // 双倍分数持续时间
    const PARACHUTE_DURATION = 5.0;  // 降落伞持续时间
    const MAGNET_RANGE = 80;       // 磁铁吸附范围
    const SUPER_SPRING_JUMP_VELOCITY = -1200; // 超级弹簧跳跃速度
    const SHRINK_DURATION = 5.0;   // 缩小持续时间
    const SLOW_MO_DURATION = 3.0;  // 时间缓速持续时间

    let player = null;

    function create(x, y) {
        player = {
            x: x,
            y: y,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            vx: 0,
            vy: 0,
            prevX: x,
            prevY: y,
            facingRight: true,
            hasShield: false,
            isRocketing: false,
            rocketTimer: 0,
            isShiping: false,
            shipTimer: 0,
            // 持续道具状态
            magnetTimer: 0,
            doubleScoreTimer: 0,
            parachuteTimer: 0,
            shrinkTimer: 0,
            slowMoTimer: 0,
            // 状态计时
            stickyTimer: 0,
            invincibleTimer: 0,
            score: 0,
            maxHeight: 0,
            alive: true
        };
        return player;
    }

    function get() {
        return player;
    }

    function reset(x, y) {
        create(x, y);
    }

    function update(dt, canvasWidth) {
        if (!player || !player.alive) return;

        // 保存上一帧位置（用于碰撞检测）
        player.prevX = player.x;
        player.prevY = player.y;

        // ─── 持续道具计时器 ───
        if (player.magnetTimer > 0) player.magnetTimer -= dt;
        if (player.doubleScoreTimer > 0) player.doubleScoreTimer -= dt;
        if (player.parachuteTimer > 0) player.parachuteTimer -= dt;
        if (player.slowMoTimer > 0) player.slowMoTimer -= dt;
        if (player.invincibleTimer > 0) player.invincibleTimer -= dt;
        if (player.shrinkTimer > 0) {
            player.shrinkTimer -= dt;
            if (player.shrinkTimer <= 0) {
                // 恢复大小，保持脚底位置
                player.y -= (PLAYER_HEIGHT - player.height);
                player.width = PLAYER_WIDTH;
                player.height = PLAYER_HEIGHT;
            }
        }

        // 粘住状态：完全不能移动
        if (player.stickyTimer > 0) {
            player.stickyTimer -= dt;
            player.vx = 0;
            player.vy = 0;
            if (player.stickyTimer <= 0) {
                jump('normal');
            }
            return;
        }

        // ─── 水平移动 ───
        if (Input.isDown('left')) {
            player.vx = -MOVE_SPEED;
            player.facingRight = false;
        } else if (Input.isDown('right')) {
            player.vx = MOVE_SPEED;
            player.facingRight = true;
        } else if (Input.isMouseDown()) {
            const mouseX = Input.getMouseX();
            const playerCenterX = player.x + player.width / 2;
            if (mouseX < playerCenterX) {
                player.vx = -MOVE_SPEED;
                player.facingRight = false;
            } else {
                player.vx = MOVE_SPEED;
                player.facingRight = true;
            }
        } else {
            player.vx = 0;
        }

        player.x += player.vx * dt;

        // ─── 穿墙效果 ───
        if (player.x + player.width < 0) {
            player.x = canvasWidth;
        } else if (player.x > canvasWidth) {
            player.x = -player.width;
        }

        // ─── 垂直运动 ───
        if (player.isShiping) {
            // 飞船模式：无视重力，直线上升，无敌
            player.vy = SHIP_SPEED;
            player.shipTimer -= dt;
            if (player.shipTimer <= 0) {
                player.isShiping = false;
                player.vy = BASE_JUMP_VELOCITY * 0.8;
            }
        } else if (player.isRocketing) {
            // 火箭模式：无视重力，直线上升
            player.vy = ROCKET_SPEED;
            player.rocketTimer -= dt;
            if (player.rocketTimer <= 0) {
                player.isRocketing = false;
                player.vy = BASE_JUMP_VELOCITY * 0.8;
            }
        } else {
            // 正常重力
            const maxFall = player.parachuteTimer > 0 ? PARACHUTE_FALL_SPEED : MAX_FALL_SPEED;
            player.vy += GRAVITY * dt;
            player.vy = Math.min(player.vy, maxFall);
        }

        player.y += player.vy * dt;

        // ─── 更新最高高度和分数 ───
        // 以底部为基准（涂鸦跳跃：越高分数越高）
        const currentBottom = player.y + player.height;
        if (currentBottom < player.maxHeight || player.maxHeight === 0) {
            player.maxHeight = currentBottom;
        }
        // 分数 = 上升的高度（向下为负，所以取负值）
        const baseScore = Math.floor(Math.max(0, -player.maxHeight));
        player.score = player.doubleScoreTimer > 0 ? baseScore * 2 : baseScore;
    }

    // ─── 跳跃 ───
    function jump(type = 'normal') {
        if (!player) return;
        if (type === 'bouncy') {
            player.vy = BOUNCY_JUMP_VELOCITY;
            AudioManager.springJump();
            Particles.emitSpring(player.x + player.width / 2, player.y + player.height);
        } else if (type === 'spring') {
            player.vy = SPRING_JUMP_VELOCITY;
            AudioManager.springJump();
            Particles.emitSpring(player.x + player.width / 2, player.y + player.height);
        } else if (type === 'super_spring') {
            player.vy = SUPER_SPRING_JUMP_VELOCITY;
            AudioManager.springJump();
            Particles.emitSpring(player.x + player.width / 2, player.y + player.height);
        } else {
            player.vy = BASE_JUMP_VELOCITY;
            AudioManager.jump();
            Particles.emitJump(player.x + player.width / 2, player.y + player.height);
        }
    }

    // ─── 激活火箭 ───
    function activateRocket() {
        if (!player) return;
        player.isRocketing = true;
        player.rocketTimer = ROCKET_DURATION;
        AudioManager.rocket();
    }

    // ─── 激活飞船 ───
    function activateShip() {
        if (!player) return;
        player.isShiping = true;
        player.shipTimer = SHIP_DURATION;
        AudioManager.rocket();
        Particles.emitShip(player.x + player.width / 2, player.y + player.height);
    }

    // ─── 激活护盾 ───
    function activateShield() {
        if (!player) return;
        player.hasShield = true;
    }

    // ─── 激活磁铁 ───
    function activateMagnet() {
        if (!player) return;
        player.magnetTimer = MAGNET_DURATION;
        AudioManager.collectItem();
    }

    // ─── 激活双倍分数 ───
    function activateDoubleScore() {
        if (!player) return;
        player.doubleScoreTimer = DOUBLE_SCORE_DURATION;
        AudioManager.collectItem();
    }

    // ─── 激活降落伞 ───
    function activateParachute() {
        if (!player) return;
        player.parachuteTimer = PARACHUTE_DURATION;
        AudioManager.collectItem();
    }

    // ─── 激活缩小 ───
    function activateShrink() {
        if (!player) return;
        player.shrinkTimer = SHRINK_DURATION;
        player.width = PLAYER_WIDTH * 0.5;
        player.height = PLAYER_HEIGHT * 0.5;
        player.y += (PLAYER_HEIGHT - player.height); // 保持脚底位置
        AudioManager.collectItem();
        Particles.emitShrink(player.x + player.width / 2, player.y + player.height / 2);
    }

    // ─── 激活时间缓速 ───
    function activateSlowMo() {
        if (!player) return;
        player.slowMoTimer = SLOW_MO_DURATION;
        AudioManager.collectItem();
        Particles.emitSlowMo(player.x + player.width / 2, player.y + player.height / 2);
    }

    // ─── 传送 ───
    function teleport(canvasWidth) {
        if (!player) return;
        player.x = Utils.randomInt(20, canvasWidth - player.width - 20);
        Particles.emitTeleport(player.x + player.width / 2, player.y + player.height / 2);
        AudioManager.collectItem();
    }

    // ─── 获取磁铁吸附范围（供外部使用） ───
    function getMagnetRange() {
        return MAGNET_RANGE;
    }

    // ─── 受伤 ───
    function takeDamage() {
        if (!player) return;
        if (player.isShiping) {
            return false;
        }
        if (player.invincibleTimer > 0) {
            return false;
        }
        if (player.hasShield) {
            player.hasShield = false;
            player.invincibleTimer = 1.0;
            AudioManager.collectItem();
            return false;
        }
        player.alive = false;
        AudioManager.gameOver();
        return true;
    }

    // ─── 收集分数道具 ───
    function addScore(bonus) {
        if (!player) return;
        player.score += bonus;
        AudioManager.collectItem();
        Particles.emitCollect(player.x + player.width / 2, player.y);
    }

    // ─── 绘制 ───
    function draw(ctx, camera) {
        if (!player) return;

        const screenY = player.y - camera.y;
        if (screenY < -100 || screenY > camera.screenHeight + 100) return;

        Utils.drawDoodlePlayer(ctx, player.x, screenY, player.width, player.height, player.facingRight);

        // 绘制护盾效果
        if (player.hasShield) {
            ctx.save();
            ctx.strokeStyle = '#00E5FF';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, screenY + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 无敌闪烁效果
        if (player.invincibleTimer > 0 && !player.hasShield) {
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(player.invincibleTimer * 20) * 0.3;
            ctx.fillStyle = '#00E5FF';
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, screenY + player.height / 2, player.width * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 绘制火箭尾焰
        if (player.isRocketing) {
            const flameCount = 4;
            for (let i = 0; i < flameCount; i++) {
                const fx = player.x + player.width / 2 + Utils.random(-5, 5);
                const fy = screenY + player.height + Utils.random(5, 20);
                const fsize = Utils.random(3, 8);
                ctx.fillStyle = Utils.randomInt(0, 1) ? '#FF5722' : '#FFEB3B';
                ctx.fillRect(fx - fsize / 2, fy - fsize / 2, fsize, fsize);
            }
        }

        // 绘制飞船状态
        if (player.isShiping) {
            // 飞船外壳
            ctx.save();
            ctx.fillStyle = '#607D8B';
            ctx.beginPath();
            ctx.ellipse(player.x + player.width / 2, screenY + player.height / 2 - 5, player.width * 0.7, player.height * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // 飞船翅膀
            ctx.fillStyle = '#90A4AE';
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2 - 10, screenY + player.height / 2 + 5);
            ctx.lineTo(player.x + player.width / 2 - 18, screenY + player.height / 2 + 15);
            ctx.lineTo(player.x + player.width / 2 - 5, screenY + player.height / 2 + 10);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2 + 10, screenY + player.height / 2 + 5);
            ctx.lineTo(player.x + player.width / 2 + 18, screenY + player.height / 2 + 15);
            ctx.lineTo(player.x + player.width / 2 + 5, screenY + player.height / 2 + 10);
            ctx.closePath();
            ctx.fill();
            // 驾驶舱
            ctx.fillStyle = '#81D4FA';
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, screenY + player.height / 2 - 8, 4, 0, Math.PI * 2);
            ctx.fill();
            // 飞船尾焰
            const flameCount = 5;
            for (let i = 0; i < flameCount; i++) {
                const fx = player.x + player.width / 2 + Utils.random(-6, 6);
                const fy = screenY + player.height + Utils.random(5, 25);
                const fsize = Utils.random(3, 9);
                ctx.fillStyle = Utils.randomInt(0, 1) ? '#FF5722' : '#FFEB3B';
                ctx.fillRect(fx - fsize / 2, fy - fsize / 2, fsize, fsize);
            }
            ctx.restore();
        }
    }

    return {
        create,
        get,
        reset,
        update,
        jump,
        activateRocket,
        activateShip,
        activateShield,
        activateMagnet,
        activateDoubleScore,
        activateParachute,
        activateShrink,
        activateSlowMo,
        teleport,
        takeDamage,
        addScore,
        getMagnetRange,
        draw,
        PLAYER_WIDTH,
        PLAYER_HEIGHT
    };
})();
