// Arena Battle - Pre Demo v0.3
// 와일드리프트 스타일 - 자동 기본공격

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 반응형 캔버스 크기
function resizeCanvas() {
    const wrapper = document.getElementById('gameWrapper');
    const aspectRatio = 2.5; // 가로:세로 비율
    
    let width = wrapper.clientWidth;
    let height = wrapper.clientHeight;
    
    // 비율 유지
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }
    
    canvas.width = Math.min(1000, width);
    canvas.height = Math.min(400, height);
    
    // lane 경계 재계산
    lane.left = 50;
    lane.right = canvas.width - 50;
    lane.top = canvas.height * 0.25;
    lane.bottom = canvas.height * 0.75;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));

// Game State
const game = {
    running: true,
    keys: {},
    mouse: { x: 500, y: 200 }
};

// 라인 경계
const lane = {
    top: 100,
    bottom: 300,
    left: 50,
    right: 950
};

// 사막 배경 요소
const desertProps = {
    dunes: [],
    cacti: [],
    rocks: []
};

function generateDesertProps() {
    desertProps.dunes = [];
    desertProps.cacti = [];
    desertProps.rocks = [];
    
    for (let i = 0; i < 8; i++) {
        desertProps.dunes.push({
            x: Math.random() * canvas.width,
            y: 50 + Math.random() * (canvas.height - 100),
            width: 80 + Math.random() * 120,
            height: 20 + Math.random() * 30,
            shade: Math.random() * 0.1
        });
    }
    for (let i = 0; i < 5; i++) {
        desertProps.cacti.push({
            x: 100 + Math.random() * (canvas.width - 200),
            y: 20 + Math.random() * 40,
            height: 20 + Math.random() * 15
        });
    }
    for (let i = 0; i < 6; i++) {
        desertProps.rocks.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 60 + Math.random() * 40,
            size: 8 + Math.random() * 15
        });
    }
}

// Player (치즈)
const player = {
    x: 100,
    y: 200,
    radius: 20,
    speed: 3.5,
    hp: 100,
    maxHp: 100,
    color: '#FFD700',  // 치즈 색
    targetX: null,
    targetY: null,
    attackTarget: null,
    autoAttack: false,
    isAttacking: false,
    attackDirection: { x: 1, y: 0 },  // 기본공격 방향 (조이스틱 방향)
    attackRange: 200,  // 기본공격 사거리
    attackCooldown: 0,
    attackDamage: 5,  // 기본공격 데미지 낮춤
    skills: {
        q: { cooldown: 0, maxCooldown: 60, name: '파이어볼', damage: 30, range: 350 },
        w: { cooldown: 0, maxCooldown: 90, name: '모래폭풍', damage: 20, range: 100 },
        e: { cooldown: 0, maxCooldown: 120, name: '대시', damage: 0, range: 130 },
        r: { cooldown: 0, maxCooldown: 300, name: '사막의 분노', damage: 50, range: 300 }
    },
    skillAiming: null  // { active: true, skill: 'q', direction: {x, y} }
};

// Enemy (고양이)
const enemy = {
    x: 900,
    y: 200,
    radius: 22,
    speed: 2.2,
    hp: 300,
    maxHp: 300,
    color: '#FF6B35',  // 고양이 색
    state: 'chase',
    attackCooldown: 0,
    attackRange: 100,  // 사거리 감소 (150 -> 100)
    attackDamage: 10,
    stateTimer: 0,
    skillCooldown: 0  // 원형 공격 스킬
};

// Projectiles & Effects
const projectiles = [];
const effects = [];
let sandstorm = null;

// Initialize
resizeCanvas();
generateDesertProps();

// Input handlers (PC)
document.addEventListener('keydown', e => {
    game.keys[e.key.toLowerCase()] = true;
    if ('qwer'.includes(e.key.toLowerCase())) {
        useSkill(e.key.toLowerCase());
    }
});

document.addEventListener('keyup', e => {
    game.keys[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    game.mouse.x = (e.clientX - rect.left) * scaleX;
    game.mouse.y = (e.clientY - rect.top) * scaleY;
});

// 우클릭: 이동 또는 공격
canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (!game.running) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    const distToEnemy = Math.sqrt((clickX - enemy.x) ** 2 + (clickY - enemy.y) ** 2);
    
    if (distToEnemy < enemy.radius + 25) {
        player.attackTarget = enemy;
        player.targetX = null;
        player.targetY = null;
    } else {
        player.attackTarget = null;
        player.targetX = Math.max(lane.left, Math.min(lane.right, clickX));
        player.targetY = Math.max(lane.top, Math.min(lane.bottom, clickY));
        
        effects.push({
            type: 'click',
            x: player.targetX,
            y: player.targetY,
            life: 20
        });
    }
});

