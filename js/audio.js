/**
 * audio.js - 音频引擎模块
 * 使用 Web Audio API 动态合成所有音效，零外部音频文件
 */

const AudioManager = (function () {
    let ctx = null;
    let initialized = false;

    // 初始化音频上下文（必须在用户交互后调用）
    function init() {
        if (initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            ctx = new AudioContext();
            initialized = true;
        } catch (e) {
            console.warn('Web Audio API 不支持，游戏将静音运行');
        }
    }

    function ensureInit() {
        if (!initialized) init();
    }

    // ─── 基础合成器 ───
    function playTone({ type = 'square', startFreq = 200, endFreq = 400, duration = 0.1, volume = 0.1 }) {
        ensureInit();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        if (endFreq !== startFreq) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    // 播放白噪声（用于碎裂等效果）
    function playNoise({ duration = 0.1, volume = 0.1 }) {
        ensureInit();
        if (!ctx) return;

        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(ctx.currentTime);
    }

    // ─── 具体音效 ───
    function jump() {
        playTone({ type: 'square', startFreq: 150, endFreq: 300, duration: 0.1, volume: 0.08 });
    }

    function springJump() {
        playTone({ type: 'sine', startFreq: 200, endFreq: 600, duration: 0.15, volume: 0.1 });
    }

    function score() {
        playTone({ type: 'triangle', startFreq: 800, endFreq: 1200, duration: 0.05, volume: 0.06 });
    }

    function breakPlatform() {
        playNoise({ duration: 0.1, volume: 0.1 });
    }

    function collectItem() {
        playTone({ type: 'sine', startFreq: 523, endFreq: 784, duration: 0.15, volume: 0.08 });
        setTimeout(() => {
            playTone({ type: 'triangle', startFreq: 784, endFreq: 1047, duration: 0.15, volume: 0.06 });
        }, 80);
    }

    function gameOver() {
        playTone({ type: 'sawtooth', startFreq: 400, endFreq: 100, duration: 0.5, volume: 0.1 });
    }

    function rocket() {
        playTone({ type: 'sawtooth', startFreq: 150, endFreq: 400, duration: 0.3, volume: 0.08 });
    }

    return {
        init,
        jump,
        springJump,
        score,
        breakPlatform,
        collectItem,
        gameOver,
        rocket
    };
})();
