// ⚡ 皮卡丘大冒险 - Roguelike 游戏核心逻辑
// 🐉 新增英雄：小火龙！

// ==================== 游戏配置 ====================
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TILE_SIZE: 32,
    FPS: 60
};

// ==================== 英雄定义 ====================
const HEROES = {
    pikachu: {
        id: 'pikachu',
        name: '皮卡丘',
        emoji: '⚡',
        color: '#FFD700',
        hp: 100,
        energy: 100,
        speed: 5,
        skills: ['thunder_shock', 'thunderbolt', 'quick_attack', 'iron_tail'],
        description: '电系宝可梦，技能冷却快，灵活多变'
    },
    charmander: {
        id: 'charmander',
        name: '小火龙',
        emoji: '🐉',
        color: '#FF6B35',
        hp: 120,      // 更高血量
        energy: 90,   // 稍低能量
        speed: 4.5,   // 稍慢速度
        skills: ['ember', 'flamethrower', 'dragon_claw', 'fire_spin'],
        description: '火系宝可梦，高血量，技能伤害高'
    }
};

// 关卡配置
const LEVELS = [
    { // 第 1 关：森林草地
        name: "森林草地",
        mapWidth: 25,
        mapHeight: 25,
        terrain: { dirt: 0.86, rock: 0.14 },  // 岩石严格低于 15%
        enemies: ['rattata', 'pidgey', 'ekans'],  // 只保留 3 种敌人
        spawnRate: 3000, // ms
        duration: 60, // seconds
        killGoal: 30,
        boss: null
    },
    { // 第 2 关：火箭队基地
        name: "火箭队基地",
        mapWidth: 35,
        mapHeight: 35,
        terrain: { dirt: 0.87, rock: 0.13 },  // 岩石严格低于 15%
        enemies: ['rattata', 'pidgey', 'ekans'],  // 只保留 3 种敌人
        spawnRate: 2000,
        duration: 90,
        killGoal: 50,
        boss: null
    },
    { // 第 3 关：雷电山脉
        name: "雷电山脉",
        mapWidth: 45,
        mapHeight: 45,
        terrain: { dirt: 0.86, rock: 0.14 },  // 岩石严格低于 15%
        enemies: ['rattata', 'pidgey', 'ekans'],  // 只保留 3 种敌人
        spawnRate: 1500,
        duration: 120,
        killGoal: 80,
        boss: null
    }
];

// ==================== 技能定义 ====================
const SKILLS = {
    // ⚡ 皮卡丘技能（电系）
    thunder_shock: {
        id: 'thunder_shock',
        name: '电击',
        key: 'Q',
        energyCost: 5,
        cooldown: 800,
        damage: 12,
        duration: 8000,
        range: CONFIG.TILE_SIZE * 2.5,
        color: '#FFD700',
        hero: 'pikachu'
    },
    thunderbolt: {
        id: 'thunderbolt',
        name: '十万伏特',
        key: 'W',
        energyCost: 25,
        cooldown: 8000,
        damage: 40,
        range: Infinity,
        angle: Math.PI * 2,
        color: '#FFA500',
        stun: 1000,
        hero: 'pikachu'
    },
    quick_attack: {
        id: 'quick_attack',
        name: '电光一闪',
        key: 'E',
        energyCost: 15,
        cooldown: 4000,
        damage: 15,
        dashDistance: 5,
        color: '#87CEEB',
        invincible: 500,
        hero: 'pikachu'
    },
    iron_tail: {
        id: 'iron_tail',
        name: '铁尾',
        key: 'R',
        energyCost: 20,
        cooldown: 6000,
        damage: 35,
        range: 100,
        angle: Math.PI * 2,
        color: '#A0A0A0',
        knockback: true,
        hero: 'pikachu'
    },
    
    // 🐉 小火龙技能（火系）
    ember: {
        id: 'ember',
        name: '火花',
        key: 'Q',
        energyCost: 5,      // ⚡ 类似皮卡丘 Q：低消耗
        cooldown: 800,      // ⚡ 类似皮卡丘 Q：快冷却
        damage: 12,         // ⚡ 类似皮卡丘 Q：持续伤害
        duration: 8000,     // ⚡ 类似皮卡丘 Q：长持续时间
        range: CONFIG.TILE_SIZE * 2.5, // ⚡ 类似皮卡丘 Q：环绕范围
        color: '#FF6B35',
        hero: 'charmander'
    },
    flamethrower: {
        id: 'flamethrower',
        name: '喷射火焰',
        key: 'W',
        energyCost: 30,
        cooldown: 7000,
        damage: 50,
        range: 300,
        angle: Math.PI / 3, // 前方扇形
        color: '#FF4500',
        burn: 2000, // 灼烧效果
        hero: 'charmander'
    },
    dragon_claw: {
        id: 'dragon_claw',
        name: '龙之爪',
        key: 'E',
        energyCost: 18,
        cooldown: 3500,
        damage: 25,
        dashDistance: 4,
        range: 80,
        color: '#FF8C00',
        invincible: 400,
        hero: 'charmander'
    },
    fire_spin: {
        id: 'fire_spin',
        name: '火焰旋涡',
        key: 'R',
        energyCost: 22,
        cooldown: 5500,
        damage: 30,
        duration: 5000,
        range: CONFIG.TILE_SIZE * 3,
        color: '#DC143C',
        knockback: true,
        hero: 'charmander'
    }
};

// 敌人定义（只保留 3 种）
const ENEMIES = {
    rattata: { name: '小拉达', emoji: '🐀', hp: 30, damage: 8, speed: 1.2, score: 10 },
    pidgey: { name: '波波', emoji: '🐦', hp: 25, damage: 6, speed: 1.5, score: 10 },
    ekans: { name: '阿柏蛇', emoji: '🐍', hp: 50, damage: 12, speed: 1.0, score: 20 }
};

// 地形定义
const TERRAIN = {
    dirt: { emoji: '🟫', walkable: true, effect: null },
    rock: { emoji: '🪨', walkable: false, effect: null },
    grass: { emoji: '🟩', walkable: true, effect: null }  // 添加草地地形
};

// ==================== 游戏状态 ====================
let gameState = {
    screen: 'main-menu', // main-menu, skill-select, game, level-complete, game-over, pause
    level: 1,
    score: 0,
    kills: 0,
    startTime: 0,
    paused: false,
    canvas: null,
    ctx: null,
    lastTime: 0,
    enemySpawnTimer: 0,
    levelTime: 0,
    maxUnlockedLevel: 1,  // 记录最高解锁关卡
    gameMode: 'single',   // 'single' 或 'co-op' 双人合作
    playerCount: 1        // 玩家数量（1 或 2）
};

// 玩家 1 对象
let player1 = {
    id: 1,
    hero: 'pikachu',
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    speed: 5,
    defense: 0,
    skills: [],
    skillCooldowns: {},
    invincible: 0,
    direction: { x: 0, y: 1 },
    gamepadIndex: 0  // 手柄 0
};

// player 别名（指向 player1，用于兼容旧代码）
let player = player1;

// 玩家 2 对象（双人模式）
let player2 = {
    id: 2,
    hero: 'charmander',
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    speed: 5,
    defense: 0,
    skills: [],
    skillCooldowns: {},
    invincible: 0,
    direction: { x: 0, y: 1 },
    gamepadIndex: 1  // 手柄 1
};

// 当前活动玩家（用于技能选择等界面）
let currentPlayer = player1;

// 游戏实体
let map = [];
let enemies = [];
let projectiles = [];
let effects = [];
let items = [];
let damageNumbers = [];
let skillZones = []; // 技能区域（如电击持续伤害区）
let fireParticles = []; // 火焰粒子数组

// 技能强化状态
let skillBuffs = {
    q_range: 1,       // Q 范围倍率
    q_duration: 1     // Q 持续时间倍率
};

