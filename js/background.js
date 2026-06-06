/**
 * background.js - 背景系统模块
 * 手绘笔记本网格纸效果 + 视差滚动云层
 */

const Background = (function () {
    const GRID_SPACING = 30;
    let clouds = [];

    function init() {
        clouds = [];
        for (let i = 0; i < 15; i++) {
            clouds.push({
                x: Utils.random(0, 400),
                y: Utils.random(-2000, 600),
                size: Utils.random(30, 60),
                speed: Utils.random(5, 15),
                layer: Utils.randomInt(1, 3) // 1=远 2=中 3=近
            });
        }
    }

    // ─── 绘制手绘网格纸背景 ───
    function drawGrid(ctx, camera) {
        ctx.save();
        ctx.strokeStyle = '#E8E8E8';
        ctx.lineWidth = 1;

        const startY = Math.floor(camera.y / GRID_SPACING) * GRID_SPACING - GRID_SPACING;
        const endY = camera.y + camera.screenHeight + GRID_SPACING;
        const width = camera.screenWidth;

        // 横线（手绘抖动）
        for (let y = startY; y < endY; y += GRID_SPACING) {
            const screenY = y - camera.y;
            Utils.drawDoodleLine(ctx, 0, screenY, width, screenY, '#E8E8E8', 1, 1);
        }

        // 竖线
        for (let x = 0; x < width; x += GRID_SPACING) {
            Utils.drawDoodleLine(ctx, x, 0, x, camera.screenHeight, '#E8E8E8', 1, 1);
        }

        ctx.restore();
    }

    // ─── 绘制简笔云 ───
    function drawCloud(ctx, cx, cy, size) {
        ctx.save();
        ctx.strokeStyle = '#BBDEFB';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#E3F2FD';

        // 手绘云朵：几个圆拼在一起
        const circles = [
            { dx: 0, dy: 0, r: size * 0.5 },
            { dx: -size * 0.3, dy: size * 0.1, r: size * 0.35 },
            { dx: size * 0.3, dy: size * 0.1, r: size * 0.35 },
            { dx: -size * 0.1, dy: -size * 0.2, r: size * 0.4 }
        ];

        // 填充
        ctx.beginPath();
        for (const c of circles) {
            ctx.arc(cx + c.dx, cy + c.dy, c.r, 0, Math.PI * 2);
        }
        ctx.fill();

        // 手绘边框（每个圆单独描边带抖动）
        for (const c of circles) {
            Utils.drawDoodleCircle(ctx, cx + c.dx, cy + c.dy, c.r, '#90CAF9', 1.5, 2);
        }

        ctx.restore();
    }

    // ─── 更新云层 ───
    function update(dt, camera) {
        for (const cloud of clouds) {
            const parallaxFactor = cloud.layer * 0.2;
            cloud.x += cloud.speed * dt;

            // 水平循环
            if (cloud.x - cloud.size > camera.screenWidth) {
                cloud.x = -cloud.size;
                cloud.y = camera.y + Utils.random(-100, camera.screenHeight + 100);
            }
        }
    }

    // ─── 绘制背景 ───
    function draw(ctx, camera) {
        // 1. 底色（笔记本纸张色）
        ctx.fillStyle = '#FDFBF7';
        ctx.fillRect(0, 0, camera.screenWidth, camera.screenHeight);

        // 2. 网格纸
        drawGrid(ctx, camera);

        // 3. 云层（视差效果）
        for (const cloud of clouds) {
            const parallaxY = cloud.y - camera.y * (cloud.layer * 0.15);
            if (parallaxY > -100 && parallaxY < camera.screenHeight + 100) {
                drawCloud(ctx, cloud.x, parallaxY, cloud.size);
            }
        }
    }

    return {
        init,
        update,
        draw
    };
})();
