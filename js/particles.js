/**
 * particles.js - 粒子系统模块
 * 处理碎裂、收集、跳跃等视觉特效
 */

const Particles = (function () {
    let particles = [];

    class Particle {
        constructor(x, y, color, size, vx, vy, life) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = size;
            this.vx = vx;
            this.vy = vy;
            this.life = life;
            this.maxLife = life;
            this.gravity = 300; // 粒子受轻微重力
        }

        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += this.gravity * dt;
            this.life -= dt;
            this.size = Math.max(0, this.size * (this.life / this.maxLife));
        }

        isDead() {
            return this.life <= 0;
        }

        draw(ctx, camera) {
            const screenY = this.y - camera.y;
            if (screenY < -50 || screenY > camera.screenHeight + 50) return;

            ctx.save();
            ctx.globalAlpha = this.life / this.maxLife;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.size / 2, screenY - this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    // ─── 发射器 ───
    function emitBreak(x, y, width, color = '#795548') {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = Utils.random(80, 200);
            particles.push(new Particle(
                x + Utils.random(0, width),
                y,
                color,
                Utils.random(3, 6),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 100,
                Utils.random(0.15, 0.3)
            ));
        }
    }

    function emitCollect(x, y, color = '#FFD700') {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(50, 150);
            particles.push(new Particle(
                x, y,
                color,
                Utils.random(2, 5),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 50,
                Utils.random(0.4, 0.8)
            ));
        }
    }

    function emitJump(x, y) {
        const count = 5;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(
                x + Utils.random(-10, 10),
                y,
                '#FFFFFF',
                Utils.random(2, 4),
                Utils.random(-30, 30),
                Utils.random(50, 100),
                Utils.random(0.2, 0.4)
            ));
        }
    }

    function emitSpring(x, y) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(
                x + Utils.random(-5, 5),
                y,
                '#FFEB3B',
                Utils.random(3, 6),
                Utils.random(-50, 50),
                Utils.random(100, 250),
                Utils.random(0.3, 0.5)
            ));
        }
    }

    function emitBomb(x, y) {
        const count = 20;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = Utils.random(100, 300);
            particles.push(new Particle(
                x, y,
                '#FF5722',
                Utils.random(4, 8),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Utils.random(0.2, 0.4)
            ));
        }
        for (let i = 0; i < 8; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(50, 150);
            particles.push(new Particle(
                x, y,
                '#FFFFFF',
                Utils.random(2, 5),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Utils.random(0.15, 0.3)
            ));
        }
    }

    function emitTeleport(x, y) {
        const count = 15;
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(50, 200);
            particles.push(new Particle(
                x, y,
                '#00BCD4',
                Utils.random(2, 5),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Utils.random(0.3, 0.6)
            ));
        }
    }

    function emitShrink(x, y) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(30, 100);
            particles.push(new Particle(
                x, y,
                '#9C27B0',
                Utils.random(2, 4),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Utils.random(0.3, 0.5)
            ));
        }
    }

    function emitSlowMo(x, y) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(30, 80);
            particles.push(new Particle(
                x, y,
                '#00BCD4',
                Utils.random(2, 4),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Utils.random(0.3, 0.5)
            ));
        }
    }

    function emitShip(x, y) {
        const count = 15;
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(50, 150);
            particles.push(new Particle(
                x, y,
                '#607D8B',
                Utils.random(3, 6),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Utils.random(0.4, 0.8)
            ));
        }
        for (let i = 0; i < 6; i++) {
            particles.push(new Particle(
                x + Utils.random(-5, 5),
                y,
                '#FF9800',
                Utils.random(3, 6),
                Utils.random(-30, 30),
                Utils.random(100, 250),
                Utils.random(0.3, 0.5)
            ));
        }
    }

    function update(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update(dt);
            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }
    }

    function draw(ctx, camera) {
        for (const p of particles) {
            p.draw(ctx, camera);
        }
    }

    function clear() {
        particles = [];
    }

    return {
        emitBreak,
        emitCollect,
        emitJump,
        emitSpring,
        emitBomb,
        emitTeleport,
        emitShrink,
        emitSlowMo,
        emitShip,
        update,
        draw,
        clear
    };
})();
