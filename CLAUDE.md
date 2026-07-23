# CLAUDE.md — Go Ready

Claude Code가 이 저장소에서 작업할 때 따르는 설계 지침서다.
**공개 저장소 · Hugo 정적 사이트 · GitHub Pages 배포**를 전제로 한다.

---

## 0. 가장 먼저 알아야 할 것 (멘탈 모델)

이 저장소는 **콘텐츠(md)를 쓰면 HTML이 생성되는** 구조다. HTML을 직접 쓰지 않는다.

```
content/**/*.md   (레슨 원본)  ─┐
layouts/**        (템플릿·숏코드) ├─→  hugo  ─→  public/**  (생성물, git에 안 올림)
data/*.yaml       (퀴즈 등)     ─┘
```

**규칙 세 줄 요약:**
1. `public/`은 **절대 손대지 않고 커밋하지도 않는다.** 매 빌드마다 통째로 다시 생성된다.
2. Go 코드를 짜는 게 아니다. Hugo는 Go로 만들어진 **바이너리**이고, 우리는 그걸 실행만 한다.
3. 레슨 md 파일 하나 = 페이지 하나 = URL 하나. 파일을 추가하면 사이드바·진도바·목록이 **자동으로** 갱신된다.

---

## 1. 프로젝트 개요

- **이름:** Go Ready
- **한 줄 정의:** 다른 언어를 이미 아는 개발자가 Go를 "빠르게, 관용구까지" 익히도록 돕는 공개 학습 사이트.
- **핵심 가치:** 문법 나열이 아니라 **"내가 아는 언어와 뭐가 다른가"**를 축으로 설명한다.
- **산출물:** Hugo 정적 사이트 → GitHub Pages.
- **콘텐츠 범위:** CURRICULUM.md 기준 8개 모듈 · 약 34개 레슨. v1은 모듈 1~4.

### 대상 독자 프로필 (매우 중요)
- 변수·반복문·함수·클래스는 이미 안다. **기초 프로그래밍은 설명하지 않는다.**
- Python/JS/Java/C++ 중 하나 이상 경험. 설명은 **대조(contrast)** 중심.
- 관심사: 동시성, 에러 처리 철학, 인터페이스, 프로젝트 구조, 표준 라이브러리.

### 콘텐츠 밀도 기준 (놓치기 쉬움)
레슨은 체크리스트 항목이 아니라 **읽을거리**다. 각 레슨은 최소한 다음을 담는다:
- 왜 이렇게 설계됐는가 (역사적·철학적 배경)
- 다른 언어에서 온 사람이 정확히 어디서 미끄러지는가
- 그 함정의 **메커니즘** (현상만 나열하지 말 것)

한두 줄 요약으로 끝내지 않는다. 소제목(`##`) 2~4개로 나눠 서술한다.

---

## 2. 기술 스택 · 필수 버전

| 항목 | 값 | 비고 |
|---|---|---|
| Hugo | **extended v0.146 이상** (개발 기준 v0.164) | extended 필수 |
| 배포 | GitHub Pages + GitHub Actions | `main` 푸시 시 자동 |
| 프런트 | vanilla JS + CSS (프레임워크 없음) | |
| 코드 하이라이트 | Hugo 내장 Chroma (**빌드 타임**) | 런타임 JS 하이라이터 금지 |
| 다이어그램 | 손으로 짠 인라인 SVG | Mermaid 등 런타임 렌더 금지 |
| 진도 저장 | `localStorage` | `window.storage`는 아티팩트 전용 API라 **사용 불가** |

### 로컬 명령
```bash
hugo server                    # 개발 서버 (localhost:1313, 자동 새로고침)
hugo --minify                  # 프로덕션 빌드 → public/
hugo --minify --cleanDestinationDir   # 잔여물까지 정리하고 빌드
```

---

## 3. 저장소 구조

