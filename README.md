# Arena Battle - Pre Demo v0.1

칼바람 스타일 MOBA의 웹 프로토타입

## 실행 방법

```bash
cd ~/arena-game
npx serve .
# 또는
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000` (또는 `http://localhost:3000`) 접속


## 📸 Screenshots

<img width="2556" height="879" alt="CB1158E4-28CD-4AAE-96F6-5E5BEDB1C24D_1_201_a" src="https://github.com/user-attachments/assets/8469258a-a50b-40e4-b2b8-ead0aef9a434" />


## 조작법

| 키 | 동작 |
|----|------|
| WASD | 이동 |
| 마우스 클릭 | 기본 공격 |
| Q | 파이어볼 (쿨다운 1초) |
| W | 모래폭풍 (쿨다운 1.5초) |
| E | 대시 (쿨다운 2초) |
| R | 궁극기 - 전방위 공격 (쿨다운 5초) |

## 구현된 기능

- [x] 플레이어 이동
- [x] 기본 공격 (투사체)
- [x] 스킬 4종 (Q, W, E, R)
- [x] 적 AI (추적, 공격, 후퇴)
- [x] 체력 시스템
- [x] 승패 판정
- [x] 쿨다운 UI