// 音频系统
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// 播放音效（使用 Web Audio API 合成）
function playSound(type, playerRef) {
    if (!audioCtx || !soundEnabled) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    // 获取当前英雄（使用传入的玩家引用或全局 player）
    const playerObj = playerRef || player;
    const currentHero = playerObj ? playerObj.hero : 'pikachu';
    const isCharmander = currentHero === 'charmander';
    
    switch(type) {
        case 'skill_q':
            if (isCharmander) {
                // 🔥 火花 - 火焰噼啪声
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                
                // 添加火焰噪声
                const fireNoise = createFireNoise(0.25);
                fireNoise.connect(audioCtx.destination);
            } else {
                // ⚡ 电击 - 电流声
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            }
            break;
            
        case 'skill_w':
            if (isCharmander) {
                // 🔥 喷射火焰 - 强烈火焰喷射声
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                
                // 添加强烈火焰噪声
                const fireNoise = createFireNoise(0.6);
                fireNoise.connect(audioCtx.destination);
            } else {
                // ⚡ 十万伏特 - 强力电流
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                
                // 添加噪声效果
                const noise = createNoise(0.5);
                noise.connect(audioCtx.destination);
            }
            break;
            
        case 'skill_e':
            if (isCharmander) {
                // 🔥 龙之爪 - 龙爪撕裂声 + 火焰
                osc.type = 'square';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.linearRampToValueAtTime(900, now + 0.15);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                
                // 添加火焰噪声
                const fireNoise = createFireNoise(0.3);
                fireNoise.connect(audioCtx.destination);
            } else {
                // ⚡ 电光一闪 - 快速滑动
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
            break;
            
        case 'skill_r':
            if (isCharmander) {
                // 🔥 火焰旋涡 - 旋涡轰鸣 + 火焰
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(250, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                
                // 添加旋涡噪声
                const fireNoise = createFireNoise(0.5);
                fireNoise.connect(audioCtx.destination);
            } else {
                // ⚡ 铁尾 - 重击
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            }
            break;
            
        case 'hit': // 敌人被击中
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
            
        case 'enemy_death': // 敌人死亡
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
            
        case 'pickup': // 拾取道具
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(900, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
            
        case 'pickup_rare': // 拾取稀有道具
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.setValueAtTime(800, now + 0.1);
            osc.frequency.setValueAtTime(1200, now + 0.2);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
            
        case 'player_hit': // 玩家受伤
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
            
        case 'level_up': // 关卡完成
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(600, now + 0.15);
            osc.frequency.setValueAtTime(800, now + 0.3);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
            break;
            
        case 'game_over': // 游戏结束
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 1);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.start(now);
            osc.stop(now + 1);
            break;
    }
}

// 创建噪声（用于爆炸等效果）
function createNoise(duration) {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    noise.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
    
    return noise;
}

// 🔥 创建火焰噪声（用于小火龙技能）
function createFireNoise(duration) {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // 生成类似火焰的低频噪声
    for (let i = 0; i < bufferSize; i++) {
        const t = i / audioCtx.sampleRate;
        // 结合多个频率的噪声，模拟火焰噼啪声
        data[i] = (Math.random() * 2 - 1) * 0.7 + 
                  Math.sin(t * 100) * 0.2 + 
                  Math.sin(t * 250) * 0.1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    // 火焰音效的滤波器
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.Q.value = 0.5;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
    
    return noise;
}

// ==================== 初始化 ====================
function init() {
    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    gameState.canvas.width = CONFIG.CANVAS_WIDTH;
    gameState.canvas.height = CONFIG.CANVAS_HEIGHT;

    // 绑定事件
    document.getElementById('start-single-btn').addEventListener('click', () => startGame('single'));
    document.getElementById('start-coop-btn').addEventListener('click', () => startGame('co-op'));
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('restart-1-btn').addEventListener('click', restartFromLevel1);
    document.getElementById('menu-btn').addEventListener('click', showMainMenu);
    document.getElementById('resume-btn').addEventListener('click', togglePause);
    document.getElementById('quit-btn').addEventListener('click', quitToMenu);
    
    // 静音按钮
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // 手柄连接事件
    window.addEventListener('gamepadconnected', (e) => {
        gameState.gamepad.connected = true;
        gameState.gamepad.index = e.gamepad.index;
        console.log(`🎮 手柄已连接：${e.gamepad.id}`);
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
        gameState.gamepad.connected = false;
        gameState.gamepad.index = null;
        console.log(`🎮 手柄已断开：${e.gamepad.id}`);
    });

    // 按键状态
    gameState.keys = {};
    
    // 手柄状态
    gameState.gamepad = {
        connected: false,
        index: null,
        axes: { x: 0, y: 0 },
        buttons: { up: false, down: false, left: false, right: false },
        skillLock: {},
        pauseLock: false
    };

    console.log('⚡ 皮卡丘大冒险 初始化完成!');
    console.log('🎮 手柄支持已启用 - 按任意手柄按钮连接');
}

// ==================== 游戏流程 ====================
let selectedHero = 'pikachu';  // 默认英雄
let selectingPlayer = 1;  // 当前选择的玩家（1 或 2）

function startGame(mode = 'single') {
    // 初始化音频（需要用户交互触发）
    initAudio();
    
    gameState.gameMode = mode;
    gameState.playerCount = mode === 'co-op' ? 2 : 1;
    gameState.level = 1;
    gameState.maxUnlockedLevel = 1;
    gameState.score = 0;
    gameState.kills = 0;
    
    // 初始化玩家基础属性（不设置技能）
    initPlayers();
    
    // 进入英雄选择
    selectingPlayer = 1;
    currentPlayer = player1;
    generateHeroOptions();
    showScreen('mode-select');
}

// 初始化玩家基础属性
function initPlayers() {
    // 玩家 1 基础属性
    player1.id = 1;
    player1.hero = 'pikachu';  // 默认英雄
    player1.gamepadIndex = 0;
    player1.skillCooldowns = {};
    player1.invincible = 0;
    player1.defense = 0;
    skillBuffs = { q_range: 1, q_duration: 1 };
    
    // 玩家 2 基础属性
    player2.id = 2;
    player2.hero = 'charmander';  // 默认英雄
    player2.gamepadIndex = 1;
    player2.skillCooldowns = {};
    player2.invincible = 0;
    player2.defense = 0;
}

function generateHeroOptions() {
    const container = document.getElementById('hero-options');
    const title = document.getElementById('mode-title');
    const subtitle = document.getElementById('mode-subtitle');
    
    container.innerHTML = '';
    
    // 更新标题
    if (gameState.playerCount === 2) {
        title.textContent = `玩家${selectingPlayer} 选择英雄`;
        subtitle.textContent = selectingPlayer === 1 ? '玩家 1 先选' : '玩家 2 选择';
    } else {
        title.textContent = '选择英雄';
        subtitle.textContent = '选择你的宝可梦';
    }
    
    Object.values(HEROES).forEach(hero => {
        const card = document.createElement('div');
        card.className = 'hero-card';
        card.innerHTML = `
            <div class="hero-emoji">${hero.emoji}</div>
            <h3>${hero.name}</h3>
            <div class="hero-stats">
                <div class="hero-stat">
                    <div class="hero-stat-label">生命</div>
                    <div class="hero-stat-value">${hero.hp}</div>
                </div>
                <div class="hero-stat">
                    <div class="hero-stat-label">能量</div>
                    <div class="hero-stat-value">${hero.energy}</div>
                </div>
                <div class="hero-stat">
                    <div class="hero-stat-label">速度</div>
                    <div class="hero-stat-value">${hero.speed}</div>
                </div>
            </div>
            <p>${hero.description}</p>
        `;
        
        card.addEventListener('click', () => {
            // 设置当前玩家的英雄
            if (selectingPlayer === 1) {
                player1.hero = hero.id;
            } else {
                player2.hero = hero.id;
            }
            
            // 双人模式下继续选择玩家 2
            if (gameState.playerCount === 2 && selectingPlayer === 1) {
                selectingPlayer = 2;
                currentPlayer = player2;
                generateHeroOptions();
                return;
            }
            
            // 所有英雄选择完成，初始化技能并开始游戏
            setTimeout(() => {
                initPlayerSkills();
                startLevel(1);
            }, 300);
        });
        
        container.appendChild(card);
    });
}

// 初始化玩家技能（选择英雄后调用）
function initPlayerSkills() {
    // 玩家 1 技能初始化
    const hero1 = HEROES[player1.hero];
    player1.hp = hero1.hp;
    player1.maxHp = hero1.hp;
    player1.energy = hero1.energy;
    player1.maxEnergy = hero1.energy;
    player1.speed = hero1.speed;
    player1.skills = hero1.skills.map(skillId => SKILLS[skillId]);
    
    // 玩家 2 技能初始化（双人模式）
    if (gameState.playerCount === 2) {
        const hero2 = HEROES[player2.hero];
        player2.hp = hero2.hp;
        player2.maxHp = hero2.hp;
        player2.energy = hero2.energy;
        player2.maxEnergy = hero2.energy;
        player2.speed = hero2.speed;
        player2.skills = hero2.skills.map(skillId => SKILLS[skillId]);
    }
}

function startLevel(levelNum) {
    gameState.level = levelNum;
    gameState.levelTime = 0;
    gameState.kills = 0;
    gameState.enemySpawnTimer = 0;
    
    const levelConfig = LEVELS[levelNum - 1] || LEVELS[2];
    
    // 生成地图
    generateMap(levelConfig);
    
    // 设置玩家位置（双人模式分开站位）
    player1.x = Math.floor(levelConfig.mapWidth / 2) * CONFIG.TILE_SIZE;
    player1.y = Math.floor(levelConfig.mapHeight / 2) * CONFIG.TILE_SIZE;
    
    if (gameState.playerCount === 2) {
        // 玩家 2 在玩家 1 旁边
        player2.x = player1.x + CONFIG.TILE_SIZE * 2;
        player2.y = player1.y;
    }
    
    // 清空实体
    enemies = [];
    projectiles = [];
    effects = [];
    items = [];
    skillZones = [];
    
    // 初始化技能冷却
    player1.skills.forEach(skill => {
        player1.skillCooldowns[skill.id] = 0;
    });
    
    if (gameState.playerCount === 2) {
        player2.skills.forEach(skill => {
            player2.skillCooldowns[skill.id] = 0;
        });
    }
    
    gameState.startTime = Date.now();
    gameState.screen = 'game';
    gameState.paused = false;
    
    showScreen('game');
    updateUI();
    
    // 开始游戏循环
    gameState.lastTime = Date.now();
    requestAnimationFrame(gameLoop);
}

function generateMap(levelConfig) {
    map = [];
    for (let y = 0; y < levelConfig.mapHeight; y++) {
        map[y] = [];
        for (let x = 0; x < levelConfig.mapWidth; x++) {
            const rand = Math.random();
            let terrain = 'grass';
            let cumulative = 0;
            
            for (const [type, chance] of Object.entries(levelConfig.terrain)) {
                cumulative += chance;
                if (rand < cumulative) {
                    terrain = type;
                    break;
                }
            }
            
            map[y][x] = {
                type: terrain,
                x: x * CONFIG.TILE_SIZE,
                y: y * CONFIG.TILE_SIZE
            };
        }
    }
}

// ==================== 游戏主循环 ====================
function gameLoop() {
    if (gameState.paused || gameState.screen !== 'game') return;
    
    const now = Date.now();
    const dt = (now - gameState.lastTime) / 1000;
    gameState.lastTime = now;
    
    update(dt);
    render();
    
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    gameState.levelTime += dt;
    
    // player 始终指向 player1（用于兼容旧代码）
    player = player1;
    
    // 更新玩家（player1 和 player2）
    updatePlayer(dt);
    
    // 生成敌人
    updateEnemySpawn(dt);
    
    // 更新敌人（攻击两个玩家）
    updateEnemies(dt);
    
    // 更新投射物
    updateProjectiles(dt);
    
    // 更新效果
    updateEffects(dt);
    
    // 更新火焰粒子
    updateFireParticles(dt);
    
    // 更新物品（两个玩家都可以拾取）
    updateItems(dt);
    
    // 更新伤害数字
    updateDamageNumbers(dt);
    
    // 更新技能区域
    updateSkillZones(dt);
    
    // 检查关卡完成
    checkLevelComplete();
    
    // 更新 UI
    updateUI();
}

// 轮询手柄输入（支持双手柄）
function pollGamepad(playerIndex) {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[playerIndex];
    if (!gamepad) return null;
    
    // 读取摇杆轴（通常轴 0 是左摇杆 X，轴 1 是左摇杆 Y）
    const axisX = gamepad.axes[0];
    const axisY = gamepad.axes[1];
    
    // 死区阈值，避免漂移
    const deadzone = 0.2;
    
    const axes = {
        x: Math.abs(axisX) > deadzone ? axisX : 0,
        y: Math.abs(axisY) > deadzone ? axisY : 0
    };
    
    // 手柄按钮映射
    const buttons = {
        up: gamepad.buttons[12]?.pressed || false,
        down: gamepad.buttons[13]?.pressed || false,
        left: gamepad.buttons[14]?.pressed || false,
        right: gamepad.buttons[15]?.pressed || false
    };
    
    return { gamepad, axes, buttons };
}

// 通过手柄尝试使用技能（带冷却防止连发）
function tryUseSkill(player, key) {
    const now = Date.now();
    if (!player.skillLock) player.skillLock = {};
    if (player.skillLock[key] && now - player.skillLock[key] < 300) return;
    player.skillLock[key] = now;
    
    player.skills.forEach(skill => {
        if (skill.key === key) useSkill(skill, player);
    });
}

function updatePlayer(dt) {
    // 更新 player1（总是更新）
    updatePlayerSingle(player1, 0, dt);
    
    // 双人模式：更新 player2
    if (gameState.playerCount === 2) {
        updatePlayerSingle(player2, 1, dt);
    }
}

function updatePlayerSingle(player, gamepadIndex, dt) {
    // 轮询手柄输入
    const gpData = pollGamepad(gamepadIndex);
    
    // 移动 - 支持键盘和手柄
    let dx = 0, dy = 0;
    
    // 键盘输入（只有玩家 1 用键盘）
    if (gamepadIndex === 0) {
        if (gameState.keys['KeyW'] || gameState.keys['ArrowUp']) dy = -1;
        if (gameState.keys['KeyS'] || gameState.keys['ArrowDown']) dy = 1;
        if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) dx = -1;
        if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) dx = 1;
    }
    
    // 手柄输入
    if (gpData) {
        const { axes, buttons } = gpData;
        
        // 手柄方向键
        if (buttons.up) dy = -1;
        if (buttons.down) dy = 1;
        if (buttons.left) dx = -1;
        if (buttons.right) dx = 1;
        
        // 手柄摇杆（如果方向键没按下）
        if (Math.abs(axes.x) > 0.2 || Math.abs(axes.y) > 0.2) {
            dx = axes.x;
            dy = axes.y;
        }
        
        // 技能按钮（A/B/X/Y）
        if (buttons.up || Math.abs(axes.y) > 0.5) {
            // 防止误触，需要明确的按钮按下
        }
        if (gpData.gamepad.buttons[0]?.pressed) tryUseSkill(player, 'Q');  // A
        if (gpData.gamepad.buttons[1]?.pressed) tryUseSkill(player, 'W');  // B
        if (gpData.gamepad.buttons[2]?.pressed) tryUseSkill(player, 'E');  // X
        if (gpData.gamepad.buttons[3]?.pressed) tryUseSkill(player, 'R');  // Y
        
        // Start 键暂停（两个手柄都可以暂停）
        if (gpData.gamepad.buttons[9]?.pressed && !player.pauseLock) {
            player.pauseLock = true;
            if (gameState.screen === 'game') togglePause();
        }
        if (!gpData.gamepad.buttons[9]?.pressed) {
            player.pauseLock = false;
        }
    }
    
    if (dx !== 0 || dy !== 0) {
        // 归一化
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
        
        // 检查地形
        const newX = player.x + dx * player.speed * 60 * dt;
        const newY = player.y + dy * player.speed * 60 * dt;
        
        if (canWalk(newX, player.y)) player.x = newX;
        if (canWalk(player.x, newY)) player.y = newY;
        
        // 更新方向
        player.direction = { x: dx, y: dy };
    }
    
    // 能量自然恢复
    if (player.energy < player.maxEnergy) {
        player.energy = Math.min(player.maxEnergy, player.energy + 2 * dt);
    }
    
    // 无敌时间
    if (player.invincible > 0) {
        player.invincible -= dt * 1000;
    }
    
    // 边界限制
    const levelConfig = LEVELS[Math.min(gameState.level - 1, 2)];
    const maxX = levelConfig.mapWidth * CONFIG.TILE_SIZE - CONFIG.TILE_SIZE;
    const maxY = levelConfig.mapHeight * CONFIG.TILE_SIZE - CONFIG.TILE_SIZE;
    player.x = Math.max(0, Math.min(maxX, player.x));
    player.y = Math.max(0, Math.min(maxY, player.y));
}

function canWalk(x, y) {
    const tileX = Math.floor((x + CONFIG.TILE_SIZE / 2) / CONFIG.TILE_SIZE);
    const tileY = Math.floor((y + CONFIG.TILE_SIZE / 2) / CONFIG.TILE_SIZE);
    
    const levelConfig = LEVELS[Math.min(gameState.level - 1, 2)];
    if (tileX < 0 || tileX >= levelConfig.mapWidth || tileY < 0 || tileY >= levelConfig.mapHeight) {
        return false;
    }
    
    const terrain = TERRAIN[map[tileY][tileX].type];
    return terrain.walkable;
}

function updateEnemySpawn(dt) {
    const levelConfig = LEVELS[Math.min(gameState.level - 1, 2)];
    gameState.enemySpawnTimer += dt * 1000;
    
    if (gameState.enemySpawnTimer >= levelConfig.spawnRate) {
        gameState.enemySpawnTimer = 0;
        spawnEnemy();
    }
}

function spawnEnemy() {
    const levelConfig = LEVELS[Math.min(gameState.level - 1, 2)];
    const enemyType = levelConfig.enemies[Math.floor(Math.random() * levelConfig.enemies.length)];
    const enemyData = ENEMIES[enemyType];
    
    // 在地图边缘生成（但在地图内部，距离边缘 2-4 格）
    let ex, ey;
    const side = Math.floor(Math.random() * 4);
    const margin = 2 + Math.floor(Math.random() * 3); // 2-4 格距离边缘
    const levelWidth = levelConfig.mapWidth * CONFIG.TILE_SIZE;
    const levelHeight = levelConfig.mapHeight * CONFIG.TILE_SIZE;
    
    switch(side) {
        case 0: // 上边缘
            ex = Math.random() * (levelWidth - CONFIG.TILE_SIZE * 2) + CONFIG.TILE_SIZE;
            ey = margin * CONFIG.TILE_SIZE;
            break;
        case 1: // 右边缘
            ex = levelWidth - margin * CONFIG.TILE_SIZE - CONFIG.TILE_SIZE;
            ey = Math.random() * (levelHeight - CONFIG.TILE_SIZE * 2) + CONFIG.TILE_SIZE;
            break;
        case 2: // 下边缘
            ex = Math.random() * (levelWidth - CONFIG.TILE_SIZE * 2) + CONFIG.TILE_SIZE;
            ey = levelHeight - margin * CONFIG.TILE_SIZE - CONFIG.TILE_SIZE;
            break;
        case 3: // 左边缘
            ex = margin * CONFIG.TILE_SIZE;
            ey = Math.random() * (levelHeight - CONFIG.TILE_SIZE * 2) + CONFIG.TILE_SIZE;
            break;
    }
    
    // 确保不在玩家附近生成（至少 10 格距离）
    let minDistToPlayer = Infinity;
    const dist1 = Math.sqrt((ex - player1.x) ** 2 + (ey - player1.y) ** 2);
    minDistToPlayer = Math.min(minDistToPlayer, dist1);
    
    if (gameState.playerCount === 2) {
        const dist2 = Math.sqrt((ex - player2.x) ** 2 + (ey - player2.y) ** 2);
        minDistToPlayer = Math.min(minDistToPlayer, dist2);
    }
    
    if (minDistToPlayer < 10 * CONFIG.TILE_SIZE) {
        return; // 不生成这个敌人
    }
    
    // 难度缩放
    const difficultyMultiplier = 1 + (gameState.level - 1) * 0.3;
    
    enemies.push({
        type: enemyType,
        x: ex,
        y: ey,
        hp: enemyData.hp * difficultyMultiplier,
        maxHp: enemyData.hp * difficultyMultiplier,
        damage: enemyData.damage * difficultyMultiplier,
        speed: enemyData.speed * (1 + (gameState.level - 1) * 0.1), // 速度也随难度增加
        score: enemyData.score,
        emoji: enemyData.emoji,
        range: enemyData.range || null
    });
}

function updateEnemies(dt) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // 找到最近的玩家
        let target = player1;
        let minDist = Math.sqrt((player1.x - enemy.x) ** 2 + (player1.y - enemy.y) ** 2);
        
        if (gameState.playerCount === 2) {
            const dist2 = Math.sqrt((player2.x - enemy.x) ** 2 + (player2.y - enemy.y) ** 2);
            if (dist2 < minDist) {
                target = player2;
                minDist = dist2;
            }
        }
        
        // 追踪玩家
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) { // 保持一点距离
            const moveX = (dx / dist) * enemy.speed * 60 * dt;
            const moveY = (dy / dist) * enemy.speed * 60 * dt;
            
            // 尝试移动
            const newX = enemy.x + moveX;
            const newY = enemy.y + moveY;
            const canMoveX = canWalk(newX, enemy.y);
            const canMoveY = canWalk(enemy.x, newY);
            
            if (canMoveX) enemy.x = newX;
            if (canMoveY) enemy.y = newY;
            
            // 卡住时随机挣脱
            if (!canMoveX && !canMoveY) {
                const escapeAngle = Math.random() * Math.PI * 2;
                const escapeX = enemy.x + Math.cos(escapeAngle) * enemy.speed * 30 * dt;
                const escapeY = enemy.y + Math.sin(escapeAngle) * enemy.speed * 30 * dt;
                if (canWalk(escapeX, escapeY)) {
                    enemy.x = escapeX;
                    enemy.y = escapeY;
                }
            }
        }
        
        // 碰撞检测 - 接触伤害（检查两个玩家）
        checkEnemyCollision(enemy, player1);
        if (gameState.playerCount === 2) {
            checkEnemyCollision(enemy, player2);
        }
    }
}

