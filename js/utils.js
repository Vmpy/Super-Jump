/**
 * utils.js - 工具函数模块
 * 包含：随机数、AABB碰撞检测、手绘线条/形状绘制、坐标转换
 */

const Utils = (function () {
    // ─── 随机数工具 ───
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomInt(min, max) {
        return Math.floor(random(min, max + 1));
    }

    // 加权随机选择
    function weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let randomVal = Math.random() * totalWeight;
        for (const item of items) {
            randomVal -= item.weight;
            if (randomVal <= 0) return item;
        }
        return items[items.length - 1];
    }

    // ─── AABB 碰撞检测 ───
    function checkAABB(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    // 玩家底部与平台顶部的碰撞（仅下落时触发）
    function checkPlatformCollision(player, platform) {
        const playerBottom = player.y + player.height;
        const platformTop = platform.y;

        // 使用 AABB 碰撞检测 + 下落状态 + 底部接近平台顶部
        // 防止高速下落时一帧穿过平台
        if (
            player.vy >= 0 &&                          // 玩家正在下落或静止
            playerBottom >= platformTop &&              // 玩家底部进入平台
            playerBottom <= platformTop + platform.height + 15 && // 玩家底部在平台附近（容忍范围）
            player.x + player.width > platform.x &&   // 水平范围重叠
            player.x < platform.x + platform.width
        ) {
            return true;
        }
        return false;
    }

    // ─── 手绘线条绘制（带抖动） ───
    function drawDoodleLine(ctx, x1, y1, x2, y2, color = '#000', width = 2, jitter = 3) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const dist = Math.hypot(x2 - x1, y2 - y1);
        const segments = Math.max(4, Math.floor(dist / 10));
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for (let i = 1; i < segments; i++) {
            const jx = (Math.random() - 0.5) * jitter;
            const jy = (Math.random() - 0.5) * jitter;
            ctx.lineTo(x1 + dx * i + jx, y1 + dy * i + jy);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    // 手绘圆形边框
    function drawDoodleCircle(ctx, cx, cy, radius, color = '#000', width = 2, jitter = 3) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';

        const segments = 16;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * jitter;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    // 手绘矩形边框
    function drawDoodleRect(ctx, x, y, w, h, fillColor, strokeColor = '#000', strokeWidth = 2, jitter = 3) {
        // 填充
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, w, h);
        }
        // 四条手绘边框
        drawDoodleLine(ctx, x, y, x + w, y, strokeColor, strokeWidth, jitter);
        drawDoodleLine(ctx, x + w, y, x + w, y + h, strokeColor, strokeWidth, jitter);
        drawDoodleLine(ctx, x + w, y + h, x, y + h, strokeColor, strokeWidth, jitter);
        drawDoodleLine(ctx, x, y + h, x, y, strokeColor, strokeWidth, jitter);
    }

    // 手绘圆角矩形
    function drawDoodleRoundRect(ctx, x, y, w, h, radius, fillColor, strokeColor = '#000', strokeWidth = 2, jitter = 3) {
        ctx.save();
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }
        // 手绘边框简化为矩形
        drawDoodleRect(ctx, x, y, w, h, null, strokeColor, strokeWidth, jitter);
        ctx.restore();
    }

    // 绘制小方块机器人（方案 B）
    function drawDoodlePlayer(ctx, x, y, w, h, facingRight = true) {
        const cx = x + w / 2;
        const cy = y;

        // 天线
        drawDoodleLine(ctx, cx, cy + 2, cx, cy - 6, '#666', 1.5, 2);
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.arc(cx, cy - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        drawDoodleCircle(ctx, cx, cy - 8, 3, '#B71C1C', 1.5, 2);

        // 头（方块圆角）
        drawDoodleRect(ctx, cx - 10, cy + 2, 20, 14, '#ECEFF1', '#455A64', 2, 2);

        // 大眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - 3, cy + 9, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 3, cy + 9, 4, 0, Math.PI * 2);
        ctx.fill();

        const pupilOffset = facingRight ? 1 : -1;
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.arc(cx - 3 + pupilOffset, cy + 9, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 3 + pupilOffset, cy + 9, 2, 0, Math.PI * 2);
        ctx.fill();

        // 身体
        drawDoodleRect(ctx, cx - 9, cy + 18, 18, 16, '#78909C', '#455A64', 2, 2);

        // 胸口灯
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(cx, cy + 26, 3, 0, Math.PI * 2);
        ctx.fill();
        drawDoodleCircle(ctx, cx, cy + 26, 3, '#F9A825', 1.5, 2);

        // 手臂
        drawDoodleLine(ctx, cx - 9, cy + 22, cx - 14, cy + 28, '#455A64', 1.5, 2);
        drawDoodleLine(ctx, cx + 9, cy + 22, cx + 14, cy + 28, '#455A64', 1.5, 2);

        // 腿
        drawDoodleLine(ctx, cx - 5, cy + 34, cx - 5, cy + 42, '#455A64', 1.5, 2);
        drawDoodleLine(ctx, cx + 5, cy + 34, cx + 5, cy + 42, '#455A64', 1.5, 2);
    }

    // ─── 坐标转换 ───
    function worldToScreen(worldX, worldY, camera) {
        return {
            x: worldX,
            y: worldY - camera.y
        };
    }

    function screenToWorld(screenX, screenY, camera) {
        return {
            x: screenX,
            y: screenY + camera.y
        };
    }

    // ─── 插值 ───
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // ─── 限制 ───
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    return {
        random,
        randomInt,
        weightedRandom,
        checkAABB,
        checkPlatformCollision,
        drawDoodleLine,
        drawDoodleCircle,
        drawDoodleRect,
        drawDoodleRoundRect,
        drawDoodlePlayer,
        worldToScreen,
        screenToWorld,
        lerp,
        clamp
    };
})();
