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
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(cx - 7, cy + 6, 14, 3);
        ctx.fillRect(cx - 7, cy - 9, 14, 3);
        Utils.drawDoodleLine(ctx, cx - 7, cy + 6, cx + 7, cy + 6, '#78909C', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx - 7, cy - 9, cx + 7, cy - 9, '#78909C', 1.5, 2);
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        const coils = 4;
        const coilH = 12;
        const topY = cy - 6;
        ctx.beginPath();
        for (let i = 0; i <= coils * 2; i++) {
            const t = i / (coils * 2);
            const x = cx + (i % 2 === 0 ? -5 : 5);
            const y = topY + t * coilH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    function drawRocket(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#ECEFF1';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12);
        ctx.lineTo(cx + 6, cy + 6);
        ctx.lineTo(cx - 6, cy + 6);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 6, cy + 6, cx, cy - 12, '#B71C1C', 2, 2);
        Utils.drawDoodleLine(ctx, cx, cy - 12, cx + 6, cy + 6, '#B71C1C', 2, 2);
        Utils.drawDoodleLine(ctx, cx - 6, cy + 6, cx + 6, cy + 6, '#B71C1C', 2, 2);
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12);
        ctx.lineTo(cx + 2, cy - 5);
        ctx.lineTo(cx - 2, cy - 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + 2);
        ctx.lineTo(cx - 10, cy + 8);
        ctx.lineTo(cx - 4, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 6, cy + 2);
        ctx.lineTo(cx + 10, cy + 8);
        ctx.lineTo(cx + 4, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#81D4FA';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy - 2, 3, '#0277BD', 1.5, 2);
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 6);
        ctx.lineTo(cx, cy + 14);
        ctx.lineTo(cx + 4, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy + 6);
        ctx.lineTo(cx, cy + 11);
        ctx.lineTo(cx + 2, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawShield(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy, 11, '#00E5FF', 2, 2);
        ctx.fillStyle = '#00BCD4';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx + 7, cy - 4);
        ctx.lineTo(cx + 7, cy + 2);
        ctx.lineTo(cx, cy + 9);
        ctx.lineTo(cx - 7, cy + 2);
        ctx.lineTo(cx - 7, cy - 4);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx, cy - 8, cx + 7, cy - 4, '#006064', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx + 7, cy - 4, cx + 7, cy + 2, '#006064', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx + 7, cy + 2, cx, cy + 9, '#006064', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx, cy + 9, cx - 7, cy + 2, '#006064', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx - 7, cy + 2, cx - 7, cy - 4, '#006064', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx - 7, cy - 4, cx, cy - 8, '#006064', 1.5, 2);
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
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 8, Math.PI, 0);
        ctx.lineTo(cx + 8, cy + 5);
        ctx.lineTo(cx + 4, cy + 5);
        ctx.lineTo(cx + 4, cy - 2);
        ctx.arc(cx, cy - 2, 4, 0, Math.PI, true);
        ctx.lineTo(cx - 4, cy + 5);
        ctx.lineTo(cx - 8, cy + 5);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 8, cy - 2, cx + 8, cy - 2, '#B71C1C', 1.5, 2);
        ctx.fillStyle = '#1565C0';
        ctx.fillRect(cx - 8, cy + 5, 4, 4);
        ctx.fillRect(cx + 4, cy + 5, 4, 4);
        Utils.drawDoodleLine(ctx, cx - 8, cy + 5, cx - 4, cy + 9, '#0D47A1', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx + 4, cy + 5, cx + 8, cy + 9, '#0D47A1', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx - 4, cy - 6, cx - 6, cy - 10, '#90CAF9', 1, 2);
        Utils.drawDoodleLine(ctx, cx, cy - 8, cx, cy - 12, '#90CAF9', 1, 2);
        Utils.drawDoodleLine(ctx, cx + 4, cy - 6, cx + 6, cy - 10, '#90CAF9', 1, 2);
        ctx.restore();
    }

    // ─── 双倍分数 ───
    function drawDoubleScore(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        const spikes = 5, outer = 11, inner = 5;
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
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            const ni = (i + 1) % (spikes * 2);
            const nr = ni % 2 === 0 ? outer : inner;
            const na = (ni / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const nx = cx + Math.cos(na) * nr;
            const ny = cy + Math.sin(na) * nr;
            Utils.drawDoodleLine(ctx, x, y, nx, ny, '#F57F17', 1.5, 2);
        }
        ctx.fillStyle = '#E65100';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('×2', cx, cy + 1);
        ctx.restore();
    }

    // ─── 降落伞 ───
    function drawParachute(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#4FC3F7';
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 10, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 10, cy - 4, cx + 10, cy - 4, '#0277BD', 2, 2);
        Utils.drawDoodleLine(ctx, cx - 8, cy - 4, cx - 3, cy + 6, '#0277BD', 1, 2);
        Utils.drawDoodleLine(ctx, cx + 8, cy - 4, cx + 3, cy + 6, '#0277BD', 1, 2);
        Utils.drawDoodleLine(ctx, cx, cy - 4, cx, cy + 6, '#0277BD', 1, 2);
        ctx.fillStyle = '#0288D1';
        ctx.fillRect(cx - 3, cy + 4, 6, 5);
        Utils.drawDoodleLine(ctx, cx - 3, cy + 4, cx + 3, cy + 4, '#01579B', 1, 2);
        Utils.drawDoodleLine(ctx, cx + 3, cy + 4, cx + 3, cy + 9, '#01579B', 1, 2);
        Utils.drawDoodleLine(ctx, cx + 3, cy + 9, cx - 3, cy + 9, '#01579B', 1, 2);
        Utils.drawDoodleLine(ctx, cx - 3, cy + 9, cx - 3, cy + 4, '#01579B', 1, 2);
        ctx.restore();
    }

    // ─── 超级弹簧 ───
    function drawSuperSpring(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#FFD600';
        ctx.fillRect(cx - 8, cy + 7, 16, 3);
        ctx.fillRect(cx - 8, cy - 10, 16, 3);
        Utils.drawDoodleLine(ctx, cx - 8, cy + 7, cx + 8, cy + 7, '#F9A825', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx - 8, cy - 10, cx + 8, cy - 10, '#F9A825', 1.5, 2);
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        const coils = 5;
        const coilH = 14;
        const topY = cy - 7;
        ctx.beginPath();
        for (let i = 0; i <= coils * 2; i++) {
            const t = i / (coils * 2);
            const x = cx + (i % 2 === 0 ? -6 : 6);
            const y = topY + t * coilH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        Utils.drawDoodleLine(ctx, cx - 3, cy - 13, cx, cy - 16, '#FFEB3B', 2, 2);
        Utils.drawDoodleLine(ctx, cx, cy - 16, cx + 3, cy - 13, '#FFEB3B', 2, 2);
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
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy - 5);
        ctx.lineTo(cx - 2, cy - 2);
        ctx.moveTo(cx - 5, cy - 5);
        ctx.lineTo(cx - 2, cy - 5);
        ctx.moveTo(cx - 5, cy - 5);
        ctx.lineTo(cx - 5, cy - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 5, cy + 5);
        ctx.lineTo(cx + 2, cy + 2);
        ctx.moveTo(cx + 5, cy + 5);
        ctx.lineTo(cx + 2, cy + 5);
        ctx.moveTo(cx + 5, cy + 5);
        ctx.lineTo(cx + 5, cy + 2);
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
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + 3, cy + 2);
        ctx.stroke();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx, cy - 9, cx, cy - 7, '#FFF', 1, 1);
        Utils.drawDoodleLine(ctx, cx + 9, cy, cx + 7, cy, '#FFF', 1, 1);
        Utils.drawDoodleLine(ctx, cx, cy + 9, cx, cy + 7, '#FFF', 1, 1);
        Utils.drawDoodleLine(ctx, cx - 9, cy, cx - 7, cy, '#FFF', 1, 1);
        ctx.restore();
    }

    // ─── 炸弹道具 ───
    function drawBomb(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(cx, cy + 1, 8, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy + 1, 8, '#424242', 2, 2);
        ctx.fillStyle = '#546E7A';
        ctx.fillRect(cx - 2, cy - 8, 4, 3);
        Utils.drawDoodleLine(ctx, cx, cy - 8, cx + 3, cy - 13, '#8D6E63', 2, 2);
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.arc(cx + 3, cy - 13, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(cx + 3, cy - 13, 1.5, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx + 5, cy - 16, cx + 6, cy - 19, '#FFEB3B', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx + 1, cy - 16, cx, cy - 18, '#FFEB3B', 1.5, 2);
        ctx.restore();
    }

    // ─── 宇宙飞船道具 ───
    function drawShip(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#607D8B';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + 9, cy + 4);
        ctx.lineTo(cx - 9, cy + 4);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 9, cy + 4, cx, cy - 10, '#455A64', 2, 2);
        Utils.drawDoodleLine(ctx, cx, cy - 10, cx + 9, cy + 4, '#455A64', 2, 2);
        Utils.drawDoodleLine(ctx, cx - 9, cy + 4, cx + 9, cy + 4, '#455A64', 2, 2);
        ctx.fillStyle = '#90A4AE';
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy + 2);
        ctx.lineTo(cx - 14, cy + 10);
        ctx.lineTo(cx - 4, cy + 7);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx - 7, cy + 2, cx - 14, cy + 10, '#607D8B', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx - 14, cy + 10, cx - 4, cy + 7, '#607D8B', 1.5, 2);
        ctx.beginPath();
        ctx.moveTo(cx + 7, cy + 2);
        ctx.lineTo(cx + 14, cy + 10);
        ctx.lineTo(cx + 4, cy + 7);
        ctx.closePath();
        ctx.fill();
        Utils.drawDoodleLine(ctx, cx + 7, cy + 2, cx + 14, cy + 10, '#607D8B', 1.5, 2);
        Utils.drawDoodleLine(ctx, cx + 14, cy + 10, cx + 4, cy + 7, '#607D8B', 1.5, 2);
        ctx.fillStyle = '#81D4FA';
        ctx.beginPath();
        ctx.arc(cx, cy - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        Utils.drawDoodleCircle(ctx, cx, cy - 3, 3, '#0288D1', 1.5, 2);
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy + 4);
        ctx.lineTo(cx, cy + 12);
        ctx.lineTo(cx + 3, cy + 4);
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