// 检查敌人与玩家的碰撞
function checkEnemyCollision(enemy, player) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const attackDist = CONFIG.TILE_SIZE * 0.8;
    
    if (dist < attackDist && player.invincible <= 0) {
        const damage = Math.max(1, enemy.damage - player.defense);
        player.hp -= damage;
        player.invincible = 1000;
        
        playSound('player_hit');
        addDamageNumber(player.x, player.y, `-${damage}`, '#FF6B6B');
        
        // 击退
        if (dist > 0) {
            player.x += (dx / dist) * 30;
            player.y += (dy / dist) * 30;
        }
        
        // 检查游戏结束（任意玩家死亡）
        if (player.hp <= 0) {
            gameOver();
        }
    }
}

function updateProjectiles(dt) {
    projectiles.forEach((proj, index) => {
        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;
        proj.life -= dt;
        
        // 碰撞检测
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dx = proj.x - enemy.x - CONFIG.TILE_SIZE / 2;
            const dy = proj.y - enemy.y - CONFIG.TILE_SIZE / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < CONFIG.TILE_SIZE) {
                enemy.hp -= proj.damage;
                addDamageNumber(enemy.x, enemy.y, proj.damage.toString(), '#FFD700');
                playSound('hit');
                
                if (enemy.hp <= 0) {
                    gameState.score += enemy.score;
                    gameState.kills++;
                    playSound('enemy_death');
                    enemies.splice(i, 1); // 移除死亡的敌人
                    
                    // 概率掉落物品
                    if (Math.random() < 0.3) {
                        spawnItem(enemy.x, enemy.y);
                    }
                }
                
                proj.hit = true;
                break;
            }
        }
        
        if (proj.life <= 0 || proj.hit) {
            projectiles.splice(index, 1);
        }
    });
}