document.getElementById('restartBtn').addEventListener('click', restartGame);

// Skills (전역 함수로 노출)
window.useSkill = function(key) {
    if (!game.running) return;
    const skill = player.skills[key];
    if (!skill || skill.cooldown > 0) return;
    
    if (key === 'q') {
        const angle = Math.atan2(game.mouse.y - player.y, game.mouse.x - player.x);
        shootProjectile(player.x, player.y, 
            player.x + Math.cos(angle) * 800, 
            player.y + Math.sin(angle) * 800, 
            'player', skill.damage, '#ff6b35', 14);
        skill.cooldown = skill.maxCooldown;
    }
    else if (key === 'w') {
        // 지시선 끝점에 발동 (사거리 100px)
        const angle = Math.atan2(game.mouse.y - player.y, game.mouse.x - player.x);
        const dist = Math.sqrt((game.mouse.x - player.x) ** 2 + (game.mouse.y - player.y) ** 2);
        const maxRange = skill.range || 100;
        const spawnDist = Math.min(dist, maxRange);  // 지시선 위치 (최대 100px)
        
        sandstorm = {
            x: player.x + Math.cos(angle) * spawnDist,
            y: player.y + Math.sin(angle) * spawnDist,
            radius: 65,
            duration: 120,
            damage: 2,
            owner: 'player'
        };
        skill.cooldown = skill.maxCooldown;
    }
    else if (key === 'e') {
        const angle = Math.atan2(game.mouse.y - player.y, game.mouse.x - player.x);
        let newX = player.x + Math.cos(angle) * 130;
        let newY = player.y + Math.sin(angle) * 130;
        
        player.x = Math.max(lane.left, Math.min(lane.right, newX));
        player.y = Math.max(lane.top, Math.min(lane.bottom, newY));
        player.targetX = null;
        player.targetY = null;
        
        effects.push({ type: 'dash', x: player.x, y: player.y, life: 15 });
        skill.cooldown = skill.maxCooldown;
    }
    else if (key === 'r') {
        const baseAngle = Math.atan2(game.mouse.y - player.y, game.mouse.x - player.x);
        for (let i = -2; i <= 2; i++) {
            const angle = baseAngle + (i * 0.2);
            shootProjectile(player.x, player.y,
                player.x + Math.cos(angle) * 600,
                player.y + Math.sin(angle) * 600,
                'player', skill.damage / 2, '#ffd700', 12);
        }
        effects.push({ type: 'shake', intensity: 8, life: 15 });
        skill.cooldown = skill.maxCooldown;
    }
};

// 치즈 그리기
function drawCheese(x, y, r) {
    // 치즈 몸통 (삼각형 웨지)
    ctx.beginPath();
    ctx.moveTo(x - r, y + r * 0.7);
    ctx.lineTo(x + r, y + r * 0.7);
    ctx.lineTo(x, y - r);
    ctx.closePath();
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 치즈 구멍
    ctx.beginPath();
    ctx.arc(x - 5, y + 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFA500';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + 6, y - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFA500';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x - 2, y + 10, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFA500';
    ctx.fill();
    
    // 눈 (귀여운 표정)
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + 5, y - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 5, y - 4, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // 입
    ctx.beginPath();
    ctx.arc(x, y + 3, 2, 0, Math.PI);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

// 고양이 그리기
function drawCat(x, y, r) {
    // 귀
    ctx.beginPath();
    ctx.moveTo(x - r * 0.8, y - r * 0.3);
    ctx.lineTo(x - r * 0.5, y - r * 1.1);
    ctx.lineTo(x - r * 0.1, y - r * 0.3);
    ctx.fillStyle = '#FF6B35';
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + r * 0.8, y - r * 0.3);
    ctx.lineTo(x + r * 0.5, y - r * 1.1);
    ctx.lineTo(x + r * 0.1, y - r * 0.3);
    ctx.fillStyle = '#FF6B35';
    ctx.fill();
    
    // 귀 안쪽 (핑크)
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - r * 0.3);
    ctx.lineTo(x - r * 0.5, y - r * 0.85);
    ctx.lineTo(x - r * 0.2, y - r * 0.3);
    ctx.fillStyle = '#FFB6C1';
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + r * 0.7, y - r * 0.3);
    ctx.lineTo(x + r * 0.5, y - r * 0.85);
    ctx.lineTo(x + r * 0.2, y - r * 0.3);
    ctx.fillStyle = '#FFB6C1';
    ctx.fill();
    
    // 얼굴
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FF6B35';
    ctx.fill();
    ctx.strokeStyle = '#CC5522';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 눈 (날카로운 고양이 눈)
    ctx.beginPath();
    ctx.ellipse(x - 6, y - 3, 4, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#90EE90';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 6, y - 3, 2, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(x + 6, y - 3, 4, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#90EE90';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 6, y - 3, 2, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    
    // 코
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x - 3, y + 6);
    ctx.lineTo(x + 3, y + 6);
    ctx.closePath();
    ctx.fillStyle = '#FFB6C1';
    ctx.fill();
    
    // 수염
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    // 왼쪽
    ctx.beginPath(); ctx.moveTo(x - 8, y + 3); ctx.lineTo(x - 18, y + 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 8, y + 6); ctx.lineTo(x - 18, y + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 8, y + 9); ctx.lineTo(x - 18, y + 11); ctx.stroke();
    // 오른쪽
    ctx.beginPath(); ctx.moveTo(x + 8, y + 3); ctx.lineTo(x + 18, y + 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 8, y + 6); ctx.lineTo(x + 18, y + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 8, y + 9); ctx.lineTo(x + 18, y + 11); ctx.stroke();
}