```
.
├── CLAUDE.md                  # 이 파일
├── CURRICULUM.md              # 콘텐츠 마스터 플랜
├── README.md                  # 공개용 소개
├── hugo.toml                  # 사이트 설정
├── .gitignore                 # public/, resources/, .hugo_build.lock
├── .github/workflows/hugo.yml # Pages 배포 자동화
│
├── content/
│   ├── _index.md              # 홈(대시보드)
│   └── learn/
│       ├── _index.md
│       └── m1/                # 모듈 = 디렉터리
│           ├── _index.md      # 모듈 메타(제목/step/summary)
│           ├── why-go.md      # 레슨 = md 파일 = 페이지
│           └── go-command.md
│
├── data/
│   └── quizzes.yaml           # 모든 퀴즈의 단일 진실 원천
│
├── layouts/                   # ⚠ Hugo 0.146+ 신규 경로 규칙
│   ├── baseof.html            # 공통 뼈대
│   ├── home.html              # 대시보드
│   ├── section.html           # 모듈 목록
│   ├── page.html              # 레슨 상세
│   ├── _partials/             # (구 layouts/partials)
│   │   ├── sidebar.html
│   │   ├── aside.html
│   │   └── diagrams/*.html    # 다이어그램 SVG 1개 = 파일 1개
│   └── _shortcodes/           # (구 layouts/shortcodes)
│       ├── contrast.html
│       ├── callout.html
│       ├── diagram.html
│       ├── quiz.html
│       └── gocode.html
│
├── assets/css/main.css        # 디자인 토큰 + 컴포넌트 + Chroma 매핑
└── static/js/app.js           # 런타임에 남는 유일한 로직
```

---

## 4. 콘텐츠 모델 — 레슨 md

### 4.1 Front matter 스키마 (모든 레슨 필수)

```yaml
---
title: "슬라이스의 함정 — append & 공유"   # 페이지 제목
slug: "slices-append"                      # URL 마지막 조각 (영문 kebab-case)
lessonID: "m3-l2"                          # 진도 저장 키. 절대 바꾸지 말 것
type: "code"                               # concept | code | diagram | quiz
estMin: 13                                 # 예상 소요 시간(분)
weight: 20                                 # 모듈 내 정렬 순서 (10, 20, 30...)
module: "m3"                               # 소속 모듈 id
moduleTitle: "슬라이스 · 맵 · 문자열"
step: 3                                    # 모듈 번호(배지 표시용)
summary: "슬라이싱은 백킹 배열을 공유한다."  # 목록/메타 설명에 사용
---
```

> **`lessonID`는 진도 저장의 기본 키다.** 이미 배포된 레슨의 `lessonID`를 바꾸면
> 사용자의 저장된 진도가 끊긴다. 파일명·제목은 바꿔도 되지만 `lessonID`는 고정.

`slug`는 URL이 되므로 **영문**으로 짓는다(한글 URL은 공유 시 퍼센트 인코딩으로 깨져 보인다).

### 4.2 URL 규칙

```
content/learn/m3/slices-append.md  →  /learn/m3/slices-append/
```

`hugo.toml`의 `[permalinks]`가 이 매핑을 담당한다. 레슨마다 **실제 주소가 생기는 것**이
단일 아티팩트 대비 가장 큰 이점이다(공유·북마크·검색 노출).

---

## 5. 숏코드 계약 (본문에서 쓰는 특수 블록)

마크다운 표준 문법으로 표현 안 되는 것은 전부 숏코드로 처리한다.
**숏코드를 우회해서 md 표나 이미지 링크로 대충 대체하지 말 것** — 시각 품질이 거기서 깎인다.

### `contrast` — 대조 박스 (이 프로젝트의 시그니처 UI)
```
{{< contrast from="Java/Python" note="try/catch로 예외를 던진다"
             to="Go" goNote="(result, error)를 반환하고 호출부가 즉시 검사" >}}
```

### `callout` — 팁/함정/정보
```
{{< callout warn >}}★ nil map에 쓰면 **panic**이다.{{< /callout >}}
{{< callout tip >}}...{{< /callout >}}
{{< callout info >}}...{{< /callout >}}
```
- `warn` = 함정(gotcha). CURRICULUM.md의 함정 목록은 **반드시** warn으로 노출한다.
- 특히 중요한 함정은 본문 앞에 `★`를 붙인다.

### `diagram` — 인라인 SVG
```
{{< diagram id="slice-internals" caption="slice = {ptr,len,cap} + 백킹 배열" >}}
```
`id`는 `layouts/_partials/diagrams/<id>.html` 파일명과 일치해야 한다.

### `quiz` — 퀴즈
```
{{< quiz id="q-m3" >}}
```
`id`는 `data/quizzes.yaml`의 최상위 키와 일치해야 한다.

### `gocode` — 코드 블록 (파일명 탭 + 예상 출력)
````
{{< gocode file="main.go" output="Hello, Go!" >}}
```go
package main
...
```
{{< /gocode >}}
````
- 하이라이팅은 Hugo(Chroma)가 **빌드 시점**에 처리한다. 직접 `<span>`을 넣지 말 것.
- `output`은 **미리 계산된 예상 출력**이다. UI에 "실제 실행 아님"으로 정직하게 라벨링되어 있다.
- 코드를 편집 가능하게 만들지 말 것. 편집해도 출력이 안 바뀌면 사용자를 속이는 셈이다.

