// Mobile Controls - Brawl Stars Style (듀얼 조이스틱)
// 왼쪽: 이동 / 오른쪽: 공격 조준 & 발사

(function() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) 
        || ('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0);
    
    console.log(isMobile ? '📱 모바일 모드 (듀얼 조이스틱)' : '🖥️ PC 모드');
    
    // 요소
    const moveJoystickArea = document.getElementById('joystickArea');
    const moveJoystickBase = document.getElementById('joystickBase');
    const moveJoystickThumb = document.getElementById('joystickThumb');
    
    const attackJoystickArea = document.getElementById('attackJoystickArea');
    const attackJoystickBase = document.getElementById('attackJoystickBase');
    const attackJoystickThumb = document.getElementById('attackJoystickThumb');
    
    const skillBtns = document.querySelectorAll('.skillBtn');
    const canvas = document.getElementById('gameCanvas');
    
    if (!moveJoystickArea || !attackJoystickArea) return;
    
    // 이동 조이스틱 상태
    const moveJoystick = {
        active: false,
        identifier: null,
        centerX: 0,
        centerY: 0,
        maxDist: 45
    };
    
    // 공격 조이스틱 상태
    const attackJoystick = {
        active: false,
        identifier: null,
        centerX: 0,
        centerY: 0,
        maxDist: 45,
        direction: { x: 0, y: 0 }
    };
    
    // ========== 이동 조이스틱 ==========
    moveJoystickArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const rect = moveJoystickBase.getBoundingClientRect();
        
        moveJoystick.active = true;
        moveJoystick.identifier = touch.identifier;
        moveJoystick.centerX = rect.left + rect.width / 2;
        moveJoystick.centerY = rect.top + rect.height / 2;
    }, { passive: false });
    
    // ========== 공격 조이스틱 ==========
    attackJoystickArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const rect = attackJoystickBase.getBoundingClientRect();
        
        attackJoystick.active = true;
        attackJoystick.identifier = touch.identifier;
        attackJoystick.centerX = rect.left + rect.width / 2;
        attackJoystick.centerY = rect.top + rect.height / 2;
        
        // 조준 중 표시
        attackJoystickBase.classList.add('aiming');
    }, { passive: false });
    
    // ========== 터치 이동 ==========
    document.addEventListener('touchmove', (e) => {
        for (let touch of e.touches) {
            // 이동 조이스틱
            if (moveJoystick.active && touch.identifier === moveJoystick.identifier) {
                const dx = touch.clientX - moveJoystick.centerX;
                const dy = touch.clientY - moveJoystick.centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                const limitedDist = Math.min(dist, moveJoystick.maxDist);
                const moveX = Math.cos(angle) * limitedDist;
                const moveY = Math.sin(angle) * limitedDist;
                
                moveJoystickThumb.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
                
                // 플레이어 이동
                if (typeof player !== 'undefined' && typeof lane !== 'undefined' && dist > 8) {
                    const normalizedX = moveX / moveJoystick.maxDist;
                    const normalizedY = moveY / moveJoystick.maxDist;
                    
                    player.targetX = Math.max(lane.left, Math.min(lane.right, player.x + normalizedX * 80));
                    player.targetY = Math.max(lane.top, Math.min(lane.bottom, player.y + normalizedY * 80));
                    player.attackTarget = null;
                }
            }
            
            // 공격 조이스틱
            if (attackJoystick.active && touch.identifier === attackJoystick.identifier) {
                const dx = touch.clientX - attackJoystick.centerX;
                const dy = touch.clientY - attackJoystick.centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                const limitedDist = Math.min(dist, attackJoystick.maxDist);
                const moveX = Math.cos(angle) * limitedDist;
                const moveY = Math.sin(angle) * limitedDist;
                
                attackJoystickThumb.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
                
                // 공격 방향 저장
                if (dist > 10) {
                    attackJoystick.direction.x = moveX / moveJoystick.maxDist;
                    attackJoystick.direction.y = moveY / moveJoystick.maxDist;
                    
                    // 플레이어 공격 방향 업데이트
                    if (typeof player !== 'undefined') {
                        player.attackDirection = { 
                            x: attackJoystick.direction.x, 
                            y: attackJoystick.direction.y 
                        };
                    }
                }
            }
        }
    }, { passive: false });
    
    // ========== 터치 종료 ==========
    document.addEventListener('touchend', (e) => {
        for (let touch of e.changedTouches) {
            // 이동 조이스틱 놓음
            if (touch.identifier === moveJoystick.identifier) {
                moveJoystick.active = false;
                moveJoystick.identifier = null;
                moveJoystickThumb.style.transform = 'translate(-50%, -50%)';
                
                if (typeof player !== 'undefined') {
                    player.targetX = null;
                    player.targetY = null;
                }
            }
            
            // 공격 조이스틱 놓음 = 발사!
            if (touch.identifier === attackJoystick.identifier) {
                attackJoystick.active = false;
                attackJoystick.identifier = null;
                attackJoystickThumb.style.transform = 'translate(-50%, -50%)';
                attackJoystickBase.classList.remove('aiming');
                
                // 방향이 있으면 발사
                if (attackJoystick.direction.x !== 0 || attackJoystick.direction.y !== 0) {
                    if (typeof player !== 'undefined') {
                        player.isAttacking = true;
                        
                        // 약간의 딜레이 후 공격 해제 (연속 발사 방지)
                        setTimeout(() => {
                            player.isAttacking = false;
                        }, 100);
                    }
                }
                
                // 방향 리셋
                attackJoystick.direction = { x: 0, y: 0 };
            }
        }
    });
    
    // ========== 스킬 버튼 (드래그 조준) ==========
    const skillState = {
        active: false,
        skillKey: null,
        identifier: null,
        startX: 0,
        startY: 0,
        direction: { x: 0, y: 0 }
    };
    
    skillBtns.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.changedTouches[0];
            const rect = btn.getBoundingClientRect();
            
            skillState.active = true;
            skillState.skillKey = btn.dataset.skill;
            skillState.identifier = touch.identifier;
            skillState.startX = rect.left + rect.width / 2;
            skillState.startY = rect.top + rect.height / 2;
            skillState.direction = { x: 0, y: 0 };
            
            btn.classList.add('aiming');
            
            // 스킬 조준 모드 활성화
            if (typeof player !== 'undefined') {
                player.skillAiming = {
                    active: true,
                    skill: skillState.skillKey,
                    direction: { x: 0, y: 0 }
                };
            }
        }, { passive: false });
    });
    
    // 스킬 드래그 중
    document.addEventListener('touchmove', (e) => {
        if (!skillState.active) return;
        
        let touch = null;
        for (let t of e.touches) {
            if (t.identifier === skillState.identifier) {
                touch = t;
                break;
            }
        }
        if (!touch) return;
        
        const dx = touch.clientX - skillState.startX;
        const dy = touch.clientY - skillState.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 15) {
            const normalizedX = dx / dist;
            const normalizedY = dy / dist;
            skillState.direction = { x: normalizedX, y: normalizedY };
            
            // 플레이어에게 조준 방향 전달
            if (typeof player !== 'undefined') {
                player.skillAiming = {
                    active: true,
                    skill: skillState.skillKey,
                    direction: { x: normalizedX, y: normalizedY }
                };
            }
        }
    }, { passive: false });
    
    // 스킬 발사 (손 떼)
    document.addEventListener('touchend', (e) => {
        if (!skillState.active) return;
        
        for (let touch of e.changedTouches) {
            if (touch.identifier === skillState.identifier) {
                // 방향이 있으면 그 방향으로, 없으면 적 방향으로 발사
                if (typeof game !== 'undefined' && typeof player !== 'undefined') {
                    if (skillState.direction.x !== 0 || skillState.direction.y !== 0) {
                        game.mouse.x = player.x + skillState.direction.x * 400;
                        game.mouse.y = player.y + skillState.direction.y * 400;
                    } else if (typeof enemy !== 'undefined') {
                        game.mouse.x = enemy.x;
                        game.mouse.y = enemy.y;
                    }
                }
                
                if (typeof useSkill === 'function') {
                    useSkill(skillState.skillKey);
                }
                
                // 조준 모드 해제
                if (typeof player !== 'undefined') {
                    player.skillAiming = null;
                }
                
                // 버튼 스타일 복구
                skillBtns.forEach(b => b.classList.remove('aiming'));
                
                skillState.active = false;
                skillState.skillKey = null;
                skillState.identifier = null;
                break;
            }
        }
    });
    
    // ========== 스킬 쿨다운 UI ==========
    function updateMobileUI() {
        if (typeof player === 'undefined') {
            requestAnimationFrame(updateMobileUI);
            return;
        }
        
        skillBtns.forEach(btn => {
            const skillKey = btn.dataset.skill;
            const skill = player.skills[skillKey];
            if (!skill) return;
            
            if (skill.cooldown > 0) {
                btn.classList.add('cooldown');
                btn.dataset.cd = (skill.cooldown / 60).toFixed(1);
            } else {
                btn.classList.remove('cooldown');
                btn.dataset.cd = '';
            }
        });
        
        requestAnimationFrame(updateMobileUI);
    }
    updateMobileUI();
    
    // ========== 캔버스 터치 (적 타겟팅) ==========
    canvas.addEventListener('touchstart', (e) => {
        if (moveJoystick.active || attackJoystick.active) return;
        
        e.preventDefault();
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const touchX = (touch.clientX - rect.left) * scaleX;
        const touchY = (touch.clientY - rect.top) * scaleY;
        
        if (typeof player === 'undefined' || typeof enemy === 'undefined') return;
        
        const distToEnemy = Math.sqrt((touchX - enemy.x) ** 2 + (touchY - enemy.y) ** 2);
        
        if (distToEnemy < enemy.radius + 35) {
            // 적 탭 = 타겟팅
            player.attackTarget = enemy;
            player.targetX = null;
            player.targetY = null;
        } else if (typeof lane !== 'undefined') {
            // 빈 곳 탭 = 이동
            player.attackTarget = null;
            player.targetX = Math.max(lane.left, Math.min(lane.right, touchX));
            player.targetY = Math.max(lane.top, Math.min(lane.bottom, touchY));
        }
    }, { passive: false });
    
    // 컨텍스트 메뉴 방지
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    console.log('📱 듀얼 조이스틱 준비 완료 - Brawl Stars Style');
})();
