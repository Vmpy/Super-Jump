/**
 * i18n.js - 国际化模块
 * 支持中文(zh)和英文(en)切换
 */

const I18n = (function () {
    const STORAGE_KEY = 'superjump_language';
    let currentLang = 'zh';

    const translations = {
        zh: {
            gameTitle: 'SuperJump',
            subtitle: '涂鸦跳跃克隆版',
            highScore: '最高分',
            pressSpaceToStart: '按空格键开始',
            pressHForHelp: '按 H 查看帮助',
            pressLForLang: '按 L 切换语言',
            score: '分数',
            hi: '最高分',
            paused: '暂停',
            pressPToResume: '按 P 继续',
            gameOver: '游戏结束',
            height: '高度',
            newHighScore: '新纪录！',
            best: '最佳',
            pressSpaceToRestart: '按空格键重新开始',
            howToPlay: '游戏说明',
            platforms: '平台',
            items: '道具',
            monsters: '怪物',
            controls: '操作说明',
            pressToGoBack: '按 H / ESC / 空格 返回',
            platformNormal: '普通',
            platformNormalDesc: '安全固定',
            platformMoving: '移动',
            platformMovingDesc: '左右滑动',
            platformFragile: '易碎',
            platformFragileDesc: '踩一次碎',
            platformVanish: '消失',
            platformVanishDesc: '2秒后消失',
            platformBouncy: '弹力',
            platformBouncyDesc: '跳得超高',
            platformSticky: '粘液',
            platformStickyDesc: '粘住0.5秒',
            platformTeleport: '传送',
            platformTeleportDesc: '随机传送',
            platformSpeed: '加速',
            platformSpeedDesc: '速度翻倍',
            platformSpringbed: '弹簧床',
            platformSpringbedDesc: '随机弹射',
            platformChain: '连锁',
            platformChainDesc: '连锁碎裂',
            platformPortal: '传送门',
            platformPortalDesc: '配对传送',
            itemSpring: '弹簧',
            itemSpringDesc: '跳得更高',
            itemRocket: '火箭',
            itemRocketDesc: '极速上升',
            itemShield: '护盾',
            itemShieldDesc: '挡一次伤',
            itemCoin: '金币',
            itemCoinDesc: '+50分',
            itemMagnet: '磁铁',
            itemMagnetDesc: '吸金币',
            itemDouble: '双倍',
            itemDoubleDesc: '分数翻倍',
            itemParachute: '降落伞',
            itemParachuteDesc: '慢速下落',
            itemSuperSpring: '超级弹簧',
            itemSuperSpringDesc: '跳得最高',
            itemShrink: '缩小',
            itemShrinkDesc: '体型减半',
            itemSlowMo: '缓速',
            itemSlowMoDesc: '时间变慢',
            itemBomb: '炸弹',
            itemBombDesc: '清除怪物',
            itemShip: '飞船',
            itemShipDesc: '无敌冲刺',
            monsterUfo: '飞碟',
            monsterUfoDesc: '左右飞行',
            monsterMonster: '怪物',
            monsterMonsterDesc: '四处游荡',
            monsterBlackHole: '黑洞',
            monsterBlackHoleDesc: '缓慢下坠',
            monsterTurret: '炮台',
            monsterTurretDesc: '发射子弹',
            ctrlMove: '← → / A D : 移动',
            ctrlStart: '空格 / 回车 : 开始',
            ctrlPause: 'P : 暂停',
            ctrlHelp: 'H : 帮助',
            ctrlLang: 'L : 切换语言',
            statusMagnet: '磁',
            statusDouble: '双',
            statusParachute: '伞',
            statusShrink: '缩',
            statusSlowMo: '缓',
            statusShip: '船',
            statusSpeed: '速'
        },
        en: {
            gameTitle: 'SuperJump',
            subtitle: 'A Doodle Jump Clone',
            highScore: 'High Score',
            pressSpaceToStart: 'Press SPACE to Start',
            pressHForHelp: 'Press H for Help',
            pressLForLang: 'Press L for Language',
            score: 'Score',
            hi: 'Hi',
            paused: 'PAUSED',
            pressPToResume: 'Press P to resume',
            gameOver: 'GAME OVER',
            height: 'Height',
            newHighScore: 'NEW HIGH SCORE!',
            best: 'Best',
            pressSpaceToRestart: 'Press SPACE to Restart',
            howToPlay: 'How to Play',
            platforms: 'Platforms',
            items: 'Items',
            monsters: 'Monsters',
            controls: 'Controls',
            pressToGoBack: 'Press H / ESC / SPACE to go back',
            platformNormal: 'Normal',
            platformNormalDesc: 'Safe & still',
            platformMoving: 'Moving',
            platformMovingDesc: 'Slides left/right',
            platformFragile: 'Fragile',
            platformFragileDesc: 'Breaks on step',
            platformVanish: 'Vanish',
            platformVanishDesc: 'Fades after 2s',
            platformBouncy: 'Bouncy',
            platformBouncyDesc: 'Super jump!',
            platformSticky: 'Sticky',
            platformStickyDesc: 'Stuck 0.5s',
            platformTeleport: 'Teleport',
            platformTeleportDesc: 'Random warp',
            platformSpeed: 'Speed',
            platformSpeedDesc: '2x speed',
            platformSpringbed: 'Springbed',
            platformSpringbedDesc: 'Random launch',
            platformChain: 'Chain',
            platformChainDesc: 'Chain break',
            platformPortal: 'Portal',
            platformPortalDesc: 'Paired warp',
            itemSpring: 'Spring',
            itemSpringDesc: 'High bounce',
            itemRocket: 'Rocket',
            itemRocketDesc: 'Fly up fast',
            itemShield: 'Shield',
            itemShieldDesc: 'Block 1 hit',
            itemCoin: 'Coin',
            itemCoinDesc: '+50 pts',
            itemMagnet: 'Magnet',
            itemMagnetDesc: 'Pull coins',
            itemDouble: 'x2 Score',
            itemDoubleDesc: 'Double pts',
            itemParachute: 'Chute',
            itemParachuteDesc: 'Slow fall',
            itemSuperSpring: 'Super Spring',
            itemSuperSpringDesc: 'Max bounce',
            itemShrink: 'Shrink',
            itemShrinkDesc: 'Half size',
            itemSlowMo: 'Slow-Mo',
            itemSlowMoDesc: 'Slow time',
            itemBomb: 'Bomb',
            itemBombDesc: 'Clear monsters',
            itemShip: 'Ship',
            itemShipDesc: 'Invincible fly',
            monsterUfo: 'UFO',
            monsterUfoDesc: 'Floats left/right',
            monsterMonster: 'Monster',
            monsterMonsterDesc: 'Wanders around',
            monsterBlackHole: 'Black Hole',
            monsterBlackHoleDesc: 'Falls slowly',
            monsterTurret: 'Turret',
            monsterTurretDesc: 'Shoots bullets',
            ctrlMove: '← → / A D : Move',
            ctrlStart: 'Space / Enter : Start',
            ctrlPause: 'P : Pause',
            ctrlHelp: 'H : Help',
            ctrlLang: 'L : Language',
            statusMagnet: 'M',
            statusDouble: 'x2',
            statusParachute: 'P',
            statusShrink: 'S',
            statusSlowMo: 'SM',
            statusShip: 'SH',
            statusSpeed: 'SP'
        }
    };

    function init() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'zh' || saved === 'en') {
                currentLang = saved;
            }
        } catch (e) {
            // localStorage unavailable
        }
    }

    function t(key) {
        const str = translations[currentLang][key];
        return str !== undefined ? str : key;
    }

    function toggle() {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        try {
            localStorage.setItem(STORAGE_KEY, currentLang);
        } catch (e) {}
        return currentLang;
    }

    function getLang() {
        return currentLang;
    }

    return {
        init,
        t,
        toggle,
        getLang
    };
})();