### 리드 문장
각 레슨 첫 문단은 리드로 강조한다.
```markdown
이 프로젝트에서 가장 중요한 함정이다.
{.lead}
```

---

## 6. 퀴즈 데이터 (`data/quizzes.yaml`)

```yaml
q-m3:
  title: "모듈 3 퀴즈 — 슬라이스 · 맵 · 문자열"
  questions:
    - q: "nil map에 값을 쓰면?"
      options: ["자동 초기화", "무시", "panic", "0 반환"]
      answer: 2          # 0-based 인덱스
      explain: "nil map은 읽기는 되지만 쓰기는 panic이다."
```

- `answer`는 **0부터 시작**하는 인덱스다.
- `explain`은 선택 즉시 공개된다. 정답만 알려주지 말고 **왜**를 쓴다.
- 통과 기준 70%.

---

## 7. 진도 저장 (`localStorage`)

```js
// 키: "go-ready:progress"
{
  completedLessons: { "m1-l1": true, "m3-l2": true },
  updatedAt: 1737600000000
}
```

**규칙:**
- 모든 접근은 `try/catch`. 사생활 보호 모드에서 `localStorage`가 막힐 수 있다.
- 전체 레슨 목록은 `baseof.html`이 빌드 시점에 `#lesson-manifest` JSON으로 주입한다.
  진도율 = 완료 수 / 매니페스트 길이.
- 로그인·서버 동기화는 v1 범위 밖. **기기별 로컬 저장**임을 README에 명시한다.
- "진도 초기화" 버튼 제공(`localStorage.removeItem`).

---

## 8. 디자인 시스템

CSS 변수로만 관리한다. **색상 하드코딩 금지.**

```css
:root {
  --brand:      #14b8a6;  /* teal-500, 포인트 */
  --brand-dark: #0f766e;  /* teal-700, 배너/버튼 hover */
  --brand-soft: #ccfbf1;  /* teal-100, 배지/하이라이트 배경 */
  --bg:         #f8fafc;
  --card:       #ffffff;
  --border:     #e2e8f0;
  --text:       #1e293b;
  --text-muted: #64748b;
  --success:    #10b981;
  --code-bg:    #0f172a;
  --code-text:  #e2e8f0;
  --go-blue:    #00add8;  /* Go 공식 브랜드 컬러 */
}
```

- **폰트:** 본문 `system-ui, -apple-system, "Segoe UI", sans-serif` / 코드 `"JetBrains Mono", "Fira Code", monospace`
- **모서리:** 카드 12px, 버튼/배지 8px
- **그림자:** `0 1px 3px rgba(0,0,0,.06)`
- **레이아웃:** 3-column (사이드바 260px / 본문 / aside 300px). 1080px 이하에서 aside 숨김, 760px 이하에서 사이드바 → 햄버거.
- **다크모드:** v1 생략.

### Chroma 클래스 매핑
`hugo.toml`에서 `noClasses = false`로 두고, `main.css`에서 팔레트를 입힌다.
주요 클래스: `.k`(키워드) `.kt`(타입) `.s`(문자열) `.m`(숫자) `.c1`(주석) `.nf`(함수).

---

## 9. 배포 (GitHub Pages)

### 9.1 baseURL — 가장 흔한 실수
프로젝트 페이지는 `https://<user>.github.io/<repo>/` 처럼 **서브패스**에 서비스된다.

```toml
baseURL = "https://<user>.github.io/<repo>/"   # 끝 슬래시 필수
```

모든 내부 링크는 반드시 `relURL` / `.RelPermalink`를 쓴다.
`/css/main.css` 처럼 루트 절대경로를 하드코딩하면 **서브패스에서 전부 깨진다.**
커스텀 도메인을 쓰면 `baseURL`을 그 도메인으로 바꾼다.

