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

<img width="1179" height="2267" alt="74204889-CAE8-49C2-81BC-1B7193FB424E_1_201_a" src="https://github.com/user-attachments/assets/ea09990e-0e3a-41ae-ab46-05cb024c7034" />



## 조작법

| 키 | 동작 |
|----|------|
| WASD | 이동 |
| 마우스 클릭 | 기본 공격 |
| Q | 파이어볼 (쿨다운 1초) |
| E | 대시 (쿨다운 2초) |
| R | 궁극기 - 전방위 공격 (쿨다운 5초) |

## 구현된 기능

- [x] 플레이어 이동
- [x] 기본 공격 (투사체)
- [x] 스킬 3종 (Q, E, R)
- [x] 적 AI (추적, 공격, 후퇴)
- [x] 체력 시스템
- [x] 승패 판정
- [x] 쿨다운 UI

## 다음 단계

- [ ] 캐릭터 스프라이트
- [ ] 사운드 효과
- [ ] 미니언 추가
- [ ] 포탑 추가
- [ ] 3v3 멀티 AI
