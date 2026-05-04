# bible_gods

> 성경의 우상들 — 발굴된 신들의 역사
> 18개 챕터의 정적 웹사이트.

성경에 등장하는 모든 이방 우상을 고고학·고대 근동학·헬레니즘 사료로 재추적한 심층 논픽션을, [Airbnb 디자인 시스템](https://airbnb.design) 기반의 정적 웹사이트로 빌드합니다.

## 빠른 시작

```bash
# 1) 빌드
node build.mjs

# 2) 로컬 서버
npx http-server dist -p 8000
# 또는
python -m http.server 8000 -d dist

# 3) 또는 더블클릭으로 바로 열기
#    Windows 탐색기 → dist/index.html
```

브라우저에서 [http://localhost:8000](http://localhost:8000)으로 접속하면 26개 페이지(홈 1 + 목차 1 + 소개 1 + 부 5 + 챕터 18)를 볼 수 있습니다.

## 폴더 구조

```
bible_gods/
├── build.mjs              ← 빌드 스크립트 (Node 24+, 의존성 없음)
├── book/                  ← 챕터 마크다운 원본 (19개)
│   ├── 00_목차.md
│   └── 01_*.md ~ 18_*.md
├── styles/
│   ├── tokens.css         ← Airbnb 디자인 토큰 (색·여백·라운드·그림자)
│   ├── typography.css     ← 디자인 시스템 타이포 + 본문 reading-body
│   ├── components.css     ← top-nav · chapter-card · sidebar-box · key-takeaway 등
│   └── layout.css         ← 컨테이너·반응형·접근성
├── scripts/
│   └── nav.js             ← 모바일 메뉴, 스크롤 진행도, 섹션 TOC
└── dist/                  ← 빌드 산출물 (정적 호스팅 가능)
    ├── index.html
    ├── contents.html
    ├── about.html
    ├── parts/{1..5}.html
    └── chapters/{slug}.html (18개)
```

## 페이지 목록

### 진입 페이지
| 페이지 | URL |
|---|---|
| 홈 | `/index.html` |
| 전체 목차 | `/contents.html` |
| 소개 | `/about.html` |

### 5개 부 페이지
| 부 | 시대 |
|---|---|
| 1부 — 광야의 시작 | BC 2000 — BC 1200 |
| 2부 — 국가신들의 전쟁 | BC 1200 — BC 930 |
| 3부 — 혼합주의의 절정 | BC 930 — BC 586 |
| 4부 — 제국의 그늘 | BC 586 — BC 400 |
| 5부 — 카이사르와 그리스도 | BC 1세기 — AD 1세기 |

### 18개 챕터 페이지
1. 라헬은 왜 그 흙덩어리를 훔쳤을까 — 드라빔
2. 나일강을 피로 물들인 신 — 10가지 재앙
3. 비를 부르려 살을 섞은 사람들 — 바알·아세라
4. 머리가 잘려 나간 곡물의 신 — 다곤
5. 메사가 돌에 새긴 살인 고백 — 그모스
6. 청동 팔에 던져진 아이들 — 몰렉
7. 림몬 신당의 절과 시돈의 여신 — 림몬·아스다롯
8. 야훼에게는 부인이 있었다 — 쿤틸렛 아즈루드
9. 한여름에 우는 여인들 — 담무스
10. 가족이 함께 굽는 별 모양 빵 — 하늘의 여왕
11. 사마리아의 신들은 왜 일곱이 되었나 — 앗수르 일곱 신
12. 짐승 등에 업혀야 움직이는 신 — 벨·느보
13. 27미터 금 신상 앞에 선 세 청년 — 두라 평지 풀무불
14. 고레스 원통과 사자굴 — 페르시아
15. 신전이 곧 은행이었다 — 에베소 아르테미스
16. 두 신이 마을에 내려왔다 — 루스드라·아테네
17. 사탄의 권좌가 있는 도시 — 버가모
18. 666, 매매를 막는 표 — 짐승의 표

## 디자인 시스템

[Airbnb의 디자인 시스템](https://airbnb.design)을 도서 맥락으로 매핑하여 사용합니다.

| Airbnb 원본 | 도서 매핑 |
|---|---|
| `property-card` | `chapter-card` (1:1 비주얼 + 챕터 번호 + 신/사료) |
| `experience-card` | `part-card` (5개 부 카드) |
| `reservation-card` | `reading-toc` (sticky 사이드바: 진행도 + 섹션 + 이전/다음) |
| `rating-display-card` | 챕터 헤더 64px 번호 디스플레이 |
| `top-nav` | `top-nav` (홈 · 목차 · 소개) |
| `footer-light` | `footer` (3 컬럼) |

핵심 토큰:

- **단일 강조색**: Rausch `#ff385c` — primary CTA, 챕터 번호, 핵심 정리 박스 번호 점
- **본문 잉크**: `#222222` — 결코 순수 검정을 쓰지 않음
- **단일 그림자 톤**: `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.10) 0 4px 8px`
- **8px 기반 여백 시스템**: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
- **모디스트 타이포**: 디스플레이는 22~28px / 500~700, 본문은 16px / 400 (장문 챕터에서는 17px)

## 마크다운 → HTML 변환

`build.mjs`의 `parseChapter()`가 다음 패턴을 자동 변환합니다:

| 마크다운 | HTML 컴포넌트 |
|---|---|
| `# N장. 제목` + `### 부제` | 챕터 헤더 (64px 번호 + 36px 제목 + 18px 부제) |
| `> "..."` `> — 출처` | `<blockquote class="epigraph">` |
| `## N. 섹션` | `<h2 id="sN" data-section-anchor>` (TOC 스크롤스파이) |
| `> **🏺 고고학 노트 — 제목**` | `sidebar-box--archaeology` |
| `> **📜 원어로 읽기 — 제목**` | `sidebar-box--origin` |
| `> **💡 한 가지 오해 — 제목**` | `sidebar-box--myth` |
| `> **🗺️ 지도/연표 — 제목**` | `sidebar-box--map` |
| `> **[시대적 상황 예시: ...]**` | `<aside class="scene-box">` (검은 라벨) |
| `🔑 **이 장에서 기억할 것**` + `1./2./3.` | 검은 배경 key-takeaway 박스 |

## 반응형

| 브레이크포인트 | 너비 | 핵심 변화 |
|---|---|---|
| Mobile | < 744px | 햄버거 메뉴, 1열 그리드, sticky bottom bar |
| Tablet | 744–1128px | 2열 챕터 카드 |
| Desktop | 1128–1440px | 챕터 상세에 우측 sticky `reading-toc` 등장, 카드 4열 |
| Wide | > 1440px | 컨테이너 1280px 캡 |

## 의존성

- **빌드**: Node.js 24+ (표준 라이브러리만 — `npm install` 불필요)
- **런타임**: 없음 (정적 HTML/CSS/JS)
- **폰트**: Pretendard Variable (jsdelivr CDN) — 네트워크 차단 시 시스템 폰트로 폴백

## 라이선스

본문 텍스트는 학습·교육 목적의 인용을 출처 명기 하에 허용합니다. 빌드 스크립트와 CSS는 자유롭게 사용 가능합니다.