### 9.2 Actions 워크플로 (`.github/workflows/hugo.yml`)
```yaml
name: Deploy Hugo site to Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.164.0
    steps:
      - name: Install Hugo
        run: |
          wget -O ${{ runner.temp }}/hugo.deb \
            https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb
          sudo dpkg -i ${{ runner.temp }}/hugo.deb
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - uses: actions/configure-pages@v5
        id: pages
      - name: Build
        run: hugo --minify --baseURL "${{ steps.pages.outputs.base_url }}/"
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

저장소 Settings → Pages → Source를 **GitHub Actions**로 설정해야 한다.

### 9.3 `.gitignore`
```
public/
resources/
.hugo_build.lock
```

---

## 10. 함정 모음 — 빌드하다 실제로 걸린 것들

Claude Code는 아래를 이미 아는 상태로 작업한다. 같은 실수를 반복하지 말 것.

1. **`<script>` 안의 `jsonify`는 이중 이스케이프된다.**
   Go 템플릿이 스크립트 내용을 JS 문자열로 감싸서, `JSON.parse` 결과가 객체가 아닌 문자열이 된다.
   → 반드시 `{{ ... | jsonify | safeJS }}`.

2. **TOML은 최상단 키가 `[테이블]`보다 위에 와야 한다.**
   `disableKinds`를 `[params]` 아래에 붙이면 `params.disableKinds`가 되어 조용히 무시된다.

3. **Hugo 0.146+ 레이아웃 경로가 바뀌었다.**
   `layouts/partials` → `layouts/_partials`, `layouts/shortcodes` → `layouts/_shortcodes`.
   `_default/` 하위가 아니라 `layouts/` 바로 아래에 `baseof/home/section/page.html`을 둔다.

4. **`window.storage`는 여기서 존재하지 않는다.** 아티팩트 전용 API다. `localStorage`를 쓴다.

5. **`--minify` 빌드는 HTML 속성의 따옴표를 제거한다.**
   `grep 'class="chroma"'`로 검증하면 실패한다. `class=chroma`로 찾아야 한다.

6. **태그/카테고리를 안 쓰면 `disableKinds`로 끈다.** 안 그러면 빈 taxonomy 페이지 경고가 뜬다.

7. **`languageCode`는 deprecated.** `locale`을 쓴다.

---

## 11. Claude Code 작업 규칙

### 레슨을 추가할 때
1. `content/learn/<module>/<slug>.md` 생성. Front matter를 **스키마대로 전부** 채운다.
2. `lessonID`가 CURRICULUM.md의 배정과 일치하는지 확인. 중복 금지.
3. 본문은 §1의 밀도 기준을 지킨다(소제목 2~4개, 왜/메커니즘 포함).
4. 새 다이어그램이 필요하면 `layouts/_partials/diagrams/<id>.html`에 SVG를 추가.
5. 새 퀴즈면 `data/quizzes.yaml`에 항목 추가.
6. **`hugo --minify`를 실행해 빌드가 통과하는지 반드시 확인한다.** 경고도 0이어야 한다.
7. 생성된 `public/`의 해당 페이지를 열어 숏코드가 의도대로 렌더됐는지 확인한다.

### 하지 말 것
- `public/` 안의 파일 편집 또는 커밋
- 레이아웃에 색상 하드코딩 (CSS 변수만)
- 런타임 하이라이터·Mermaid 도입
- `lessonID` 변경
- 외부 이미지·폰트 CDN 추가 (SVG와 시스템 폰트로 해결)
- 기초 프로그래밍 설명 (대상 독자가 이미 안다)

### 커밋 단위
콘텐츠와 레이아웃 변경을 섞지 않는다.
`content: add m3-l2 slices gotcha` / `layout: fix quiz shortcode escaping` 처럼 분리한다.

---

## 12. 톤 & 카피 가이드

- 배너: 학습 동기부여형. 예) "You already know how to code — let's make you *think in Go*."
- 설명은 짧고 대조 중심. **"Go에는 X가 없다. 대신 Y다."** 패턴 선호.
- 함정은 반드시 `callout warn`. 경험자가 실제로 헛디디는 지점을 명시.
- 인터페이스 카피는 사용자가 통제하는 것의 이름으로 쓴다. "제출"이 아니라 "완료로 표시".
- 빈 상태·에러는 무드가 아니라 **방향 제시**로. 무엇이 잘못됐고 어떻게 고치는지.

---

## 13. 마일스톤

| # | 내용 | 상태 |
|---|------|------|
| M0 | Hugo 골격 + 레이아웃 + 디자인 토큰 + 숏코드 5종 | ✅ 완료 |
| M1 | 진도(localStorage) + 대시보드 진도바 + 퀴즈 엔진 | ✅ 완료 |
| M2 | 모듈 1~4 레슨 md 17개 전량 작성 | ⬜ |
| M3 | 다이어그램 SVG 6종 (§CURRICULUM 마스터 리스트) | ⬜ (1/6) |
| M4 | GitHub Actions 배포 + README + 커스텀 404 | ⬜ |
| M5 | 모듈 5~8 콘텐츠 | ⬜ |
| M6 | 접근성 점검, 반응형 마감, OG 이미지/메타 | ⬜ |

> **v1 정의:** M0~M4. 즉 모듈 1~4 콘텐츠가 GitHub Pages에 배포되어 공개 접근 가능한 상태.