function shootProjectile(fromX, fromY, toX, toY, owner, damage, color, size) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    projectiles.push({
        x: fromX,
        y: fromY,
        vx: Math.cos(angle) * 10,
        vy: Math.sin(angle) * 10,
        radius: size,
        damage: damage,
        owner: owner,
        color: color,
        life: 80
    });
}

// Player Update (듀얼 조이스틱 - 공격 조이스틱 놓으면 발사)
function updatePlayer() {
    const distToEnemy = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
    
    // 공격 조이스틱 놓았을 때 발사
    if (player.isAttacking && player.attackCooldown <= 0) {
        let targetX, targetY;
        if (player.attackDirection.x !== 0 || player.attackDirection.y !== 0) {
            targetX = player.x + player.attackDirection.x * 400;
            targetY = player.y + player.attackDirection.y * 400;
        } else {
            // 방향 없으면 적 방향
            targetX = enemy.x;
            targetY = enemy.y;
        }
        shootProjectile(player.x, player.y, targetX, targetY, 'player', player.attackDamage, '#FFD700', 8);
        player.attackCooldown = 15;  // 빠른 공격
        player.isAttacking = false;  // 한 발 발사 후 리셋
    }
    // 수동 타겟팅 (적 클릭)
    else if (player.attackTarget) {
        const target = player.attackTarget;
        const dist = Math.sqrt((target.x - player.x) ** 2 + (target.y - player.y) ** 2);
        
        if (dist > player.attackRange) {
            const angle = Math.atan2(target.y - player.y, target.x - player.x);
            player.x += Math.cos(angle) * player.speed;
            player.y += Math.sin(angle) * player.speed;
        } else {
            if (player.attackCooldown <= 0) {
                shootProjectile(player.x, player.y, target.x, target.y, 'player', player.attackDamage, '#4a90d9', 8);
                player.attackCooldown = 25;
            }
        }
        
        if (target.hp <= 0) player.attackTarget = null;
    }
    // 이동 타겟
    else if (player.targetX !== null && player.targetY !== null) {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
            player.x += (dx / dist) * player.speed;
            player.y += (dy / dist) * player.speed;
        } else {
            player.targetX = null;
            player.targetY = null;
        }
    }
    
    // 경계 체크
    player.x = Math.max(lane.left, Math.min(lane.right, player.x));
    player.y = Math.max(lane.top, Math.min(lane.bottom, player.y));
    
    // 쿨다운
    if (player.attackCooldown > 0) player.attackCooldown--;
    for (let key in player.skills) {
        if (player.skills[key].cooldown > 0) player.skills[key].cooldown--;
    }
}