function updateEffects(dt) {
    effects.forEach((effect, index) => {
        effect.life -= dt;
        if (effect.life <= 0) {
            effects.splice(index, 1);
        }
    });
}

// 🐉 火焰粒子更新
function updateFireParticles(dt) {
    for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        p.size *= 0.97; // 逐渐缩小
        
        if (p.life <= 0 || p.size < 0.5) {
            fireParticles.splice(i, 1);
        }
    }
}

function updateItems(dt) {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        let picked = false;
        let picker = null;
        
        // 检查玩家 1
        let dx = player1.x - item.x;
        let dy = player1.y - item.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.TILE_SIZE) {
            picked = true;
            picker = player1;
        }
        
        // 检查玩家 2（双人模式）
        if (!picked && gameState.playerCount === 2) {
            dx = player2.x - item.x;
            dy = player2.y - item.y;
            dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.TILE_SIZE) {
                picked = true;
                picker = player2;
            }
        }
        
        if (picked && picker) {
            applyItem(item, picker);
            items.splice(i, 1);
        }
    }
}

function spawnItem(x, y) {
    const types = [
        'hp',           // 50% - 回血
        'energy',       // 25% - 回能量
        'skillpoint',   // 10% - 减冷却
        'q_range',      // 5% - 增加 Q 范围
        'q_duration',   // 5% - 增加 Q 持续时间
        'max_hp',       // 3% - 永久增加最大生命
        'max_energy',   // 2% - 永久增加最大能量
    ];
    
    const rand = Math.random();
    let type = 'hp';
    if (rand > 0.50) type = 'energy';
    if (rand > 0.75) type = 'skillpoint';
    if (rand > 0.85) type = 'q_range';
    if (rand > 0.90) type = 'q_duration';
    if (rand > 0.95) type = 'max_hp';
    if (rand > 0.97) type = 'max_energy';
    
    const emojis = {
        hp: '🍎',
        energy: '⚡',
        skillpoint: '✨',
        q_range: '📡',
        q_duration: '⏱️',
        max_hp: '💖',
        max_energy: '💙'
    };
    
    const colors = {
        hp: '#4ECDC4',
        energy: '#74B9FF',
        skillpoint: '#FFD700',
        q_range: '#FF6B6B',
        q_duration: '#A8E6CF',
        max_hp: '#FF85A2',
        max_energy: '#85C1E9'
    };
    
    items.push({
        type: type,
        x: x,
        y: y,
        emoji: emojis[type],
        color: colors[type]
    });
}

function applyItem(item, player) {
    // 播放拾取音效
    const rareTypes = ['q_range', 'q_duration', 'max_hp', 'max_energy'];
    if (rareTypes.includes(item.type)) {
        playSound('pickup_rare');
    } else {
        playSound('pickup');
    }
    
    if (item.type === 'hp') {
        player.hp = Math.min(player.maxHp, player.hp + 20);
        addDamageNumber(player.x, player.y, '+20 HP', '#4ECDC4');
    } else if (item.type === 'energy') {
        player.energy = Math.min(player.maxEnergy, player.energy + 30);
        addDamageNumber(player.x, player.y, '+30 MP', '#74B9FF');
    } else if (item.type === 'skillpoint') {
        player.skills.forEach(skill => {
            if (player.skillCooldowns[skill.id]) {
                player.skillCooldowns[skill.id] = Math.max(0, player.skillCooldowns[skill.id] - 2000);
            }
        });
        addDamageNumber(player.x, player.y, '技能点!', '#FFD700');
    } else if (item.type === 'q_range') {
        skillBuffs.q_range = Math.min(2.0, skillBuffs.q_range + 0.2);
        addDamageNumber(player.x, player.y, 'Q 范围 UP!', '#FF6B6B');
    } else if (item.type === 'q_duration') {
        skillBuffs.q_duration = Math.min(2.0, skillBuffs.q_duration + 0.2);
        addDamageNumber(player.x, player.y, 'Q 持续 UP!', '#A8E6CF');
    } else if (item.type === 'max_hp') {
        player.maxHp += 20;
        player.hp = player.maxHp;
        addDamageNumber(player.x, player.y, '最大生命 +20!', '#FF85A2');
    } else if (item.type === 'max_energy') {
        player.maxEnergy += 20;
        player.energy = player.maxEnergy;
        addDamageNumber(player.x, player.y, '最大能量 +20!', '#85C1E9');
    }
}

