# 🎮 Arena Battle 개발일지 - Day 1

**날짜:** 2026-04-29  
**작성자:** Jay + Chloe (AI Agent)

---

## 📌 오늘의 목표

칼바람 나락 스타일 MOBA 게임의 **Pre-Demo 프로토타입** 완성

---

## 🎯 프로젝트 개요

### 최종 목표
- 5v5 MOBA (칼바람 스타일)
- 모바일 앱스토어 + 토스 인앱 런칭

### 현실적 접근
- **문제:** Unity 경험 없음 + 1주일 기간
- **해결:** 웹(HTML5 Canvas)으로 먼저 프로토타입 → 재미 검증 → Unity 이식

### 스코프 축소 과정
```
5v5 MOBA (풀스펙) 
  ↓ 너무 큼
3v3 MOBA (MVP)
  ↓ 아직 큼
1v1 아레나 배틀 (Pre-Demo) ✅
```

---

## 🛠 기술 스택

| 구분 | 선택 | 이유 |
|------|------|------|
| 플랫폼 | Web (HTML5) | 설치 없이 즉시 테스트 가능 |
| 렌더링 | Canvas API | 2D 게임에 적합, 러닝커브 낮음 |
| 언어 | JavaScript | 웹 기본, AI 코딩 지원 용이 |
| 서버 | python http.server | 개발용 로컬 서버 |

---

## ✅ 구현 완료

### 1. 플레이어 시스템
- WASD 이동
- 마우스 조준 + 클릭 공격
- 체력 시스템

### 2. 스킬 시스템 (3종)

| 키 | 스킬명 | 효과 | 쿨다운 |
|----|--------|------|--------|
| Q | 파이어볼 | 고데미지 투사체 | 1초 |
| E | 대시 | 마우스 방향 순간이동 | 2초 |
| R | 궁극기 | 전방위 8발 발사 | 5초 |

### 3. 적 AI (상태 머신)
```
[chase] → 플레이어 추적
    ↓ 거리 < 150px
[attack] → 투사체 발사
    ↓ HP < 30%
[retreat] → 후퇴
```

### 4. UI
- 플레이어/적 체력바
- 스킬 쿨다운 표시
- 승리/패배 화면

---

## 📚 코드 분석 & 배운 점

### 1. 게임 루프 구조

```javascript
function gameLoop() {
    update();  // 로직 처리 (이동, 충돌, AI)
    render();  // 화면 그리기
    requestAnimationFrame(gameLoop);  // 다음 프레임 예약
}
```

- `requestAnimationFrame`: 브라우저 최적화된 60fps 루프
- update와 render 분리 = 관심사 분리 원칙

### 2. 투사체 충돌 감지

```javascript
const dist = Math.sqrt((p.x - enemy.x) ** 2 + (p.y - enemy.y) ** 2);
if (dist < p.radius + enemy.radius) {
    // 충돌!
}
```

- 원형 충돌: 두 원의 중심 거리 < 반지름 합
- 피타고라스 정리 활용

### 3. AI 상태 머신

```javascript
// 상태에 따라 다른 행동
if (enemy.state === 'chase') { /* 추적 */ }
else if (enemy.state === 'retreat') { /* 후퇴 */ }
else if (enemy.state === 'attack') { /* 공격 */ }
```

- 복잡한 AI도 상태 단위로 쪼개면 관리 쉬움
- 게임 AI의 기본 패턴

### 4. 벡터 정규화 (방향 계산)

```javascript
const angle = Math.atan2(toY - fromY, toX - fromX);
vx = Math.cos(angle) * speed;
vy = Math.sin(angle) * speed;
```

- `atan2`: 두 점 사이 각도 계산
- `cos/sin`: 각도 → 방향 벡터 변환

---

## 🎮 플레이 영상/스크린샷

> (추후 추가)

---

## 🔜 다음 스텝

- [ ] 캐릭터 스프라이트 적용
- [ ] 사운드 효과 추가
- [ ] 맵 확장 (장애물, 벽)
- [ ] 미니언 추가
- [ ] 3v3 AI 확장

---

## 💡 회고

### 잘한 점
- 스코프 조정을 과감하게 함 (5v5 → 1v1)
- AI 에이전트 활용으로 빠른 프로토타이핑

### 배운 점
- 게임 개발은 작게 시작해서 키우는 게 맞다
- "재미 검증"이 그래픽/완성도보다 먼저

### AI 협업 방식
- 나(Jay): 기획, 방향 설정, 피드백
- Chloe: 코딩, 실행, 기술 제안

→ **인간의 판단력 + AI의 실행력** 조합

---

## 📎 관련 파일

- 소스코드: `~/arena-game/`
- 실행: `cd ~/arena-game && python3 -m http.server 8000`
- 접속: `http://localhost:8000`