// Enemy AI
function updateEnemy() {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    enemy.stateTimer--;
    
    // 모래폭풍 회피
    // 모래폭풍 회피 (너무 빨리 회피 안 하도록 조건 완화)
    if (sandstorm && Math.random() < 0.3) {  // 30% 확률로만 회피 시도
        const distToStorm = Math.sqrt((sandstorm.x - enemy.x) ** 2 + (sandstorm.y - enemy.y) ** 2);
        if (distToStorm < sandstorm.radius + 20) {  // 더 가까이 와야 회피
            enemy.state = 'evade';
            enemy.stateTimer = 20;  // 회피 시간도 줄임
        }
    }
    
    if (enemy.state === 'evade') {
        if (sandstorm) {
            const awayX = enemy.x - sandstorm.x;
            const awayY = enemy.y - sandstorm.y;
            const awayDist = Math.sqrt(awayX * awayX + awayY * awayY);
            if (awayDist > 0) {
                // 회피 속도 줄임 + 경계 내에서만 이동
                const newX = enemy.x + (awayX / awayDist) * enemy.speed;
                const newY = enemy.y + (awayY / awayDist) * enemy.speed;
                enemy.x = Math.max(lane.left + enemy.radius, Math.min(lane.right - enemy.radius, newX));
                enemy.y = Math.max(lane.top + enemy.radius, Math.min(lane.bottom - enemy.radius, newY));
            }
        }
        if (enemy.stateTimer <= 0) enemy.state = 'chase';
    }
    else if (enemy.hp < 25 && Math.random() < 0.02) {
        enemy.state = 'retreat';
        enemy.stateTimer = 90;
    } 
    else if (dist < enemy.attackRange) {
        enemy.state = 'attack';
    } 
    else {
        enemy.state = 'chase';
    }
    
    if (enemy.state === 'chase') {
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
    } 
    else if (enemy.state === 'retreat') {
        enemy.x -= (dx / dist) * enemy.speed * 1.2;
        if (enemy.stateTimer <= 0) enemy.state = 'chase';
    }
    else if (enemy.state === 'attack') {
        if (enemy.attackCooldown <= 0) {
            shootProjectile(enemy.x, enemy.y, player.x, player.y, 'enemy', enemy.attackDamage, '#ff4444', 10);
            enemy.attackCooldown = 85;  // 공격속도 40% 감소 (50 -> 85)
        }
    }
    
    // 고양이 스킬: 원형 공격 (8방향 소형 탄환)
    if (enemy.skillCooldown <= 0 && dist < 200) {
        // 8방향으로 소형 탄환 발사
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            shootProjectile(
                enemy.x, enemy.y,
                enemy.x + Math.cos(angle) * 300,
                enemy.y + Math.sin(angle) * 300,
                'enemy', 8, '#FF8C00', 6  // 주황색 소형 탄환
            );
        }
        enemy.skillCooldown = 180;  // 3초 쿨다운
        
        // 스킬 이펙트
        effects.push({ type: 'enemySkill', x: enemy.x, y: enemy.y, life: 20 });
    }
    
    if (enemy.attackCooldown > 0) enemy.attackCooldown--;
    if (enemy.skillCooldown > 0) enemy.skillCooldown--;
    
    enemy.x = Math.max(lane.left, Math.min(lane.right, enemy.x));
    enemy.y = Math.max(lane.top, Math.min(lane.bottom, enemy.y));
}

// Update
function update() {
    if (!game.running) return;
    
    updatePlayer();
    updateEnemy();
    
    // 모래폭풍 (슬로우 + 데미지)
    if (sandstorm) {
        sandstorm.duration--;
        const distToEnemy = Math.sqrt((sandstorm.x - enemy.x) ** 2 + (sandstorm.y - enemy.y) ** 2);
        if (distToEnemy < sandstorm.radius && enemy.hp > 0) {
            // 틱당 데미지 (HP 0 이하로 안 내려감)
            enemy.hp = Math.max(1, enemy.hp - sandstorm.damage);
        }
        if (sandstorm.duration <= 0) sandstorm = null;
    }
    
    // Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.owner === 'player') {
            const dist = Math.sqrt((p.x - enemy.x) ** 2 + (p.y - enemy.y) ** 2);
            if (dist < p.radius + enemy.radius + 5) {
                enemy.hp -= p.damage;
                effects.push({ type: 'hit', x: enemy.x, y: enemy.y, life: 15 });
                projectiles.splice(i, 1);
                continue;
            }
        } else {
            const dist = Math.sqrt((p.x - player.x) ** 2 + (p.y - player.y) ** 2);
            if (dist < p.radius + player.radius + 5) {
                player.hp -= p.damage;
                effects.push({ type: 'hit', x: player.x, y: player.y, life: 15 });
                projectiles.splice(i, 1);
                continue;
            }
        }
        
        if (p.life <= 0 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            projectiles.splice(i, 1);
        }
    }
    
    // Effects
    for (let i = effects.length - 1; i >= 0; i--) {
        effects[i].life--;
        if (effects[i].life <= 0) effects.splice(i, 1);
    }
    
    if (player.hp <= 0) endGame(false);
    if (enemy.hp <= 0) endGame(true);
    
    updateUI();
}

