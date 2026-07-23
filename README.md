# Go Ready — Hugo 정적 사이트 (한 세트 예시)

단일 HTML 아티팩트를 **md + Hugo**로 옮긴 최소 실증 세트다.
레슨 2개(모듈 3)만 넣었고, 나머지는 같은 패턴을 반복하면 된다.

## 빌드

```bash
hugo --minify          # → public/ 에 페이지별 HTML 생성
hugo server            # 로컬 미리보기 (localhost:1313)
```

## 구조

```
content/learn/m3/slices-append.md   ← 레슨 1개 = md 1개 = 페이지 1개
                 maps.md
data/quizzes.yaml                   ← 퀴즈 단일 진실 원천
layouts/
  baseof.html                       ← 공통 뼈대(사이드바·진도바가 전 페이지에 자동 적용)
  home.html / section.html / page.html
  _partials/sidebar.html, aside.html
  _partials/diagrams/*.html         ← 인라인 SVG (아티팩트에서 그대로 이식)
  _shortcodes/                      ← 아티팩트의 renderBlock 분기가 여기로 옮겨옴
    contrast.html  callout.html  diagram.html  quiz.html  gocode.html
assets/css/main.css                 ← CLAUDE.md 디자인 토큰 + Chroma 클래스 매핑
static/js/app.js                    ← 런타임에 남는 유일한 로직
```

## 빌드 결과 (public/)

```
index.html                          /
learn/index.html                    /learn/
learn/m3/index.html                 /learn/m3/
learn/m3/slices-append/index.html   /learn/m3/slices-append/
learn/m3/maps/index.html            /learn/m3/maps/
```

**한 개가 아니라 레슨 수만큼 HTML이 나온다.** 이게 페이지 분리의 실체다.

## 아티팩트와 달라진 점

| | 단일 아티팩트 | Hugo |
|---|---|---|
| 코드 하이라이트 | 런타임 JS 토크나이저 | **빌드 시점 Chroma** → 색칠된 HTML을 그대로 전송 |
| 다이어그램 | 인라인 SVG (JS로 조립) | 인라인 SVG (빌드 때 삽입) — 시각 결과 동일 |
| 진도 저장 | `window.storage` | `localStorage` (아티팩트 전용 API라 밖에선 못 씀) |
| 전송량 | 93KB, 레슨 1개 봐도 전부 | 페이지당 14KB (+CSS/JS는 최초 1회 캐시) |
| URL | 없음(화면 전환) | 레슨마다 실제 주소 → 공유·북마크·검색 노출 |

## 콘텐츠 추가하는 법

`content/learn/mN/제목.md` 하나 만들고 front matter만 채우면 사이드바·진도바·페이지가
전부 자동 생성된다. 레이아웃은 건드릴 필요 없다.