function updateDamageNumbers(dt) {
    damageNumbers.forEach((dn, index) => {
        dn.y -= 30 * dt;
        dn.life -= dt;
        if (dn.life <= 0) {
            damageNumbers.splice(index, 1);
        }
    });
}

function updateSkillZones(dt) {
    for (let i = skillZones.length - 1; i >= 0; i--) {
        const zone = skillZones[i];
        zone.life -= dt;
        zone.damageTimer += dt;
        
        // 每秒造成伤害
        if (zone.damageTimer >= 1.0) {
            zone.damageTimer = 0;
            
            // 对范围内所有敌人造成伤害
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                const dx = enemy.x - zone.x;
                const dy = enemy.y - zone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist <= zone.radius) {
                    enemy.hp -= zone.damage;
                    addDamageNumber(enemy.x, enemy.y, `-${zone.damage}`, zone.color);
                    
                    if (enemy.hp <= 0) {
                        gameState.score += enemy.score;
                        gameState.kills++;
                        playSound('enemy_death');
                        if (Math.random() < 0.3) spawnItem(enemy.x, enemy.y);
                        enemies.splice(j, 1); // 移除死亡的敌人
                    }
                }
            }
        }
        
        if (zone.life <= 0) {
            skillZones.splice(i, 1);
        }
    }
}

function addDamageNumber(x, y, text, color) {
    damageNumbers.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 1.0
    });
}

function checkLevelComplete() {
    const levelConfig = LEVELS[Math.min(gameState.level - 1, 2)];
    
    // 检查时间或击杀数
    if (gameState.levelTime >= levelConfig.duration || gameState.kills >= levelConfig.killGoal) {
        if (gameState.level < 3) {
            levelComplete();
        } else if (gameState.level === 3 && !enemies.some(e => e.type === 'mewtwo')) {
            // 第 3 关需要击败 Boss
            levelComplete();
        }
    }
}

function levelComplete() {
    // 播放关卡完成音效
    playSound('level_up');
    
    gameState.screen = 'level-complete';
    showScreen('level-complete');
    
    document.getElementById('level-score').innerHTML = `
        <strong>关卡 ${gameState.level} 完成!</strong><br>
        得分：${gameState.score}<br>
        击杀：${gameState.kills}
    `;
    
    generateUpgradeOptions();
}