// Render
function render() {
    let shakeX = 0, shakeY = 0;
    const shakeEffect = effects.find(e => e.type === 'shake');
    if (shakeEffect) {
        shakeX = (Math.random() - 0.5) * shakeEffect.intensity;
        shakeY = (Math.random() - 0.5) * shakeEffect.intensity;
    }
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    // 배경
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.3, '#F4A460');
    gradient.addColorStop(1, '#DEB887');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 모래 언덕
    desertProps.dunes.forEach(d => {
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.width, d.height, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 180, 140, ${0.3 + d.shade})`;
        ctx.fill();
    });
    
    // 선인장
    ctx.fillStyle = '#2d5016';
    desertProps.cacti.forEach(c => {
        ctx.fillRect(c.x - 3, c.y, 6, c.height);
        ctx.fillRect(c.x - 10, c.y + 5, 8, 4);
        ctx.fillRect(c.x + 2, c.y + 10, 8, 4);
    });
    
    // 라인 영역
    ctx.fillStyle = 'rgba(194, 178, 128, 0.6)';
    ctx.fillRect(lane.left, lane.top, lane.right - lane.left, lane.bottom - lane.top);
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 3;
    ctx.strokeRect(lane.left, lane.top, lane.right - lane.left, lane.bottom - lane.top);
    
    // 바위
    ctx.fillStyle = '#8B7355';
    desertProps.rocks.forEach(r => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 스킬 조준 지시선
    if (player.skillAiming && player.skillAiming.active) {
        const skill = player.skills[player.skillAiming.skill];
        const dir = player.skillAiming.direction;
        const range = skill ? skill.range : 200;
        
        // 스킬별 색상
        let color = 'rgba(255, 150, 50, 0.6)';
        if (player.skillAiming.skill === 'q') color = 'rgba(255, 100, 50, 0.7)';  // 파이어볼 - 빨간색
        else if (player.skillAiming.skill === 'w') color = 'rgba(50, 255, 50, 0.8)';  // 모래폭풍 - 녹색
        else if (player.skillAiming.skill === 'e') color = 'rgba(100, 200, 255, 0.7)';  // 대시 - 파란색
        else if (player.skillAiming.skill === 'r') color = 'rgba(255, 215, 0, 0.7)';  // 궁극기 - 금색
        
        if (dir.x !== 0 || dir.y !== 0) {
            const endX = player.x + dir.x * range;
            const endY = player.y + dir.y * range;
            
            // 지시선
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // 끝점 원 (타격 위치)
            ctx.beginPath();
            ctx.arc(endX, endY, 12, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // W 스킬(모래폭풍)은 범위 표시
            if (player.skillAiming.skill === 'w') {
                ctx.beginPath();
                ctx.arc(endX, endY, 65, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(50, 255, 50, 0.25)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(50, 255, 50, 0.7)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            // R 스킬(궁극기)은 부채꼴 표시
            if (player.skillAiming.skill === 'r') {
                const baseAngle = Math.atan2(dir.y, dir.x);
                ctx.beginPath();
                ctx.moveTo(player.x, player.y);
                for (let i = -2; i <= 2; i++) {
                    const angle = baseAngle + (i * 0.2);
                    ctx.lineTo(
                        player.x + Math.cos(angle) * range,
                        player.y + Math.sin(angle) * range
                    );
                    ctx.moveTo(player.x, player.y);
                }
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        } else {
            // 방향 없으면 사거리 원만 표시
            ctx.beginPath();
            ctx.arc(player.x, player.y, range, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // 모래폭풍
    if (sandstorm) {
        ctx.beginPath();
        ctx.arc(sandstorm.x, sandstorm.y, sandstorm.radius, 0, Math.PI * 2);
        const stormGrad = ctx.createRadialGradient(
            sandstorm.x, sandstorm.y, 0,
            sandstorm.x, sandstorm.y, sandstorm.radius
        );
        stormGrad.addColorStop(0, 'rgba(210, 180, 140, 0.8)');
        stormGrad.addColorStop(1, 'rgba(210, 180, 140, 0.1)');
        ctx.fillStyle = stormGrad;
        ctx.fill();
        
        for (let i = 0; i < 15; i++) {
            const px = sandstorm.x + (Math.random() - 0.5) * sandstorm.radius * 2;
            const py = sandstorm.y + (Math.random() - 0.5) * sandstorm.radius * 2;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(139, 115, 85, 0.6)';
            ctx.fill();
        }
    }
    
    // 이동 타겟
    if (player.targetX !== null) {
        ctx.beginPath();
        ctx.arc(player.targetX, player.targetY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(74, 144, 217, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // 이펙트
    effects.filter(e => e.type === 'click').forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 15 - e.life * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(74, 144, 217, ${e.life / 20})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    effects.filter(e => e.type === 'dash').forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 30 - e.life, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${e.life / 15})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    });
    
    effects.filter(e => e.type === 'hit').forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 20 - e.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 100, ${e.life / 15})`;
        ctx.fill();
    });
    
    // 고양이 스킬 이펙트 (원형 평창)
    effects.filter(e => e.type === 'enemySkill').forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 40 - e.life * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 140, 0, ${e.life / 20})`;
        ctx.lineWidth = 4;
        ctx.stroke();
    });
    
    // Projectiles
    projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // Enemy (고양이 파아)
    drawCat(enemy.x, enemy.y, enemy.radius);
    
    // Enemy HP
    ctx.fillStyle = '#333';
    ctx.fillRect(enemy.x - 25, enemy.y - 40, 50, 8);
    ctx.fillStyle = '#f44336';
    ctx.fillRect(enemy.x - 25, enemy.y - 40, 50 * Math.max(0, enemy.hp / enemy.maxHp), 8);
    
    // Player (치즈 파아)
    drawCheese(player.x, player.y, player.radius);
    
    // Player HP
    ctx.fillStyle = '#333';
    ctx.fillRect(player.x - 25, player.y - 40, 50, 8);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(player.x - 25, player.y - 40, 50 * Math.max(0, player.hp / player.maxHp), 8);
    
    // 공격 방향 표시 (조이스틱 방향)
    if (player.attackDirection.x !== 0 || player.attackDirection.y !== 0) {
        const arrowLen = 25;
        const arrowX = player.x + player.attackDirection.x * arrowLen;
        const arrowY = player.y + player.attackDirection.y * arrowLen;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(arrowX, arrowY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 화살촉
        ctx.beginPath();
        ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
    
    ctx.restore();
}

function updateUI() {
    document.querySelector('#playerHealth .health-bar-fill').style.width = 
        `${Math.max(0, player.hp / player.maxHp * 100)}%`;
    document.querySelector('#enemyHealth .health-bar-fill').style.width = 
        `${Math.max(0, enemy.hp / enemy.maxHp * 100)}%`;
    
    const skillKeys = ['q', 'w', 'e', 'r'];
    const skillEls = ['skill1', 'skill2', 'skill3', 'skillUlt'];
    
    skillKeys.forEach((key, i) => {
        const skill = player.skills[key];
        const el = document.getElementById(skillEls[i]);
        if (!el) return;
        
        if (skill.cooldown > 0) {
            el.className = 'skill cooldown';
            el.textContent = `${key.toUpperCase()} ${(skill.cooldown / 60).toFixed(1)}s`;
        } else {
            el.className = 'skill ready';
            el.textContent = `${key.toUpperCase()} ${skill.name}`;
        }
    });
}

function endGame(playerWon) {
    game.running = false;
    document.getElementById('resultText').textContent = playerWon ? '🎉 Victory!' : '💀 Defeat';
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    player.x = 100;
    player.y = canvas.height / 2;
    player.hp = player.maxHp;
    player.attackCooldown = 0;
    player.targetX = null;
    player.targetY = null;
    player.attackTarget = null;
    for (let key in player.skills) player.skills[key].cooldown = 0;
    
    enemy.x = canvas.width - 100;
    enemy.y = canvas.height / 2;
    enemy.hp = enemy.maxHp;
    enemy.attackCooldown = 0;
    enemy.state = 'chase';
    
    projectiles.length = 0;
    effects.length = 0;
    sandstorm = null;
    game.running = true;
    document.getElementById('gameOver').style.display = 'none';
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// 게임 시작 위치 조정
player.y = 200;
enemy.x = 900;
enemy.y = 200;

gameLoop();
console.log('🏜️ Arena Battle v0.3 - Wild Rift Style!');
