# 🎮 나락 러너즈 (Narak Runners) — 앱인토스 미니게임 프로젝트 기획서

> **한 줄 요약:** 랜덤 캐릭터 × 단일 레인 × 자동 전투 — 한 판 90초, 토스에서 바로 즐기는 스낵 배틀 게임
>
> **플랫폼:** 앱인토스 (Apps in Toss) 미니앱
>
> **기술 스택:** WebView SDK (HTML5 Canvas/PixiJS) 또는 React Native (Granite)
>
> **개발 도구:** OpenClaw (AI 에이전트 기반 개발 보조)
>
> **목표 일정:** 베타 → 런칭 약 6~8주

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [게임 기획](#2-게임-기획)
3. [디자인 시스템](#3-디자인-시스템)
4. [코드 설계](#4-코드-설계)
5. [앱인토스 연동](#5-앱인토스-연동)
6. [수익화 전략](#6-수익화-전략)
7. [QA 및 출시 체크리스트](#7-qa-및-출시-체크리스트)
8. [런칭 및 배포](#8-런칭-및-배포)
9. [OpenClaw 활용 가이드 및 보안 주의사항](#9-openclaw-활용-가이드-및-보안-주의사항)
10. [로드맵 및 마일스톤](#10-로드맵-및-마일스톤)

---

## 1. 프로젝트 개요

### 1.1 컨셉

"칼바람 나락" 스타일의 단일 레인 팀 전투를 **모바일 스낵 게임**으로 재해석합니다.
핵심 차별점은 "빠른 한 판(90초)" + "랜덤 조합의 재미" + "토스 앱 내 즉시 실행"입니다.

- 5인 이하 자동 전투 (터치 개입은 스킬 발동 타이밍만)
- 매 판 랜덤으로 배정되는 캐릭터 조합
- 한 판 60~90초 — 토스 앱 특성상 짧고 반복 가능한 플레이
- PvE(AI 대전) 중심, 향후 비동기 PvP 확장 가능

### 1.2 IP 독립성 (법적 리스크 회피)

| 항목 | ❌ 금지 (라이엇 IP) | ✅ 허용 (오리지널) |
|------|---------------------|---------------------|
| 캐릭터 | 야스오, 징크스 등 | 오리지널 캐릭터 (아래 참조) |
| 맵 이름 | 칼바람 나락, 울부짖는 심연 | "나락 브릿지", "심연의 다리" 등 오리지널 |
| 아이템 | 무한의 대검, 루덴 등 | 오리지널 장비 시스템 |
| UI/HUD | LoL 미니맵, 스코어보드 형태 | 완전 자체 디자인 |
| 게임 메카닉 | ARAM 룰 자체는 장르적 개념으로 차용 가능 | 단일 레인 + 랜덤 배정 + 팀 전투 |

### 1.3 타겟 유저

- 토스 앱 사용자 (만 19세 이상)
- 캐주얼 게이머 / LoL 경험자 (향수 자극)
- 출퇴근/점심시간에 1~2분 게임을 원하는 직장인
- 토스 앱내 게임 탭에서 자연유입되는 유저

---

## 2. 게임 기획

### 2.1 핵심 게임 루프

```
[게임 시작]
    ↓
[랜덤 캐릭터 3~5명 배정] → 리롤 1회 가능 (광고 시청 시 추가 리롤)
    ↓
[90초 자동 전투 — 단일 레인]
  · 캐릭터는 자동으로 이동 + 기본 공격
  · 유저는 스킬 버튼(최대 2개) 탭으로 발동 타이밍 결정
  · 적 타워 파괴 or 시간 종료 시 남은 HP로 승패 결정
    ↓
[결과 화면] → 보상(코인/경험치) → 다시 하기 or 나가기
```

### 2.2 캐릭터 시스템

**오리지널 캐릭터 (초기 12종, 4역할 × 3캐릭)**

| 역할 | 캐릭터(가칭) | 특징 |
|------|-------------|------|
| 탱커 | 바위곰, 철갑이, 수호자 | 높은 HP, 적 타게팅 흡수 |
| 딜러 | 번개토끼, 칼바람, 화염여우 | 높은 DPS, 낮은 HP |
| 서포터 | 빛나리, 치유사, 바람돌이 | 아군 버프/힐 |
| 특수 | 그림자, 폭탄왕, 시공술사 | 디버프/CC/범위기 |

**캐릭터 성장 시스템:**
- 전투 중 성장 없음 (스낵 게임 특성상 고정 스탯)
- 메타 성장: 전투 보상 코인으로 캐릭터 "각성" (스킨 변경 + 스탯 미세 조정)
- 수집 요소: 전투 후 랜덤 조각 획득 → 새 캐릭터 해금

### 2.3 전투 메카닉

**레인 구조:**
```
[아군 기지] ──── 레인 (약 5화면 폭) ──── [적 기지]
     │                                        │
   타워 1                                   타워 1
   타워 2 (기지 앞)                          타워 2 (기지 앞)
```

**전투 규칙:**
- 캐릭터 자동 전진 + 자동 기본 공격 (가장 가까운 적 타게팅)
- 유저 조작: 스킬 1, 스킬 2 버튼 탭 (쿨다운 관리)
- 스킬 대상 선정: 자동 (가장 효율적 대상)
- 타워가 파괴되면 레인 진행, 기지 파괴 시 즉시 승리
- 90초 경과 시: 남은 타워 수 + 총 HP 비율로 승패 판정

**난이도 스케일링 (PvE):**
- 스테이지 1~10: 적 AI 패시브 (스킬 미사용)
- 스테이지 11~30: 적 AI 스킬 사용, 조합 변수 증가
- 스테이지 31+: 보스 스테이지 (특수 기믹)
- 무한 모드: 승리할수록 적 스탯 점진적 증가

### 2.4 UI/UX 와이어프레임

```
┌─────────────────────────────────────┐
│ [←]  나락 러너즈        [⚙️] [❌]  │  ← 앱인토스 네비게이션 바
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │     전투 화면 (Canvas)        │  │
│  │                               │  │
│  │  [아군]  ←→  레인  ←→  [적]   │  │
│  │                               │  │
│  │  HP바 | 타이머 00:47          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────────┐  │
│  │스킬1 │  │스킬2 │  │ 전체스킬 │  │  ← 하단 조작 영역
│  │ 🔥   │  │ ⚡   │  │   💫     │  │
│  │ 3.2s │  │ 5.0s │  │  12.0s   │  │
│  └──────┘  └──────┘  └──────────┘  │
│                                     │
│  [Safe Area - 하단 여백]            │
└─────────────────────────────────────┘
```

---

## 3. 디자인 시스템

### 3.1 TDS(Toss Design System) 준수사항

앱인토스 미니앱은 TDS를 따라야 출시 검수를 통과할 수 있습니다.

**필수 적용:**
- 네비게이션 바: 앱인토스 SDK 자동 적용 (커스텀 금지)
- Safe Area: iOS Dynamic Island, 하단 홈 인디케이터 영역 침범 금지
- 닫기 버튼: 우측 상단에 항상 노출, 정상 동작
- 다크패턴 금지: 진입 즉시 바텀시트 금지, 강제 유도 금지
- 폰트: TDS 기본 폰트 사용 (`initialFontSize` 대응)

**게임 내 자체 디자인 영역:**
- 전투 화면: Canvas/WebGL 렌더링 (TDS 밖)
- 로비/메뉴: TDS 컴포넌트 + 게임 테마 커스텀
- 결과 화면: TDS 기반 레이아웃

### 3.2 비주얼 스타일 가이드

**아트 방향:** 2D 픽셀아트 또는 플랫 일러스트 (경량 렌더링)

| 요소 | 스타일 | 비고 |
|------|--------|------|
| 캐릭터 | 32×32 또는 48×48 픽셀 스프라이트 | 애니메이션 프레임 최소화 (idle 4f, walk 4f, attack 3f, skill 3f) |
| 배경 | 단일 레인 타일맵 (2~3 레이어) | 패럴렉스 없이 단순 스크롤 |
| 이펙트 | 파티클 시스템 (경량) | 히트/스킬 이펙트 최대 10 동시 |
| UI | 플랫 디자인, 둥근 모서리 | TDS와 시각적 조화 |

**컬러 팔레트:**
- 주색: `#1B1F3B` (다크 네이비 — 심연 테마)
- 보조색: `#4ECDC4` (민트 — 아군), `#FF6B6B` (코랄 — 적)
- 강조색: `#FFE66D` (골드 — 보상/하이라이트)
- 배경: `#0D1117` → `#1A1A2E` 그라데이션

### 3.3 사운드 디자인

- BGM: 루프형 8bit/chiptune 전투 음악 (저용량 .mp3, 30초 루프)
- SFX: 스킬 발동, 히트, 타워 파괴, 승리/패배 효과음
- 앱인토스 주의사항: 인앱 결제 진행 시 음악 자동 일시정지 처리 필수
- 음소거 토글 필수 (설정에서 BGM/SFX 분리 제어)

---

## 4. 코드 설계

### 4.1 기술 스택 결정

**권장: WebView SDK + HTML5 Canvas (PixiJS)**

선택 이유:
- 게임 렌더링에 Canvas/WebGL이 React Native보다 적합
- PixiJS는 2D 게임에 최적화된 경량 렌더링 엔진
- WebView SDK는 앱인토스에서 바로 지원, 빌드 과정 단순
- 바이브코딩과의 호환성 (HTML/JS 기반)

대안: Unity WebGL 빌드 → 앱인토스 WebView에 올리기 (무거움, 비추천)

```
기술 스택 요약:
├── 런타임: 앱인토스 WebView SDK
├── 렌더링: PixiJS 8.x (Canvas/WebGL 자동 전환)
├── 게임 로직: TypeScript
├── 상태 관리: Zustand (경량) 또는 vanilla 패턴
├── 빌드: Vite + TypeScript
├── UI (비게임 화면): HTML/CSS (TDS 스타일 준수)
├── 사운드: Howler.js
├── 백엔드: Firebase (인증/DB/호스팅) 또는 Supabase
└── AI 개발 보조: OpenClaw
```

### 4.2 프로젝트 구조

```
narak-runners/
├── public/
│   ├── assets/
│   │   ├── sprites/          # 캐릭터 스프라이트시트
│   │   ├── tiles/            # 레인 타일맵
│   │   ├── effects/          # 파티클/이펙트
│   │   ├── ui/               # UI 아이콘, 버튼
│   │   ├── audio/
│   │   │   ├── bgm/          # 배경음악
│   │   │   └── sfx/          # 효과음
│   │   └── fonts/
│   └── index.html
├── src/
│   ├── main.ts               # 앱 엔트리포인트
│   ├── config/
│   │   ├── game.config.ts    # 게임 밸런스 상수
│   │   ├── characters.ts     # 캐릭터 데이터 정의
│   │   └── stages.ts         # 스테이지 데이터
│   ├── core/
│   │   ├── Game.ts           # 메인 게임 루프 (PixiJS Application)
│   │   ├── GameState.ts      # 전투 상태 머신
│   │   ├── Timer.ts          # 90초 타이머
│   │   └── EventBus.ts       # 이벤트 시스템
│   ├── entities/
│   │   ├── Character.ts      # 캐릭터 베이스 클래스
│   │   ├── Tower.ts          # 타워 엔티티
│   │   ├── Projectile.ts     # 투사체
│   │   └── Particle.ts       # 파티클 이펙트
│   ├── systems/
│   │   ├── BattleSystem.ts   # 전투 로직 (데미지, 타게팅)
│   │   ├── AISystem.ts       # 적 AI / 자동 전투 로직
│   │   ├── SkillSystem.ts    # 스킬 쿨다운 및 발동
│   │   ├── MovementSystem.ts # 레인 이동 로직
│   │   └── SpawnSystem.ts    # 캐릭터 배치/리스폰
│   ├── scenes/
│   │   ├── LobbyScene.ts     # 로비 (캐릭터 확인, 시작)
│   │   ├── BattleScene.ts    # 전투 화면
│   │   ├── ResultScene.ts    # 결과 화면
│   │   └── CollectionScene.ts # 캐릭터 수집/도감
│   ├── ui/
│   │   ├── HUD.ts            # 전투 중 HUD (HP, 타이머, 스킬)
│   │   ├── SkillButton.ts    # 스킬 버튼 컴포넌트
│   │   └── Modal.ts          # 팝업/모달 (TDS 스타일)
│   ├── services/
│   │   ├── SaveService.ts    # 유저 데이터 저장/로드
│   │   ├── AdService.ts      # 인앱 광고 (IAA) 연동
│   │   ├── IAPService.ts     # 인앱 결제 (IAP) 연동
│   │   └── TossAuth.ts       # 토스 유저 인증 연동
│   ├── utils/
│   │   ├── random.ts         # 랜덤 캐릭터 배정 로직
│   │   ├── balance.ts        # 밸런스 계산 유틸
│   │   └── analytics.ts      # 이벤트 트래킹
│   └── types/
│       ├── character.d.ts
│       ├── battle.d.ts
│       └── game.d.ts
├── toss/
│   ├── toss-sdk.ts           # 앱인토스 SDK 래퍼
│   └── toss-config.json      # 앱인토스 설정
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 4.3 핵심 클래스 설계

**Game.ts — 메인 게임 루프**
```typescript
// 핵심 구조 (의사코드)
class Game {
  private app: PIXI.Application;
  private state: GameState;
  private battleSystem: BattleSystem;
  private currentScene: Scene;

  constructor(container: HTMLElement) {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight - SAFE_AREA_TOP - SAFE_AREA_BOTTOM,
      backgroundColor: 0x0D1117,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    container.appendChild(this.app.canvas);
  }

  // 게임 루프
  update(delta: number): void {
    this.currentScene.update(delta);
    if (this.state.phase === 'battle') {
      this.battleSystem.update(delta);
      this.checkWinCondition();
    }
  }

  // 화면 크기 대응 (다양한 모바일 기기)
  resize(): void {
    const { innerWidth, innerHeight } = window;
    this.app.renderer.resize(innerWidth, innerHeight);
    this.currentScene.onResize(innerWidth, innerHeight);
  }
}
```

**Character.ts — 캐릭터 엔티티**
```typescript
interface CharacterData {
  id: string;
  name: string;
  role: 'tanker' | 'dealer' | 'supporter' | 'special';
  stats: { hp: number; atk: number; def: number; atkSpeed: number; moveSpeed: number; };
  skills: SkillData[];
  sprite: { idle: string; walk: string; attack: string; };
}

class Character extends PIXI.Container {
  private data: CharacterData;
  private currentHp: number;
  private target: Character | Tower | null;
  private skillCooldowns: Map<string, number>;

  update(delta: number): void {
    this.updateMovement(delta);
    this.updateCombat(delta);
    this.updateAnimation();
  }

  useSkill(skillIndex: number): boolean {
    // 쿨다운 체크 → 스킬 발동 → 이펙트 생성
  }
}
```

**BattleSystem.ts — 전투 코어**
```typescript
class BattleSystem {
  private allies: Character[];
  private enemies: Character[];
  private towers: { ally: Tower[]; enemy: Tower[] };
  private timer: Timer; // 90초 카운트다운

  update(delta: number): void {
    // 1. 타게팅 업데이트
    this.updateTargeting();
    // 2. 전투 처리 (데미지 계산)
    this.processCombat(delta);
    // 3. 사망 처리
    this.processDeaths();
    // 4. 타이머 업데이트
    this.timer.update(delta);
  }

  calculateDamage(attacker: Character, target: Character | Tower): number {
    const baseDmg = attacker.stats.atk;
    const defense = target.stats.def;
    return Math.max(1, baseDmg - defense * 0.5) * (0.9 + Math.random() * 0.2);
  }
}
```

### 4.4 성능 최적화 전략

토스 미니앱 환경은 WebView 기반이므로 성능 관리가 핵심입니다.

- **오브젝트 풀링:** 투사체, 파티클, 데미지 텍스트 → 풀에서 재사용 (GC 방지)
- **스프라이트시트:** 개별 이미지 대신 TextureAtlas 사용 (HTTP 요청 최소화)
- **렌더링 최적화:** 화면 밖 엔티티 culling, 불필요한 렌더 패스 제거
- **번들 사이즈:** Vite tree-shaking + 에셋 lazy loading (초기 로드 < 2MB 목표)
- **프레임 목표:** 30fps 안정 유지 (60fps 선호, 배터리 고려)
- **메모리:** 동시 엔티티 수 제한 (캐릭터 10 + 투사체 20 + 파티클 30 이하)

---

## 5. 앱인토스 연동

### 5.1 SDK 셋업

**WebView SDK 방식:**
```bash
# 프로젝트 생성
npx create-ait-app narak-runners

# 또는 기존 프로젝트에 SDK 추가 (WebView)
npm install @apps-in-toss/sdk
```

**주요 연동 포인트:**

| 기능 | SDK API | 설명 |
|------|---------|------|
| 유저 식별 | `toss.getUser()` | 토스 유저 ID로 세이브 데이터 연동 |
| 인앱 결제 | `toss.purchase()` | 코인 패키지, 캐릭터 즉시 해금 |
| 인앱 광고 | Toss Ads SDK | 리워드 광고 (리롤 추가 등) |
| 공유 | `toss.share()` | 전투 결과 공유 → 바이럴 |
| 네비게이션 | 자동 적용 | 뒤로가기, 닫기 버튼 |

### 5.2 유저 데이터 관리

```typescript
// 유저 세이브 데이터 구조
interface UserSaveData {
  userId: string;          // 토스 유저 식별자
  coins: number;           // 인게임 재화
  unlockedChars: string[]; // 해금된 캐릭터 ID 목록
  charFragments: Record<string, number>; // 캐릭터 조각 수
  highestStage: number;    // 최고 진행 스테이지
  totalWins: number;
  totalGames: number;
  lastPlayedAt: string;    // ISO 타임스탬프
}
```

백엔드 선택지:
- **Firebase Firestore** — 빠른 구축, 실시간 동기화, 무료 티어로 초기 충분
- **Supabase** — PostgreSQL 기반, 자체 호스팅 가능
- **자체 서버** — 향후 PvP 구현 시 필요

### 5.3 기기 변경 대응

앱인토스 검수 항목: "토스 앱에 로그인된 기기를 변경해도 인앱 결제 데이터가 유지"

→ 반드시 서버사이드 저장 (토스 유저 ID 기반)
→ 로컬 캐시는 보조 수단으로만 사용

---

## 6. 수익화 전략

### 6.1 수익 모델

| 채널 | 방식 | 예시 |
|------|------|------|
| IAA (인앱 광고) | 리워드 광고 | 리롤 추가, 코인 2배 보상, 부활 1회 |
| IAA (인앱 광고) | 배너/인터스티셜 | 결과 화면 하단 배너 (전투 중 광고 없음) |
| IAP (인앱 결제) | 코인 패키지 | 1,000코인 / 5,000코인 / 12,000코인 |
| IAP (인앱 결제) | 시즌 패스 | 월간 패스: 매일 보상 + 전용 캐릭터 |
| IAP (인앱 결제) | 캐릭터 즉시 해금 | 개별 캐릭터 직접 구매 |

**수수료 구조:**
- 인앱 광고: 앱인토스 수수료 15% (CBT 기간 0%)
- 인앱 결제: 앱마켓 15~30% + 앱인토스 수수료
- 토스페이 결제: 별도 수수료 (토스페이 Key 발급 필요, 영업일 7~14일 소요)

### 6.2 광고 정책 주의사항

앱인토스 출시 체크리스트 필수 준수:
- 인트로/로딩/컷신/팝업 모달 등 일시적 화면에 광고 노출 금지
- 전투 중 광고 삽입 금지 (결과 화면, 로비에서만)
- 광고 닫기 버튼 명확히 표시
- 리워드 광고는 유저가 자발적으로 선택하는 구조

---

## 7. QA 및 출시 체크리스트

### 7.1 앱인토스 필수 검수 항목

아래는 앱인토스 게임 출시 가이드 기반의 필수 체크리스트입니다.

**네비게이션 및 UX:**
- [ ] 우측 상단 닫기 버튼 정상 노출 및 동작
- [ ] Safe Area 영역 미침범 (iOS Dynamic Island 포함)
- [ ] 진입 즉시 바텀시트 자동 팝업 없음
- [ ] 화면 전환 시 강제 유도 바텀시트 없음
- [ ] 모든 화면에서 미니앱 나갈 수 있는 방법 존재
- [ ] CTA 버튼의 행동 예측 가능
- [ ] 자사 서비스 이동/앱 설치 유도 없음

**유저 식별 및 데이터:**
- [ ] 유저 식별자 값 확인 및 저장
- [ ] 기기 변경 시 결제 데이터 유지
- [ ] 게임 정상 시작 확인

**인앱 결제 (IAP 사용 시):**
- [ ] 결제 중 음악 자동 일시정지
- [ ] 주문 금액과 결제창 금액 일치
- [ ] 결제 정상 진행 확인
- [ ] 구글 결제 테스트 환경 확인
- [ ] 결제 완료 후 결과 정상 반영
- [ ] 결제 취소 시 주문 화면 복귀
- [ ] 잔액 부족 등 실패 시 사유 안내
- [ ] 결제 취소 정상 처리
- [ ] 결제 내역 사용자 확인 가능

**사운드 및 등급:**
- [ ] 음소거 토글 기능
- [ ] 게임 등급 표기 (전체이용가 / 12세 등)

### 7.2 테스트 전략

**샌드박스 테스트:**
```bash
# 앱인토스 샌드박스 앱에서 테스트
# iOS: intoss://narak-runners
# Android: adb reverse tcp:8081 tcp:8081 후 스키마 열기
```

**디바이스 매트릭스:**

| 구분 | 기기 | 해상도 | 비고 |
|------|------|--------|------|
| iOS 최소 | iPhone SE 3 | 375×667 | 최소 지원 해상도 |
| iOS 일반 | iPhone 14 | 390×844 | Dynamic Island 대응 |
| iOS 최대 | iPhone 15 Pro Max | 430×932 | 고해상도 대응 |
| Android 최소 | Galaxy A23 | 360×800 | 저사양 기기 |
| Android 일반 | Galaxy S24 | 360×780 | 일반 사용 |
| Android 최대 | Galaxy S24 Ultra | 384×824 | 고해상도 |

**성능 테스트 기준:**
- 초기 로딩: < 3초
- 전투 중 FPS: 30fps 이상 안정
- 메모리 사용: < 150MB
- 번들 크기: 초기 다운로드 < 3MB

---

## 8. 런칭 및 배포

### 8.1 앱인토스 등록 프로세스

```
[1단계] 앱인토스 콘솔 가입 (사업자등록증 필요 여부 확인)
    ↓
[2단계] 미니앱 등록 (앱 이름, 설명, 아이콘, 스크린샷)
    ↓
[3단계] 빌드 결과물 업로드
    ↓
[4단계] 내부 검수 (앱인토스 팀)
    · 디자인 가이드 준수 확인
    · 다크패턴 검수
    · 기능/성능 테스트
    · 결제 flow 테스트
    ↓
[5단계] 출시 승인 → 토스 앱 내 노출
    ↓
[6단계] 모니터링 + 이터레이션
```

**사업자 필요 기능:**
토스 로그인, 비즈월렛, 프로모션, 인앱 광고, 토스페이, 인앱 결제를 사용하려면 사업자등록이 필요합니다. 개인 개발자라면 사업자 등록 후 진행하세요.

### 8.2 빌드 및 배포 파이프라인

```bash
# 1. 개발
npm run dev          # 로컬 개발 서버

# 2. 빌드
npm run build        # Vite 프로덕션 빌드 → dist/

# 3. 앱인토스 빌드 (WebView SDK 사용 시)
ait build            # 앱인토스 빌드 래퍼

# 4. 콘솔에서 업로드
# 앱인토스 콘솔 > 내 앱 > 빌드 업로드
```

### 8.3 출시 후 운영

- **Sentry 연동:** 클라이언트 에러 실시간 모니터링 (QR 테스트 디버깅에도 활용)
- **애널리틱스:** DAU, 세션 길이, 스테이지 클리어율, 결제 전환율
- **A/B 테스트:** 캐릭터 밸런스, 광고 빈도, 보상 수치
- **정산 관리:** 인앱 결제 정산은 익월 초 리포트 기준

### 8.4 바이브코딩 챌린지 활용

현재 앱인토스에서 2026년 5월 1일~24일 바이브코딩 챌린지를 진행 중입니다.
이 챌린지에 참가하면 초기 노출 기회를 얻을 수 있으므로 타이밍을 활용하세요.

---

## 9. OpenClaw 활용 가이드 및 보안 주의사항

### 9.1 개발 시 OpenClaw 활용 방안

OpenClaw를 게임 개발 보조 도구로 활용할 수 있는 영역:

- 캐릭터 밸런스 시뮬레이션 스크립트 자동 생성
- 스프라이트시트 변환/최적화 배치 작업
- TypeScript 보일러플레이트 코드 생성
- 테스트 시나리오 자동 생성 및 실행
- Git 커밋 메시지 / 문서화 자동화

### 9.2 OpenClaw 보안 체크리스트 (필수)

OpenClaw는 강력하지만 보안 위험이 높은 도구입니다. 아래 사항을 반드시 지켜주세요.

**절대 금지 사항:**
- OpenClaw에 토스페이 API Key, 앱인토스 콘솔 인증 정보 노출 금지
- Firebase/Supabase 서비스 키를 OpenClaw 설정에 평문 저장 금지
- OpenClaw가 프로덕션 빌드 파이프라인에 직접 접근하는 구성 금지
- ClawHub에서 검증되지 않은 스킬 설치 금지

**필수 조치:**
- OpenClaw는 개발 전용 격리 환경(Docker 컨테이너)에서만 실행
- v2026.1.29 이상 사용, `openclaw security audit --deep` 정기 실행
- 개발 환경과 프로덕션 환경의 자격증명 완전 분리
- OpenClaw가 접근하는 저장소는 개발용 브랜치로 제한
- SOUL.md, MEMORY.md 파일 주기적으로 검토하여 이상 컨텍스트 확인

**권장 워크플로우:**
```
[OpenClaw 격리 환경]  →  코드 생성/리뷰  →  [개발자 직접 검토]  →  [Git 커밋]
         │                                        ↑
         └── 프로덕션 키, 토스 API 키 접근 불가 ──┘
```

---

## 10. 로드맵 및 마일스톤

### Phase 1: 코어 완성 (1~2주차)

- [ ] 앱인토스 개발 환경 셋업 (WebView SDK + 샌드박스)
- [ ] PixiJS 기반 게임 엔진 코어 구현 (렌더링, 게임루프)
- [ ] 캐릭터 3종 구현 (탱커/딜러/서포터 각 1)
- [ ] 단일 레인 + 타워 + 자동 전투 기본 로직
- [ ] 90초 타이머 + 승패 판정
- [ ] 스킬 버튼 UI + 쿨다운

### Phase 2: 콘텐츠 확장 (3~4주차)

- [ ] 캐릭터 12종 전체 구현 + 밸런싱
- [ ] 스테이지 시스템 (1~30 + 무한)
- [ ] 랜덤 배정 + 리롤 시스템
- [ ] 캐릭터 수집/해금 시스템
- [ ] 로비/결과/도감 화면 UI
- [ ] BGM/SFX 적용
- [ ] 토스 유저 인증 연동

### Phase 3: 수익화 + 폴리싱 (5~6주차)

- [ ] 인앱 광고 (Toss Ads) 연동
- [ ] 인앱 결제 연동 (코인 패키지)
- [ ] 디바이스 호환성 테스트 (iOS/Android 주요 기기)
- [ ] 성능 최적화 (로딩, FPS, 메모리)
- [ ] Safe Area, 네비게이션, 다크패턴 검수 대응
- [ ] Sentry 에러 모니터링 연동

### Phase 4: 출시 (7~8주차)

- [ ] 앱인토스 콘솔 앱 등록
- [ ] 내부 QA → 체크리스트 전항목 통과
- [ ] 빌드 업로드 → 앱인토스 검수 제출
- [ ] 검수 피드백 대응 및 수정
- [ ] 출시 승인 → 라이브

### Phase 5: 운영 및 확장 (출시 후)

- [ ] DAU/리텐션/결제 데이터 분석
- [ ] 캐릭터 추가 (시즌 단위)
- [ ] 비동기 PvP (랭킹전) 도입 검토
- [ ] 시즌 패스 시스템
- [ ] 토스 프로모션/이벤트 참여
- [ ] 커뮤니티 피드백 기반 밸런스 패치

---

## 부록: 참고 자료

| 자료 | URL |
|------|-----|
| 앱인토스 개발자센터 | https://developers-apps-in-toss.toss.im/ |
| 앱인토스 게임 출시 체크리스트 | https://developers-apps-in-toss.toss.im/checklist/app-game.html |
| 앱인토스 FAQ | https://developers-apps-in-toss.toss.im/faq.html |
| 앱인토스 GitHub 예제 | https://github.com/toss/apps-in-toss-examples |
| 앱인토스 콘솔 | https://console.apps-in-toss.toss.im/ |
| 앱인토스 바이브코딩 챌린지 | https://techchat-apps-in-toss.toss.im/ |
| PixiJS 공식 문서 | https://pixijs.com/ |
| OpenClaw 보안 가이드 | https://open-claw.bot/docs/ko/gateway/security/readme/ |

---

> **문서 버전:** v1.0 | **최종 수정:** 2026-05-09 | **작성:** AI 기반 프로젝트 기획