function generateUpgradeOptions() {
    const container = document.getElementById('upgrade-options');
    container.innerHTML = '';
    
    const upgrades = [
        { name: '生命提升', desc: '最大生命 +30，回复全部生命', icon: '💖', apply: () => {
            player.maxHp += 30;
            player.hp = player.maxHp;
        }},
        { name: '能量提升', desc: '最大能量 +20，回复全部能量', icon: '⚡', apply: () => {
            player.maxEnergy += 20;
            player.energy = player.maxEnergy;
        }},
        { name: '防御提升', desc: '防御力 +3', icon: '🛡️', apply: () => {
            player.defense += 3;
        }},
        { name: '速度提升', desc: '移动速度 +15%', icon: '🏃', apply: () => {
            player.speed *= 1.15;
        }}
    ];
    
    // 随机选择 3 个
    const options = upgrades.sort(() => Math.random() - 0.5).slice(0, 3);
    
    options.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div class="skill-icon">${upgrade.icon}</div>
            <h4>${upgrade.name}</h4>
            <p>${upgrade.desc}</p>
        `;
        
        card.addEventListener('click', () => {
            upgrade.apply();
            nextLevel();
        });
        
        container.appendChild(card);
    });
}

function nextLevel() {
    gameState.level++;
    startLevel(gameState.level);
}

function gameOver() {
    // 播放游戏结束音效
    playSound('game_over');
    
    // 记录最高解锁关卡（失败关卡）
    gameState.maxUnlockedLevel = Math.max(gameState.maxUnlockedLevel, gameState.level);
    
    gameState.screen = 'game-over';
    showScreen('game-over');
    
    document.getElementById('final-score').innerHTML = `
        <strong>最终得分：${gameState.score}</strong>
    `;
    
    document.getElementById('final-stats').innerHTML = `
        关卡：${gameState.level}<br>
        击杀：${gameState.kills}<br>
        生存时间：${Math.floor(gameState.levelTime)}秒<br>
        <br>
        <span style="color: #FF6B6B;">💀 败北关卡：第 ${gameState.level} 关</span><br>
        <span style="color: #4ECDC4;">📌 下次可从第 ${gameState.maxUnlockedLevel} 关重新开始</span>
    `;
}

function restartGame() {
    // 从最高解锁关卡重新开始
    gameState.level = gameState.maxUnlockedLevel;
    gameState.score = 0;
    gameState.kills = 0;
    
    // 重新初始化技能
    initPlayerSkills();
    
    // 直接开始当前关卡
    startLevel(gameState.level);
}

function restartFromLevel1() {
    // 从第 1 关重新开始（完整新游戏）
    gameState.maxUnlockedLevel = 1;
    startGame();
}

function quitToMenu() {
    showMainMenu();
}

function showMainMenu() {
    gameState.screen = 'main-menu';
    showScreen('main-menu');
}

function togglePause() {
    gameState.paused = !gameState.paused;
    if (gameState.paused) {
        showScreen('pause');
    } else {
        showScreen('game');
        gameState.lastTime = Date.now();
        requestAnimationFrame(gameLoop);
    }
}

function handleKeyDown(e) {
    gameState.keys[e.code] = true;
    
    // 技能释放（键盘只有玩家 1 用）
    if (gameState.screen === 'game' && !gameState.paused) {
        player1.skills.forEach(skill => {
            if (e.code === `Key${skill.key}`) {
                useSkill(skill, player1);
            }
        });
    }
    
    // 暂停
    if (e.code === 'Escape') {
        if (gameState.screen === 'game') {
            togglePause();
        }
    }
}

function handleKeyUp(e) {
    gameState.keys[e.code] = false;
}

function useSkill(skill, player) {
    const now = Date.now();
    
    // 检查冷却
    if (player.skillCooldowns[skill.id] && now < player.skillCooldowns[skill.id]) {
        return;
    }
    
    // 检查能量
    if (player.energy < skill.energyCost) {
        return;
    }
    
    player.energy -= skill.energyCost;
    player.skillCooldowns[skill.id] = now + skill.cooldown;
    
    // 释放技能
    switch(skill.id) {
        // ⚡ 皮卡丘技能
        case 'thunder_shock':
            useThunderShock(skill, player);
            break;
        case 'thunderbolt':
            useThunderbolt(skill, player);
            break;
        case 'quick_attack':
            useQuickAttack(skill, player);
            break;
        case 'iron_tail':
            useIronTail(skill, player);
            break;
        // 🐉 小火龙技能
        case 'ember':
            useEmber(skill, player);
            break;
        case 'flamethrower':
            useFlamethrower(skill, player);
            break;
        case 'dragon_claw':
            useDragonClaw(skill, player);
            break;
        case 'fire_spin':
            useFireSpin(skill, player);
            break;
    }
}

function useThunderShock(skill, player) {
    // 播放音效
    playSound('skill_q', player);
    
    // 创建持续伤害区域（玩家身边 4x4 范围，受强化影响）
    const buffedRange = skill.range * skillBuffs.q_range;
    const buffedDuration = (skill.duration / 1000) * skillBuffs.q_duration;
    
    skillZones.push({
        type: 'thunder_shock',
        x: player.x,
        y: player.y,
        radius: buffedRange,
        damage: skill.damage, // 每秒伤害
        duration: buffedDuration, // 秒
        life: buffedDuration,
        color: skill.color,
        damageTimer: 0
    });
    
    // 初始效果
    effects.push({
        type: 'thunder_shock_start',
        x: player.x,
        y: player.y,
        life: 0.3,
        color: skill.color
    });
}

function useThunderbolt(skill, player) {
    // 播放音效
    playSound('skill_w', player);
    
    // 全屏 AOE
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.hp -= skill.damage;
        addDamageNumber(enemy.x, enemy.y, skill.damage.toString(), skill.color);
        
        if (enemy.hp <= 0) {
            gameState.score += enemy.score;
            gameState.kills++;
            enemies.splice(i, 1); // 移除死亡的敌人
            if (Math.random() < 0.3) spawnItem(enemy.x, enemy.y);
        }
    }
    
    effects.push({
        type: 'thunderbolt',
        x: 0,
        y: 0,
        life: 0.5,
        color: skill.color
    });
}

function useQuickAttack(skill, player) {
    // 播放音效
    playSound('skill_e', player);
    
    const dx = player.direction.x || 0;
    const dy = player.direction.y || 1;
    player.x += dx * skill.dashDistance * CONFIG.TILE_SIZE;
    player.y += dy * skill.dashDistance * CONFIG.TILE_SIZE;
    player.invincible = skill.invincible;
    
    effects.push({
        type: 'dash',
        x: player.x,
        y: player.y,
        life: 0.3,
        color: skill.color
    });
}

function useIronTail(skill, player) {
    // 播放音效
    playSound('skill_r', player);
    
    // 360 度近战
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < skill.range) {
            enemy.hp -= skill.damage;
            addDamageNumber(enemy.x, enemy.y, skill.damage.toString(), skill.color);
            playSound('hit');
            
            if (skill.knockback) {
                enemy.x += (dx / dist) * 50;
                enemy.y += (dy / dist) * 50;
            }
            
            if (enemy.hp <= 0) {
                gameState.score += enemy.score;
                gameState.kills++;
                playSound('enemy_death');
                enemies.splice(i, 1); // 移除死亡的敌人
                if (Math.random() < 0.3) spawnItem(enemy.x, enemy.y);
            }
        }
    }
    
    effects.push({
        type: 'iron_tail',
        x: player.x,
        y: player.y,
        life: 0.3,
        color: skill.color
    });
}

// 🐉 小火龙技能实现
function useEmber(skill, player) {
    // 播放音效
    playSound('skill_q', player);
    
    // 创建持续伤害区域（火焰环绕）
    const buffedRange = skill.range * skillBuffs.q_range;
    const buffedDuration = (skill.duration / 1000) * skillBuffs.q_duration;
    
    skillZones.push({
        type: 'ember',
        x: player.x,
        y: player.y,
        radius: buffedRange,
        damage: skill.damage,
        duration: buffedDuration,
        life: buffedDuration,
        color: skill.color,
        damageTimer: 0
    });
    
    effects.push({
        type: 'ember_start',
        x: player.x,
        y: player.y,
        life: 0.3,
        color: skill.color
    });
    
    // 生成环绕火焰粒子
    const centerX = player.x + CONFIG.TILE_SIZE / 2;
    const centerY = player.y + CONFIG.TILE_SIZE / 2;
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = buffedRange * 0.8;
        fireParticles.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: Math.cos(angle + Math.PI / 2) * 2,
            vy: Math.sin(angle + Math.PI / 2) * 2,
            size: 4 + Math.random() * 4,
            color: `rgba(255, 107, 53, ALPHA)`,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1
        });
    }
}

function useFlamethrower(skill, player) {
    // 播放音效
    playSound('skill_w', player);
    
    // 前方扇形火焰喷射
    const angle = player.direction.y >= 0 ? 0 : Math.PI; // 面向方向
    const range = skill.range;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 检查是否在前方扇形范围内
        if (dist <= range) {
            const enemyAngle = Math.atan2(dy, dx);
            const angleDiff = Math.abs(enemyAngle - angle);
            
            if (angleDiff < skill.angle / 2 || angleDiff > Math.PI * 2 - skill.angle / 2) {
                enemy.hp -= skill.damage;
                addDamageNumber(enemy.x, enemy.y, skill.damage.toString(), skill.color);
                playSound('hit');
                
                // 灼烧效果
                if (skill.burn) {
                    // 可以添加持续灼烧伤害
                }
                
                if (enemy.hp <= 0) {
                    gameState.score += enemy.score;
                    gameState.kills++;
                    playSound('enemy_death');
                    enemies.splice(i, 1);
                    if (Math.random() < 0.3) spawnItem(enemy.x, enemy.y);
                }
            }
        }
    }
    
    effects.push({
        type: 'flamethrower',
        x: player.x,
        y: player.y,
        life: 0.5,
        color: skill.color,
        angle: angle
    });
    
    // 生成扇形火焰粒子
    const centerX = player.x + CONFIG.TILE_SIZE / 2;
    const centerY = player.y + CONFIG.TILE_SIZE / 2;
    for (let i = 0; i < 30; i++) {
        const spreadAngle = (Math.random() - 0.5) * skill.angle;
        const speed = 3 + Math.random() * 4;
        fireParticles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle + spreadAngle) * speed,
            vy: Math.sin(angle + spreadAngle) * speed,
            size: 5 + Math.random() * 5,
            color: `rgba(255, 69, 0, ALPHA)`,
            life: 0.3 + Math.random() * 0.3,
            maxLife: 0.6
        });
    }
}

function useDragonClaw(skill, player) {
    // 播放音效
    playSound('skill_e', player);
    
    const dx = player.direction.x || 0;
    const dy = player.direction.y || 1;
    player.x += dx * skill.dashDistance * CONFIG.TILE_SIZE;
    player.y += dy * skill.dashDistance * CONFIG.TILE_SIZE;
    player.invincible = skill.invincible;
    
    // 对周围敌人造成伤害
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const edx = enemy.x - player.x;
        const edy = enemy.y - player.y;
        const dist = Math.sqrt(edx * edx + edy * edy);
        
        if (dist < skill.range) {
            enemy.hp -= skill.damage;
            addDamageNumber(enemy.x, enemy.y, skill.damage.toString(), skill.color);
            playSound('hit');
            
            if (enemy.hp <= 0) {
                gameState.score += enemy.score;
                gameState.kills++;
                playSound('enemy_death');
                enemies.splice(i, 1);
                if (Math.random() < 0.3) spawnItem(enemy.x, enemy.y);
            }
        }
    }
    
    effects.push({
        type: 'dragon_claw',
        x: player.x,
        y: player.y,
        life: 0.3,
        color: skill.color
    });
    
    // 生成冲刺轨迹粒子
    const endX = player.x + CONFIG.TILE_SIZE / 2;
    const endY = player.y + CONFIG.TILE_SIZE / 2;
    for (let i = 0; i < 25; i++) {
        const t = i / 25;
        fireParticles.push({
            x: endX - (player.direction.x || 0) * skill.dashDistance * CONFIG.TILE_SIZE * t,
            y: endY - (player.direction.y || 1) * skill.dashDistance * CONFIG.TILE_SIZE * t,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: 6 + Math.random() * 4,
            color: `rgba(255, 140, 0, ALPHA)`,
            life: 0.4 + Math.random() * 0.3,
            maxLife: 0.7
        });
    }
    
    // 终点爆炸粒子
    for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        fireParticles.push({
            x: endX,
            y: endY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 4 + Math.random() * 4,
            color: `rgba(255, 69, 0, ALPHA)`,
            life: 0.6 + Math.random() * 0.4,
            maxLife: 1
        });
    }
}

function useFireSpin(skill, player) {
    // 播放音效
    playSound('skill_r', player);
    
    // 创建火焰旋涡区域
    const buffedRange = skill.range * skillBuffs.q_range;
    const buffedDuration = (skill.duration / 1000) * skillBuffs.q_duration;
    
    skillZones.push({
        type: 'fire_spin',
        x: player.x,
        y: player.y,
        radius: buffedRange,
        damage: skill.damage,
        duration: buffedDuration,
        life: buffedDuration,
        color: skill.color,
        damageTimer: 0,
        knockback: skill.knockback
    });
    
    effects.push({
        type: 'fire_spin',
        x: player.x,
        y: player.y,
        life: 0.5,
        color: skill.color
    });
    
    // 生成旋涡火焰粒子
    const centerX = player.x + CONFIG.TILE_SIZE / 2;
    const centerY = player.y + CONFIG.TILE_SIZE / 2;
    for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * buffedRange * 0.8;
        const tangentSpeed = 2;
        const inwardSpeed = 0.5;
        fireParticles.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: -Math.sin(angle) * tangentSpeed - Math.cos(angle) * inwardSpeed,
            vy: Math.cos(angle) * tangentSpeed - Math.sin(angle) * inwardSpeed,
            size: 5 + Math.random() * 5,
            color: `rgba(220, 20, 60, ALPHA)`,
            life: 0.8 + Math.random() * 0.6,
            maxLife: 1.4
        });
    }
}

// ==================== 渲染 ====================
function render() {
    const ctx = gameState.ctx;
    const levelConfig = LEVELS[Math.min(gameState.level - 1, 2)];
    const mapWidthPx = levelConfig.mapWidth * CONFIG.TILE_SIZE;
    const mapHeightPx = levelConfig.mapHeight * CONFIG.TILE_SIZE;
    
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // 计算摄像机偏移（双人模式：两个玩家中间，单人模式：跟随玩家 1）
    let cameraX, cameraY;
    if (gameState.playerCount === 2) {
        // 双人模式：摄像机在两个玩家中间
        cameraX = (player1.x + player2.x) / 2 - CONFIG.CANVAS_WIDTH / 2 + CONFIG.TILE_SIZE / 2;
        cameraY = (player1.y + player2.y) / 2 - CONFIG.CANVAS_HEIGHT / 2 + CONFIG.TILE_SIZE / 2;
    } else {
        // 单人模式：跟随玩家 1
        cameraX = player1.x - CONFIG.CANVAS_WIDTH / 2 + CONFIG.TILE_SIZE / 2;
        cameraY = player1.y - CONFIG.CANVAS_HEIGHT / 2 + CONFIG.TILE_SIZE / 2;
    }
    
    // 限制摄像机在地图范围内
    cameraX = Math.max(0, Math.min(cameraX, mapWidthPx - CONFIG.CANVAS_WIDTH));
    cameraY = Math.max(0, Math.min(cameraY, mapHeightPx - CONFIG.CANVAS_HEIGHT));
    
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    
    // 渲染地图
    renderMap(ctx);
    
    // 渲染物品
    renderItems(ctx);
    
    // 渲染敌人
    renderEnemies(ctx);
    
    // 渲染玩家（双人模式渲染两个）
    renderPlayer(ctx, player1);
    if (gameState.playerCount === 2) {
        renderPlayer(ctx, player2);
    }
    
    // 渲染投射物
    renderProjectiles(ctx);
    
    // 渲染效果
    renderEffects(ctx);
    
    // 渲染伤害数字
    renderDamageNumbers(ctx);
    
    // 渲染技能区域
    renderSkillZones(ctx);
    
    ctx.restore();
    
    // 渲染小地图（在 UI 上）
    renderMinimap(ctx, cameraX, cameraY, mapWidthPx, mapHeightPx);
}

function renderMap(ctx) {
    const levelConfig = LEVELS[Math.min(gameState.level - 1, 2)];
    
    for (let y = 0; y < levelConfig.mapHeight; y++) {
        for (let x = 0; x < levelConfig.mapWidth; x++) {
            const tile = map[y][x];
            const terrain = TERRAIN[tile.type];
            
            ctx.font = `${CONFIG.TILE_SIZE}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(terrain.emoji, tile.x + CONFIG.TILE_SIZE / 2, tile.y + CONFIG.TILE_SIZE / 2);
        }
    }
}

