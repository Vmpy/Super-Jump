/**
 * wind.js - 风力系统模块
 * 随机阵风，频率/强度/持续时间随高度递增
 */

const Wind = (function () {
    const WIND_START_HEIGHT = 3000;
    const WIND_MAX_STRENGTH = 120;

    const GUST_DURATION_MIN = 1.5;
    const GUST_DURATION_MAX = 3.0;
    const CALM_DURATION_MIN = 3.0;
    const CALM_DURATION_MAX = 6.0;

    const State = {
        IDLE: 'idle',
        GUSTING: 'gusting'
    };

    let wind = {
        state: State.IDLE,
        direction: 0,
        strength: 0,
        targetStrength: 0,
        timer: 0,
        phaseDuration: 0
    };

    function init() {
        reset();
    }

    function reset() {
        wind.state = State.IDLE;
        wind.direction = 0;
        wind.strength = 0;
        wind.targetStrength = 0;
        wind.timer = 0;
        wind.phaseDuration = randomRange(CALM_DURATION_MIN, CALM_DURATION_MAX);
    }

    function update(dt, playerHeight) {
        const heightAboveThreshold = Math.max(0, -playerHeight - WIND_START_HEIGHT);
        const heightFactor = Math.min(1, heightAboveThreshold / 8000);

        if (heightFactor <= 0) {
            wind.state = State.IDLE;
            wind.strength = 0;
            wind.targetStrength = 0;
            return;
        }

        wind.timer += dt;

        if (wind.state === State.IDLE) {
            const calmMin = lerp(CALM_DURATION_MIN, 1.5, heightFactor);
            const calmMax = lerp(CALM_DURATION_MAX, 3.0, heightFactor);
            const calmDuration = lerp(calmMin, calmMax, Math.random());

            if (wind.timer >= wind.phaseDuration) {
                wind.state = State.GUSTING;
                wind.direction = Math.random() < 0.5 ? -1 : 1;
                wind.targetStrength = WIND_MAX_STRENGTH * lerp(0.2, 1.0, heightFactor) * randomRange(0.5, 1.0);
                const gustDuration = lerp(GUST_DURATION_MIN, GUST_DURATION_MAX * 1.5, heightFactor);
                wind.phaseDuration = gustDuration;
                wind.timer = 0;
            }
        } else if (wind.state === State.GUSTING) {
            if (wind.timer >= wind.phaseDuration) {
                wind.state = State.IDLE;
                wind.targetStrength = 0;
                const calmMin = lerp(CALM_DURATION_MIN, 1.5, heightFactor);
                const calmMax = lerp(CALM_DURATION_MAX, 3.0, heightFactor);
                wind.phaseDuration = randomRange(calmMin, calmMax);
                wind.timer = 0;
            }
        }

        const lerpSpeed = wind.state === State.GUSTING ? 0.08 : 0.05;
        wind.strength += (wind.targetStrength - wind.strength) * lerpSpeed;
        if (wind.strength < 0.5) wind.strength = 0;
    }

    function getForce() {
        if (wind.state !== State.GUSTING || wind.strength < 0.5) return 0;
        return wind.direction * wind.strength;
    }

    function isActive() {
        return wind.state === State.GUSTING && wind.strength > 0.5;
    }

    function getDirection() {
        return wind.direction;
    }

    function getStrength() {
        return wind.strength;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    return {
        init,
        reset,
        update,
        getForce,
        isActive,
        getDirection,
        getStrength
    };
})();
