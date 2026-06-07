/**
 * items.js - 道具系统模块
 * 弹簧、火箭、护盾、分数道具
 */

const Items = (function () {
    let items = [];

    const ITEM_SIZE = 20;
    const BONUS_SCORE = 50;

    class Item {
        constructor(x, y, type, platform = null) {
            this.x = x;
            this.y = y;
            this.width = ITEM_SIZE;
            this.height = ITEM_SIZE;
            this.type = type; // 'spring', 'rocket', 'shield', 'coin'
            this.alive = true;
            this.bobOffset = 0;
            this.bobSpeed = 3;
            // 绑定平台（移动平台上的道具需要跟随）
            this.platform = platform;
        }

        update(dt) {
            this.bobOffset += this.bobSpeed * dt;
            if (this.platform && this.platform.alive) {
                this.x = this.platform.x + this.platform.width / 2 - this.width / 2;
                this.y = this.platform.y - this.height - 5;
            }
        }

        draw(ctx, camera) {
            if (!this.alive) return;
            const screenY = this.y - camera.y + Math.sin(this.bobOffset) * 3;
            if (screenY < -50 || screenY > camera.screenHeight + 50) return;

            const cx = this.x + this.width / 2;
            const cy = screenY + this.height / 2;

            switch (this.type) {
                case 'spring':
                    drawSpring(ctx, cx, cy);
                    break;
                case 'rocket':
                    drawRocket(ctx, cx, cy);
                    break;
                case 'shield':
                    drawShield(ctx, cx, cy);
                    break;
                case 'coin':
                    drawCoin(ctx, cx, cy);
                    break;
                case 'magnet':
                    drawMagnet(ctx, cx, cy);
                    break;
                case 'double_score':
                    drawDoubleScore(ctx, cx, cy);
                    break;
                case 'parachute':
                    drawParachute(ctx, cx, cy);
                    break;
                case 'super_spring':
                    drawSuperSpring(ctx, cx, cy);
                    break;
                case 'shrink':
                    drawShrink(ctx, cx, cy);
                    break;
                case 'slow_mo':
                    drawSlowMo(ctx, cx, cy);
                    break;
                case 'bomb':
                    drawBomb(ctx, cx, cy);
                    break;
                case 'ship':
                    drawShip(ctx, cx, cy);
                    break;
            }
        }
    }

    // ─── 绘制各道具 ───
    function drawSpring(ctx, cx, cy) {
        ctx.save();
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const coils = 3;
        const coilH = 16;
        for (let i = 0; i <= coils * 4; i++) {
            const t = i / (coils * 4);
            const x = cx + Math.sin(t * Math.PI * coils * 2) * 5;
            const y = cy - coilH / 2 + t * coilH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    function drawRocket(ctx, cx, cy) {
        ctx.save();
        // 火箭身体
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx - 6, cy + 8);
        ctx.lineTo(cx + 6, cy + 8);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx, cy - 10, cx - 6, cy + 8, '#B71C1C', 2, 2);
        Utils.drawDoodleLine(ctx, cx - 6, cy + 8, cx + 6, cy + 8, '#B71C1C', 2, 2);
        Utils.drawDoodleLine(ctx, cx + 6, cy + 8, cx, cy - 10, '#B71C1C', 2, 2);

        // 窗口
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // 尾焰
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 8);
        ctx.lineTo(cx, cy + 14);
        ctx.lineTo(cx + 4, cy + 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawShield(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy, 10, '#00E5FF', 2, 2);

        // 盾牌图案
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx + 5, cy - 3);
        ctx.lineTo(cx + 5, cy + 2);
        ctx.lineTo(cx, cy + 6);
        ctx.lineTo(cx - 5, cy + 2);
        ctx.lineTo(cx - 5, cy - 3);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    function drawCoin(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy, 8, '#F57F17', 2, 2);

        ctx.fillStyle = '#F57F17';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', cx, cy + 1);
        ctx.restore();
    }

    // ─── 磁铁 ───
    function drawMagnet(ctx, cx, cy) {
        ctx.save();
        // 马蹄形
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 2, 5, Math.PI, 0);
        ctx.lineTo(cx + 1, cy + 6);
        ctx.arc(cx + 4, cy - 2, 5, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 9, cy - 2, cx + 9, cy - 2, '#B71C1C', 2, 2);
        Utils.drawDoodleLine(ctx, cx - 9, cy - 2, cx - 9, cy + 4, '#B71C1C', 2, 2);
        Utils.drawDoodleLine(ctx, cx + 9, cy - 2, cx + 9, cy + 4, '#B71C1C', 2, 2);
        // 磁力线
        ctx.fillStyle = '#03A9F4';
        ctx.fillRect(cx - 6, cy + 6, 3, 3);
        ctx.fillRect(cx + 3, cy + 6, 3, 3);
        ctx.fillRect(cx - 1, cy + 9, 2, 2);
        ctx.restore();
    }

    // ─── 双倍分数 ───
    function drawDoubleScore(ctx, cx, cy) {
        ctx.save();
        // 星形背景
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        const spikes = 5, outer = 10, inner = 5;
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx, cy - outer, cx + inner, cy - inner, '#F57F17', 1.5, 2);
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) continue;
            const pr = ((i - 1) % 2 === 0) ? outer : inner;
            const pa = ((i - 1) / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const px = cx + Math.cos(pa) * pr;
            const py = cy + Math.sin(pa) * pr;
            Utils.drawDoodleLine(ctx, px, py, x, y, '#F57F17', 1.5, 2);
        }
        // ×2 文字
        ctx.fillStyle = '#E65100';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('×2', cx, cy + 1);
        ctx.restore();
    }

    // ─── 降落伞 ───
    function drawParachute(ctx, cx, cy) {
        ctx.save();
        // 伞面
        ctx.fillStyle = '#4FC3F7';
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 10, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 10, cy - 4, cx + 10, cy - 4, '#0277BD', 2, 2);
        // 伞绳
        Utils.drawDoodleLine(ctx, cx - 8, cy - 4, cx - 3, cy + 6, '#0277BD', 1, 1);
        Utils.drawDoodleLine(ctx, cx + 8, cy - 4, cx + 3, cy + 6, '#0277BD', 1, 1);
        Utils.drawDoodleLine(ctx, cx, cy - 4, cx, cy + 6, '#0277BD', 1, 1);
        // 小背包
        ctx.fillStyle = '#0288D1';
        ctx.fillRect(cx - 3, cy + 4, 6, 5);
        Utils.drawDoodleLine(ctx, cx - 3, cy + 4, cx + 3, cy + 4, '#01579B', 1, 1);
        Utils.drawDoodleLine(ctx, cx + 3, cy + 4, cx + 3, cy + 9, '#01579B', 1, 1);
        Utils.drawDoodleLine(ctx, cx + 3, cy + 9, cx - 3, cy + 9, '#01579B', 1, 1);
        Utils.drawDoodleLine(ctx, cx - 3, cy + 9, cx - 3, cy + 4, '#01579B', 1, 1);
        ctx.restore();
    }

    // ─── 超级弹簧 ───
    function drawSuperSpring(ctx, cx, cy) {
        ctx.save();
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const coils = 4;
        const coilH = 18;
        for (let i = 0; i <= coils * 4; i++) {
            const t = i / (coils * 4);
            const x = cx + Math.sin(t * Math.PI * coils * 2) * 6;
            const y = cy - coilH / 2 + t * coilH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    // ─── 缩小道具 ───
    function drawShrink(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#9C27B0';
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy, 9, '#7B1FA2', 2, 2);
        // 向内箭头
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 4);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + 4, cy - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 4);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + 4, cy + 4);
        ctx.stroke();
        ctx.restore();
    }

    // ─── 时间缓速道具 ───
    function drawSlowMo(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#00BCD4';
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy, 9, '#00838F', 2, 2);
        // 时钟指针
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + 3, cy + 2);
        ctx.stroke();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('0.5x', cx, cy + 6);
        ctx.restore();
    }

    // ─── 炸弹道具 ───
    function drawBomb(ctx, cx, cy) {
        ctx.save();
        // 炸弹主体
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(cx, cy + 1, 8, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy + 1, 8, '#424242', 2, 2);
        // 引线
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 7);
        ctx.lineTo(cx + 3, cy - 12);
        ctx.stroke();
        // 火花
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(cx + 3, cy - 12, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // ─── 宇宙飞船道具 ───
    function drawShip(ctx, cx, cy) {
        ctx.save();
        // 飞船主体
        ctx.fillStyle = '#607D8B';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy, 9, '#455A64', 1.5, 2);
        // 翅膀
        ctx.fillStyle = '#90A4AE';
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + 3);
        ctx.lineTo(cx - 14, cy + 10);
        ctx.lineTo(cx - 4, cy + 8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy + 3);
        ctx.lineTo(cx + 14, cy + 10);
        ctx.lineTo(cx + 4, cy + 8);
        ctx.closePath();
        ctx.fill();
        // 驾驶舱
        ctx.fillStyle = '#81D4FA';
        ctx.beginPath();
        ctx.arc(cx, cy - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        // 尾焰
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy + 6);
        ctx.lineTo(cx, cy + 12);
        ctx.lineTo(cx + 3, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // ─── 生成道具 ───
    function spawn(platforms) {
        items = [];
        for (const p of platforms) {
            // 每个平台有概率生成道具
            const roll = Math.random();
            if (roll < 0.15) {
                const typeRoll = Math.random();
                let type;
                if (typeRoll < 0.20) type = 'spring';
                else if (typeRoll < 0.35) type = 'coin';
                else if (typeRoll < 0.44) type = 'shield';
                else if (typeRoll < 0.52) type = 'magnet';
                else if (typeRoll < 0.58) type = 'double_score';
                else if (typeRoll < 0.64) type = 'parachute';
                else if (typeRoll < 0.70) type = 'super_spring';
                else if (typeRoll < 0.76) type = 'shrink';
                else if (typeRoll < 0.82) type = 'slow_mo';
                else if (typeRoll < 0.88) type = 'bomb';
                else if (typeRoll < 0.94) type = 'ship';
                else type = 'rocket';

                items.push(new Item(
                    p.x + p.width / 2 - ITEM_SIZE / 2,
                    p.y - ITEM_SIZE - 5,
                    type,
                    p
                ));
            }
        }
    }

    // ─── 添加新道具（动态生成时） ───
    function addItem(x, y, type, platform = null) {
        items.push(new Item(x, y, type, platform));
    }

    // ─── 更新 ───
    function update(dt) {
        for (const item of items) {
            item.update(dt);
        }
    }

    // ─── 碰撞检测 ───
    function checkCollisions(player) {
        if (!player || !player.alive) return;

        for (const item of items) {
            if (!item.alive) continue;
            if (Utils.checkAABB(player, item)) {
                item.alive = false;
                switch (item.type) {
                    case 'spring':
                        Player.jump('spring');
                        break;
                    case 'rocket':
                        Player.activateRocket();
                        break;
                    case 'shield':
                        Player.activateShield();
                        Particles.emitCollect(item.x, item.y, '#00E5FF');
                        break;
                    case 'coin':
                        Player.addScore(BONUS_SCORE);
                        break;
                    case 'magnet':
                        Player.activateMagnet();
                        Particles.emitCollect(item.x, item.y, '#F44336');
                        break;
                    case 'double_score':
                        Player.activateDoubleScore();
                        Particles.emitCollect(item.x, item.y, '#FFEB3B');
                        break;
                    case 'parachute':
                        Player.activateParachute();
                        Particles.emitCollect(item.x, item.y, '#4FC3F7');
                        break;
                    case 'super_spring':
                        Player.jump('super_spring');
                        break;
                    case 'shrink':
                        Player.activateShrink();
                        break;
                    case 'slow_mo':
                        Player.activateSlowMo();
                        break;
                    case 'bomb':
                        Obstacles.clearAll();
                        Particles.emitBomb(player.x + player.width / 2, player.y + player.height / 2);
                        AudioManager.rocket();
                        break;
                    case 'ship':
                        Player.activateShip();
                        break;
                }
            }
        }
    }

    // ─── 清理屏幕外的道具 ───
    function cleanup(cameraY, screenHeight) {
        const threshold = cameraY + screenHeight * 2;
        items = items.filter(i => i.y < threshold && i.alive);
    }

    function draw(ctx, camera) {
        for (const item of items) {
            item.draw(ctx, camera);
        }
    }

    function getItems() {
        return items;
    }

    function clear() {
        items = [];
    }

    return {
        spawn,
        addItem,
        update,
        checkCollisions,
        cleanup,
        draw,
        getItems,
        clear
    };
})();