function renderPlayer(ctx, player) {
    const size = CONFIG.TILE_SIZE;
    const x = player.x;
    const y = player.y;
    const hero = HEROES[player.hero || 'pikachu'];
    
    // 闪烁效果（无敌时）
    if (player.invincible > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
        return;
    }
    
    // 玩家 2 添加蓝色边框区分
    if (player.id === 2) {
        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
    }
    
    // 根据英雄绘制不同角色
    if (player.hero === 'charmander') {
        // 🐉 小火龙绘制
        // 身体（橙色）
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(x + 4, y + 8, size - 8, size - 10);
        
        // 头部
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(x + 6, y + 4, size - 12, 10);
        
        // 眼睛
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 10, y + 8, 3, 3);
        ctx.fillRect(x + size - 13, y + 8, 3, 3);
        
        // 尾巴火焰
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(x, y + size / 2);
        ctx.lineTo(x - 12, y + size / 2 - 6);
        ctx.lineTo(x - 8, y + size / 2 + 2);
        ctx.lineTo(x - 15, y + size / 2 + 6);
        ctx.fill();
        
        // 火焰效果（黄色核心）
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(x - 2, y + size / 2);
        ctx.lineTo(x - 8, y + size / 2 - 3);
        ctx.lineTo(x - 6, y + size / 2 + 2);
        ctx.fill();
    } else {
        // ⚡ 皮卡丘绘制
        // 身体（黄色）
        ctx.fillStyle = '#F8D030';
        ctx.fillRect(x + 4, y + 8, size - 8, size - 10);
        
        // 耳朵
        ctx.fillStyle = '#F8D030';
        ctx.fillRect(x + 4, y, 6, 12);
        ctx.fillRect(x + size - 10, y, 6, 12);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 4, y, 3, 6);
        ctx.fillRect(x + size - 10, y, 3, 6);
        
        // 脸颊
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + 2, y + 12, 5, 5);
        ctx.fillRect(x + size - 7, y + 12, 5, 5);
        
        // 眼睛
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 8, y + 14, 4, 4);
        ctx.fillRect(x + size - 12, y + 14, 4, 4);
        
        // 尾巴
        ctx.fillStyle = '#F8D030';
        ctx.beginPath();
        ctx.moveTo(x + size, y + size / 2);
        ctx.lineTo(x + size + 10, y + size / 2 - 8);
        ctx.lineTo(x + size + 8, y + size / 2 + 4);
        ctx.lineTo(x + size + 15, y + size / 2 - 4);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + size + 12, y + size / 2 - 8, 3, 4);
    }
}

function renderEnemies(ctx) {
    enemies.forEach(enemy => {
        ctx.font = `${CONFIG.TILE_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.emoji, enemy.x + CONFIG.TILE_SIZE / 2, enemy.y + CONFIG.TILE_SIZE / 2);
        
        // 血条
        const hpPercent = enemy.hp / enemy.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x, enemy.y - 8, CONFIG.TILE_SIZE, 5);
        ctx.fillStyle = hpPercent > 0.5 ? '#4ECDC4' : hpPercent > 0.25 ? '#FFD700' : '#FF6B6B';
        ctx.fillRect(enemy.x, enemy.y - 8, CONFIG.TILE_SIZE * hpPercent, 5);
    });
}

function renderItems(ctx) {
    items.forEach(item => {
        // 发光效果
        ctx.shadowColor = item.color || '#FFD700';
        ctx.shadowBlur = 10 + Math.sin(Date.now() / 200) * 5; // 闪烁
        ctx.font = `${CONFIG.TILE_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, item.x + CONFIG.TILE_SIZE / 2, item.y + CONFIG.TILE_SIZE / 2);
        ctx.shadowBlur = 0;
    });
}

function renderProjectiles(ctx) {
    projectiles.forEach(proj => {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 发光效果
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function renderEffects(ctx) {
    effects.forEach(effect => {
        if (effect.type === 'thunderbolt') {
            // 全屏闪电效果
            ctx.fillStyle = `rgba(255, 215, 0, ${effect.life * 2})`;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH * 3, CONFIG.CANVAS_HEIGHT * 3);
        } else if (effect.type === 'skill' || effect.type === 'dash' || effect.type === 'iron_tail') {
            ctx.fillStyle = effect.color;
            ctx.globalAlpha = effect.life;
            ctx.beginPath();
            ctx.arc(effect.x + CONFIG.TILE_SIZE / 2, effect.y + CONFIG.TILE_SIZE / 2, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        // 🐉 小火龙技能效果
        else if (effect.type === 'ember_start') {
            // 火花环绕爆发效果
            ctx.save();
            ctx.globalAlpha = effect.life * 2;
            ctx.fillStyle = '#FF6B35';
            ctx.beginPath();
            ctx.arc(effect.x + CONFIG.TILE_SIZE / 2, effect.y + CONFIG.TILE_SIZE / 2, 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        else if (effect.type === 'flamethrower') {
            // 扇形火焰喷射
            ctx.save();
            ctx.translate(effect.x + CONFIG.TILE_SIZE / 2, effect.y + CONFIG.TILE_SIZE / 2);
            ctx.rotate(effect.angle || 0);
            
            // 绘制扇形区域
            const alpha = effect.life * 2;
            const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 200);
            gradient.addColorStop(0, `rgba(255, 69, 0, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 200, -Math.PI / 6, Math.PI / 6);
            ctx.closePath();
            ctx.fill();
            
            // 火焰粒子效果
            for (let i = 0; i < 10; i++) {
                const angle = (Math.random() - 0.5) * Math.PI / 3;
                const dist = Math.random() * 150;
                const size = 5 + Math.random() * 8;
                ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${alpha * (1 - dist / 200)})`;
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        else if (effect.type === 'dragon_claw') {
            // 龙之爪冲刺轨迹 + 爆炸
            ctx.save();
            ctx.globalAlpha = effect.life * 2;
            
            // 爪痕轨迹
            ctx.strokeStyle = 'rgba(255, 140, 0, 0.6)';
            ctx.lineWidth = 25;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(effect.x - 80, effect.y + CONFIG.TILE_SIZE / 2);
            ctx.lineTo(effect.x + CONFIG.TILE_SIZE / 2, effect.y + CONFIG.TILE_SIZE / 2);
            ctx.stroke();
            
            // 爆炸效果
            ctx.fillStyle = 'rgba(255, 69, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(effect.x + CONFIG.TILE_SIZE / 2, effect.y + CONFIG.TILE_SIZE / 2, 50 * (1 - effect.life), 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        else if (effect.type === 'fire_spin') {
            // 火焰旋涡爆发效果
            ctx.save();
            ctx.globalAlpha = effect.life * 2;
            
            // 多层旋涡
            for (let ring = 0; ring < 3; ring++) {
                const radius = 30 + ring * 25;
                const rotation = Date.now() / 200 + ring;
                ctx.strokeStyle = `rgba(220, 20, 60, ${0.6 - ring * 0.15})`;
                ctx.lineWidth = 8;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = rotation + (i / 6) * Math.PI * 2;
                    const x = effect.x + CONFIG.TILE_SIZE / 2 + Math.cos(angle) * radius;
                    const y = effect.y + CONFIG.TILE_SIZE / 2 + Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();
        }
    });
    
    // 渲染火焰粒子
    renderFireParticles(ctx);
}

function renderDamageNumbers(ctx) {
    damageNumbers.forEach(dn => {
        ctx.fillStyle = dn.color;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dn.text, dn.x + CONFIG.TILE_SIZE / 2, dn.y);
    });
}

// 🐉 火焰粒子渲染
function renderFireParticles(ctx) {
    fireParticles.forEach(p => {
        const alpha = p.life / p.maxLife;
        
        // 发光效果
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        
        // 粒子主体
        ctx.fillStyle = p.color.replace('ALPHA', alpha.toFixed(2));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 内层亮色
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.shadowBlur = 0;
}

function renderSkillZones(ctx) {
    skillZones.forEach(zone => {
        if (zone.type === 'thunder_shock') {
            // 绘制圆形闪电区域
            const alpha = 0.3 + 0.2 * Math.sin(Date.now() / 100); // 闪烁效果
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(zone.x + CONFIG.TILE_SIZE / 2, zone.y + CONFIG.TILE_SIZE / 2, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 边缘发光
            ctx.strokeStyle = `rgba(255, 215, 0, ${alpha + 0.3})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // 闪电纹路
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            for (let i = 0; i < 5; i++) {
                const angle = (Date.now() / 200 + i * 72) * Math.PI / 180;
                const r = zone.radius * 0.5;
                ctx.beginPath();
                ctx.arc(
                    zone.x + CONFIG.TILE_SIZE / 2 + Math.cos(angle) * r,
                    zone.y + CONFIG.TILE_SIZE / 2 + Math.sin(angle) * r,
                    5, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        // 🐉 小火龙 - 火花环绕区域
        else if (zone.type === 'ember') {
            const alpha = 0.25 + 0.15 * Math.sin(Date.now() / 150);
            
            // 火焰区域背景
            ctx.fillStyle = `rgba(255, 107, 53, ${alpha})`;
            ctx.beginPath();
            ctx.arc(zone.x + CONFIG.TILE_SIZE / 2, zone.y + CONFIG.TILE_SIZE / 2, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 边缘发光
            ctx.strokeStyle = `rgba(255, 69, 0, ${alpha + 0.3})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // 旋转的火焰纹路
            ctx.fillStyle = `rgba(255, 200, 50, ${alpha * 0.6})`;
            for (let i = 0; i < 6; i++) {
                const angle = (Date.now() / 300 + i * 60) * Math.PI / 180;
                const r = zone.radius * (0.3 + 0.4 * Math.sin(Date.now() / 500 + i));
                ctx.beginPath();
                ctx.arc(
                    zone.x + CONFIG.TILE_SIZE / 2 + Math.cos(angle) * r,
                    zone.y + CONFIG.TILE_SIZE / 2 + Math.sin(angle) * r,
                    6, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        // 🐉 小火龙 - 火焰旋涡区域
        else if (zone.type === 'fire_spin') {
            const alpha = 0.3 + 0.2 * Math.sin(Date.now() / 200);
            
            // 旋涡背景
            const gradient = ctx.createRadialGradient(
                zone.x + CONFIG.TILE_SIZE / 2, zone.y + CONFIG.TILE_SIZE / 2, 0,
                zone.x + CONFIG.TILE_SIZE / 2, zone.y + CONFIG.TILE_SIZE / 2, zone.radius
            );
            gradient.addColorStop(0, `rgba(255, 69, 0, ${alpha * 0.8})`);
            gradient.addColorStop(0.5, `rgba(220, 20, 60, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zone.x + CONFIG.TILE_SIZE / 2, zone.y + CONFIG.TILE_SIZE / 2, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 旋转的火焰臂
            ctx.save();
            ctx.translate(zone.x + CONFIG.TILE_SIZE / 2, zone.y + CONFIG.TILE_SIZE / 2);
            ctx.rotate(Date.now() / 400);
            for (let arm = 0; arm < 4; arm++) {
                ctx.rotate(Math.PI / 2);
                ctx.strokeStyle = `rgba(255, 140, 0, ${alpha})`;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(
                    zone.radius * 0.5, zone.radius * 0.3,
                    zone.radius * 0.8, zone.radius * 0.1
                );
                ctx.stroke();
            }
            ctx.restore();
            
            // 边缘火花
            ctx.fillStyle = `rgba(255, 200, 50, ${alpha * 0.8})`;
            for (let i = 0; i < 8; i++) {
                const angle = (Date.now() / 300 + i * 45) * Math.PI / 180;
                ctx.beginPath();
                ctx.arc(
                    zone.x + CONFIG.TILE_SIZE / 2 + Math.cos(angle) * zone.radius * 0.7,
                    zone.y + CONFIG.TILE_SIZE / 2 + Math.sin(angle) * zone.radius * 0.7,
                    5, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
    });
}

function renderMinimap(ctx, cameraX, cameraY, mapWidthPx, mapHeightPx) {
    const minimapSize = 120;
    const margin = 10;
    const minX = CONFIG.CANVAS_WIDTH - minimapSize - margin;
    const minY = margin;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(minX, minY, minimapSize, minimapSize);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(minX, minY, minimapSize, minimapSize);
    
    const levelConfig = LEVELS[Math.min(gameState.level - 1, 2)];
    const scale = minimapSize / Math.max(mapWidthPx, mapHeightPx);
    
    // 绘制敌人（红点）
    ctx.fillStyle = '#FF6B6B';
    enemies.forEach(enemy => {
        const ex = minX + enemy.x * scale;
        const ey = minY + enemy.y * scale;
        ctx.fillRect(ex - 2, ey - 2, 4, 4);
    });
    
    // 绘制道具（彩色点）
    items.forEach(item => {
        const ix = minX + item.x * scale;
        const iy = minY + item.y * scale;
        ctx.fillStyle = item.color || '#FFD700';
        ctx.beginPath();
        ctx.arc(ix, iy, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制玩家（黄点）
    ctx.fillStyle = '#FFD700';
    const px = minX + player.x * scale;
    const py = minY + player.y * scale;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制摄像机范围（白色框）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
        minX + cameraX * scale,
        minY + cameraY * scale,
        CONFIG.CANVAS_WIDTH * scale,
        CONFIG.CANVAS_HEIGHT * scale
    );
    
    // 标签
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('地图', minX + minimapSize / 2, minY + minimapSize + 12);
}

function updateUI() {
    // 英雄显示（双人模式显示两个）
    const hero1 = HEROES[player1.hero || 'pikachu'];
    const heroDisplay = document.getElementById('hero-name');
    if (heroDisplay) {
        if (gameState.playerCount === 2) {
            const hero2 = HEROES[player2.hero || 'charmander'];
            heroDisplay.textContent = `👤1: ${hero1.emoji} ${hero1.name}  |  👤2: ${hero2.emoji} ${hero2.name}`;
        } else {
            heroDisplay.textContent = `${hero1.emoji} ${hero1.name}`;
        }
    }
    
    document.getElementById('level-display').textContent = gameState.level;
    document.getElementById('score-display').textContent = gameState.score;
    document.getElementById('time-display').textContent = Math.floor(gameState.levelTime);
    
    // 血条（显示玩家 1 的）
    const hpPercent = (player1.hp / player1.maxHp) * 100;
    document.getElementById('health-fill').style.width = `${Math.max(0, hpPercent)}%`;
    document.getElementById('health-text').textContent = `${Math.ceil(player1.hp)}/${player1.maxHp}`;
    
    // 能量条（显示玩家 1 的）
    const energyPercent = (player1.energy / player1.maxEnergy) * 100;
    document.getElementById('energy-fill').style.width = `${energyPercent}%`;
    document.getElementById('energy-text').textContent = `${Math.floor(player1.energy)}/${player1.maxEnergy}`;
    
    // 技能冷却（显示所有 4 个技能槽）
    const now = Date.now();
    const allSkillKeys = ['q', 'w', 'e', 'r'];
    
    allSkillKeys.forEach(key => {
        const slot = document.getElementById(`skill-${key}`);
        if (slot) {
            const bar = slot.querySelector('.cooldown-bar');
            const nameEl = slot.querySelector('.skill-name');
            
            // 找到对应的技能
            const skill = player1.skills.find(s => s.key.toLowerCase() === key);
            
            if (skill) {
                // 有该技能，显示名称
                if (nameEl) {
                    nameEl.textContent = skill.name;
                }
                
                const cooldown = player1.skillCooldowns[skill.id] || 0;
                
                if (cooldown > now) {
                    slot.classList.add('on-cooldown');
                    const remaining = cooldown - now;
                    const percent = (remaining / skill.cooldown) * 100;
                    bar.style.height = `${percent}%`;
                } else {
                    slot.classList.remove('on-cooldown');
                    bar.style.height = '0%';
                }
            } else {
                // 没有该技能，隐藏或显示为空
                if (nameEl) {
                    nameEl.textContent = '-';
                }
                bar.style.height = '0%';
                slot.classList.remove('on-cooldown');
                slot.style.opacity = '0.5';
            }
        }
    });
}

function toggleMute() {
    soundEnabled = !soundEnabled;
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.textContent = soundEnabled ? '🔊' : '🔇';
    }
    if (soundEnabled && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenName === 'game' ? 'game-screen' : 
                          screenName === 'main-menu' ? 'main-menu' :
                          screenName === 'mode-select' ? 'mode-select' :
                          screenName === 'skill-select' ? 'skill-select' :
                          screenName === 'level-complete' ? 'level-complete' :
                          screenName === 'game-over' ? 'game-over' : 'pause-screen'
    ).classList.add('active');
}

// 启动游戏
window.addEventListener('load', init);
