# CURRICULUM.md — Go for Experienced Developers

**대상:** 다른 언어를 이미 아는 개발자. 기초 프로그래밍은 건너뛴다.
**설계 철학:** "새 언어 문법 암기"가 아니라 **"내가 아는 언어와 뭐가 다른가"**를 축으로 삼는다.

이 문서는 **콘텐츠 마스터 플랜**이다. 각 레슨의 파일 경로 · `lessonID` · 쓸 숏코드를 명시한다.
(CLAUDE.md §4 front matter 스키마와 1:1 매핑)

전체 구성: **8개 모듈 · 34개 레슨.** v1은 모듈 1~4(17개 레슨)를 콘텐츠로 채운다.

---

## 진도 개요

| # | 모듈 | 디렉터리 | 레슨 수 | 핵심 질문 |
|---|------|---------|--------|-----------|
| 1 | Go의 세계관 & 툴링 | `content/learn/m1/` | 4 | 왜 이렇게 단순한가? |
| 2 | 타입 · 함수 · 제어 | `content/learn/m2/` | 4 | 익숙하지만 미묘하게 다른 것들 |
| 3 | 슬라이스 · 맵 · 문자열 | `content/learn/m3/` | 4 | 여기서 다들 헛디딘다 |
| 4 | 구조체 · 메서드 · 인터페이스 | `content/learn/m4/` | 5 | 상속 없이 어떻게? |
| 5 | 에러 처리 · panic · defer | `content/learn/m5/` | 4 | 예외가 없는 세상 |
| 6 | 동시성: goroutine & channel | `content/learn/m6/` | 6 | Go의 진짜 매력 |
| 7 | 패키지 · 모듈 · 표준 라이브러리 | `content/learn/m7/` | 4 | 실전 프로젝트 구조 |
| 8 | 제네릭 · 테스트 · 관용구 | `content/learn/m8/` | 3 | 마무리와 프로덕션 감각 |

### 모듈 `_index.md` 형식
각 모듈 디렉터리에 아래 파일이 필요하다.
```yaml
---
title: "슬라이스 · 맵 · 문자열"
module: "m3"
step: 3
weight: 30          # 모듈 정렬 (10, 20, 30...)
summary: "경험자가 가장 많이 헛디디는 함정 집중 구간"
---
```

---

## 모듈 1 — Go의 세계관 & 툴링

> "Go는 의도적으로 기능이 적다. 그게 핵심이다."

### 1.1 Go가 다른 언어와 다른 점
`m1/why-go.md` · `lessonID: m1-l1` · `type: concept` · `estMin: 9` · `weight: 10`

- 왜 만들어졌나: 구글의 진짜 문제는 "프로그램이 느린 것"이 아니라 **"엔지니어링이 느린 것"**이었다.
- **뺄셈의 설계:** 기능 하나의 비용이 팀 전체에 곱해진다. 무엇을 넣지 않을지가 더 어려운 결정.
- 무엇을 왜 뺐나 — 상속(추적 불가한 계층), 예외(제어 흐름을 숨김), 오버로딩·삼항·while(같은 걸 여러 방식으로).
- 있는 것: 강력한 표준 라이브러리, 내장 동시성, 단일 바이너리, `gofmt`.
- `contrast`: 대부분의 언어(표현력↑ → 읽기 어려움) → Go(표현력 제한 → 6개월 뒤 남이 읽을 수 있음)
- `callout info`: 목표 독자는 '천재'가 아니라 **'큰 팀의 평균 엔지니어'**.

### 1.2 go 커맨드 한 바퀴
`m1/go-command.md` · `lessonID: m1-l2` · `type: code` · `estMin: 10` · `weight: 20`

- 도구 생태계 파편화가 없다는 것 자체가 철학의 연장.
- `go run` / `build` / `test` / `vet` / `fmt` / `mod` 각각 언제 쓰나.
- `gocode`: 최소 `main.go` → 출력 `Hello, Go!`
- `contrast`: Node·Java(도구가 흩어짐) → Go(go run 한 방)
- `callout tip`: `gofmt`는 협상 불가 — **포매터의 탈을 쓴 사회 공학**. 스타일 논쟁이 문화적으로 사라진다.
- `callout info`: "설정 파일이 없다"가 곧 기능이다.

### 1.3 Hello, Go — 프로그램 해부
`m1/hello-go.md` · `lessonID: m1-l3` · `type: code` · `estMin: 10` · `weight: 30`

- `package main`, `import`, `func main()`.
- **대문자가 곧 접근 제어자** — 키워드 없이 이름으로 가시성 결정. 선언부 스캔만으로 공개 API가 보인다.
- `callout warn`: 미사용 import/변수 = **컴파일 에러**. 컴파일러를 '첫 번째 코드 리뷰어'로 세운 것.
- 왜 대규모에서 중요한가: "이거 아직 쓰나?"라는 회색지대를 제거 → 코드베이스 부패 속도를 늦춘다.
- `contrast`: Python/JS(미사용 무시 → 쌓임) → Go(에러 → 안 썩는다)

### 1.4 프로젝트 구조 & 모듈 감 잡기
`m1/modules-intro.md` · `lessonID: m1-l4` · `type: concept` · `estMin: 8` · `weight: 40`

- import 경로가 URL처럼 생긴 이유: **이름과 위치가 하나**. 중앙 레지스트리 이름 선점 전쟁이 없다.
- 패키지 = 디렉터리. `go.mod`가 루트와 이름을 정의.
- `contrast`: Java/Node → Go(go.mod + import 경로)
- `callout warn`: **순환 import 금지** — 의존성 그래프를 강제로 트리로 유지.
- `quiz`: `q-m1-basics`

---

## 모듈 2 — 타입 · 함수 · 제어 흐름

> "익숙해 보이지만, 방심하면 미끄러지는 지점들."

### 2.1 변수 · 상수 · 타입 추론
`m2/variables.md` · `lessonID: m2-l1` · `type: code` · `estMin: 11` · `weight: 10`

- null도 undefined도 없다. 모든 타입에 **zero value**.
- **"zero value를 쓸모 있게"** — 표준 라이브러리 설계 원칙. `var mu sync.Mutex`가 생성자 없이 바로 `Lock()`, `var buf bytes.Buffer`가 바로 `Write()`.
- `gocode`: var/`:=`/const/zero value 출력 예제
- `callout warn`: `:=`는 함수 안에서만, 좌변에 새 변수 최소 1개.
- `contrast`: JS/Java(undefined·null → nil 체크 지옥) → Go(항상 유효한 zero value)

### 2.2 기본 타입 & 형 변환
`m2/types-conversion.md` · `lessonID: m2-l2` · `type: code` · `estMin: 9` · `weight: 20`

- 암묵적 변환의 대가: 조용한 정밀도 손실, 부호 꼬임, 안 보이는 오버플로. 컴파일도 테스트도 통과하다 프로덕션에서 터진다.
- **시끄러운 명시 > 조용한 마법.** 변환 표기는 "여기서 의미가 바뀐다"는 표지판.
- `byte`=`uint8`, `rune`=`int32` 별칭 (모듈 3 복선)
- `gocode`: `int + float64` 에러 → `float64(i) + f`
- `callout warn`: 숫자 **리터럴**은 유연하지만 타입 정해진 **변수**끼리는 반드시 명시 변환.
- `contrast`: JS/Python(느슨) → Go(전부 명시)

### 2.3 함수 — 다중 반환값 & named return
`m2/functions.md` · `lessonID: m2-l3` · `type: code` · `estMin: 11` · `weight: 30`

- `(value, error)`가 에러 철학 전체를 압축. 에러가 평범한 반환값이 되면 무시하려면 `_`로 **명시적으로 버려야** 한다.
- named return과 naked return의 미묘함 — 짧은 함수의 문서화 용도. 긴 함수에서 남용 금지.
- 일급 함수·클로저 → `http.HandlerFunc`, `sort.Slice`의 토대.
- `gocode`: `divide(a, b) (int, error)`
- `contrast`: Python/Java → Go

### 2.4 제어 흐름 — if / for / switch
`m2/control-flow.md` · `lessonID: m2-l4` · `type: code` · `estMin: 11` · `weight: 40`

- 반복문 키워드가 `for` 하나뿐. 4가지 형태로 전부 표현.
- `if` 초기화문이 스코프를 좁힌다 — `if err := doThing(); err != nil`.
- switch: 자동 break, 다중 값 case, 조건 없는 switch로 if-else 체인 대체.
- `callout warn` ★: **for range 변수 캡처**. Go 1.22 이전 재사용 → goroutine/클로저가 마지막 값만 캡처.
- 의미심장한 지점: Go 팀이 **하위호환 원칙을 깨면서까지** 고쳤다 = 그만큼 많이 당했다는 뜻.
- `contrast`: C/Java(break 필수) → Go(자동 break)
- `quiz`: `q-m2`

---

## 모듈 3 — 슬라이스 · 맵 · 문자열

> "경험자가 가장 많이 헛디디는 모듈. 함정 집중 구간."

### 3.1 배열 vs 슬라이스
`m3/arrays-slices.md` · `lessonID: m3-l1` · `type: diagram` · `estMin: 12` · `weight: 10`

- **헤더 `{ptr, len, cap}` 하나만 새기면 이 모듈의 모든 함정이 풀린다.**
- 배열=고정 길이 값 타입(넘기면 통째 복사). 슬라이스=3-워드 헤더.
- **왜 "값이면서 참조처럼" 구는가:** 헤더는 복사되지만 포인터는 같은 배열을 가리킨다.
  → 원소 수정은 보이고, append 재할당은 안 보인다.
- `diagram`: `slice-internals`
- `contrast`: JS Array/Python list → Go

### 3.2 슬라이스의 함정 — append & 공유 ★
`m3/slices-append.md` · `lessonID: m3-l2` · `type: code` · `estMin: 13` · `weight: 20`

- 슬라이싱은 새 배열을 만들지 않는다. **공유하는 뷰**를 만든다.
- append 재할당 규칙(cap 초과 시 ~2배). 재할당 시점이 공유가 끊기는 순간 — 예측이 어렵다.
- 더 교묘한 버그: `sub := s[0:2]; sub = append(sub, x)` → cap 여유가 있으면 **`s[2]`를 조용히 덮어쓴다.**
- 방어법: `copy()` / full-slice 표현식 `s[low:high:max]`로 cap 제한.
- `gocode`: 공유 버그 재현 + copy로 해결
- `callout warn` ★: 라이브러리가 인자 슬라이스에 append하면 호출자 데이터를 오염시킨다.

### 3.3 맵(map)
`m3/maps.md` · `lessonID: m3-l3` · `type: code` · `estMin: 10` · `weight: 30`

- `make`, comma-ok `v, ok := m[k]`.
- **순회 순서는 일부러 랜덤이다.** 우연히 유지되는 순서에 의존하는 걸 막으려는 의도적 설계.
- `gocode`: comma-ok + nil map 읽기
- `callout warn`: nil map 읽기 OK / **쓰기 panic** — 이 비대칭 때문에 구조체 필드에서 make를 잊으면 첫 쓰기에 터진다.
- `callout info`: 동시 쓰기 시 `fatal error: concurrent map writes` (모듈 6 복선)
- `contrast`: Python dict/JS Object → Go

### 3.4 문자열 · rune · byte
`m3/strings-runes.md` · `lessonID: m3-l4` · `type: code` · `estMin: 11` · `weight: 40`

- **"문자열은 문자의 배열"이라는 추상화는 거짓말이었다.** Go는 진실을 드러낸다.
- 불변 byte 슬라이스 + UTF-8. `s[i]`는 i번째 바이트.
- `len`은 바이트, `range`는 rune 디코딩 → 인덱스가 0, 3으로 점프.
- 왜 불편하게 만들었나: 가변 길이 인코딩에서 O(1) 문자 접근은 **원천적으로 불가능**. 다른 언어는 비용을 숨긴다.
- `gocode`: `len("한글")`=6, `len([]rune)`=2, range 순회
- `callout warn`: 문자 수·자르기에 `len`/`s[i]` 쓰면 멀티바이트에서 깨진다.
- `contrast`: Java/Python → Go
- `quiz`: `q-m3`

---

## 모듈 4 — 구조체 · 메서드 · 인터페이스

> "상속이 없다. 그런데도 잘 굴러간다. 어떻게?"

### 4.1 구조체 & 임베딩
`m4/structs-embedding.md` · `lessonID: m4-l1` · `type: code` · `estMin: 11` · `weight: 10`

- 임베딩은 상속처럼 보이지만 **has-a에 문법 설탕**을 얹은 것.
- **상속과 무엇이 다른가:** 가상 디스패치가 없다. 하위에서 정의하면 **가릴(shadow) 뿐 오버라이드가 아니다.**
  `Animal.Speak()` 내부의 호출은 여전히 `Animal`의 것. `super`도 체인도 없다.
- 다형성이 필요하면 상속이 아니라 인터페이스로(4.4).
- `gocode`: `Dog{Animal}` 승격
- `contrast`: Java/C++ → Go
- `callout info`: extends가 아예 없으니 취약한 클래스 트리를 만들 방법 자체가 없다.

### 4.2 메서드 & 리시버 (값 vs 포인터) ★
`m4/methods-receivers.md` · `lessonID: m4-l2` · `type: code` · `estMin: 12` · `weight: 20`

- 다른 언어의 `this`는 항상 참조. Go는 **복사본인지 원본인지 직접 고른다.**
- `diagram`: `value-vs-pointer-receiver`
- `gocode`: `IncValue`(0) vs `IncPtr`(1)
- `callout warn` ★: 값 리시버는 복사본 수정 → 원본 안 바뀜.
- **실전 규칙 4가지:** 상태 변경 시 포인터 / 큰 구조체는 포인터 / 한 타입 안에서 일관되게 / 슬라이스·맵 필드는 값 리시버여도 공유됨.
- `callout info`: 포인터 리시버 메서드는 값의 메서드 셋에 없다 → 인터페이스 만족에 영향(4.4 복선).

### 4.3 포인터 (짧고 굵게)
`m4/pointers.md` · `lessonID: m4-l3` · `type: concept` · `estMin: 8` · `weight: 30`

- **포인터 산술이 없다.** 이 뺄셈 하나가 C의 위험 대부분을 없앤다.
- **GC + 이스케이프 분석** — C라면 지역 변수 주소 반환이 댕글링이지만 Go는 안전. `return &LocalStruct{}`가 관용적.
- `new(T)`보다 `&T{...}`를 훨씬 자주 쓴다.
- `gocode`: `&`/`*`/nil 포인터
- `contrast`: C(산술 O·위험)/Java(숨김) → Go
- `callout tip`: 안 무서운 이유는 **산술 제거 + GC + 이스케이프 분석**의 조합. 하나라도 빠지면 무서워진다.

### 4.4 인터페이스 — 암묵적 만족 ★
`m4/interfaces.md` · `lessonID: m4-l4` · `type: diagram` · `estMin: 14` · `weight: 40`

- 컴파일 타임에 검사되는 덕 타이핑. 구현하는 쪽은 인터페이스를 **import조차 안 해도 된다.**
- **의존성이 뒤집힌다:** 인터페이스를 *쓰는 쪽*에서 정의. "Accept interfaces, return structs".
  `io.Reader`가 메서드 1개인 이유 — 작은 인터페이스의 조합이 유연성을 만든다.
- `diagram`: `interface-satisfaction`
- `gocode`: `Cat` → `Speaker` 자동 만족
- `callout warn` ★: **nil 인터페이스 함정.** 인터페이스는 (타입, 값) 쌍.
  `*MyError`의 nil을 `error`로 반환하면 (타입 채워짐, 값 nil) → **`err != nil`이 참이 된다.**
  규칙: 에러 없으면 그냥 `nil`을 반환하라.
- `contrast`: Java/C#(implements 명시) → Go(구조적 타이핑)

### 4.5 타입 단언 & 타입 스위치
`m4/type-assertion.md` · `lessonID: m4-l5` · `type: code` · `estMin: 10` · `weight: 50`

- `v, ok := i.(T)` comma-ok vs 단일 형태(실패 시 panic).
- **`any` 남용은 신호다** — 타입 안전성을 런타임으로 미루는 것. 대개 더 나은 인터페이스나 제네릭이 답.
- 외부 데이터 파싱·라이브러리 경계에서만 쓴다.
- `gocode`: type switch + comma-ok
- `contrast`: Java(instanceof + 캐스팅) → Go
- `quiz`: `q-m4`

---

## 모듈 5 — 에러 처리 · panic · defer

> "예외를 던지지 않는다. 에러는 그냥 값이다."

### 5.1 에러는 값이다
`m5/errors-are-values.md` · `lessonID: m5-l1` · `type: diagram` · `estMin: 12` · `weight: 10`
- `error` 인터페이스, `if err != nil` 관용구, `errors.New` / `fmt.Errorf`.
- `diagram`: `error-flow` · `contrast`: try/catch → (result, error)
- `callout info`: 장황해 보이지만 제어 흐름이 명시적 = 예측 가능.

### 5.2 에러 래핑 & 검사
`m5/error-wrapping.md` · `lessonID: m5-l2` · `type: code` · `estMin: 10` · `weight: 20`
- `%w` 래핑, `errors.Is`(값) / `errors.As`(타입 추출). · `contrast`: Java 예외 체이닝 → Go

### 5.3 defer
`m5/defer.md` · `lessonID: m5-l3` · `type: code` · `estMin: 10` · `weight: 30`
- LIFO, 리소스 정리. `callout warn` ★: **인자는 defer 시점에 평가**. 루프 안 defer 누적 주의.
- `contrast`: try-with-resources/`with` → defer

### 5.4 panic & recover
`m5/panic-recover.md` · `lessonID: m5-l4` · `type: code` · `estMin: 10` · `weight: 40`
- `recover()`는 defer 안에서만. `callout warn`: panic 남발 금지. · `quiz`: `q-m5`

---

## 모듈 6 — 동시성: goroutine & channel

> "이거 하나 때문에 Go 배우는 사람이 많다."

### 6.1 goroutine
`m6/goroutines.md` · `lessonID: m6-l1` · `type: diagram` · `estMin: 12` · `weight: 10`
- 경량 스레드, 수천 개. `diagram`: `goroutine-scheduler` (G-M-P)
- `callout warn`: main이 끝나면 goroutine도 죽는다.

### 6.2 channel 기초
`m6/channels.md` · `lessonID: m6-l2` · `type: diagram` · `estMin: 14` · `weight: 20`
- unbuffered vs buffered. `diagram`: `goroutine-channel`
- `contrast`: 공유 메모리+lock → "통신으로 메모리 공유"

### 6.3 select
`m6/select.md` · `lessonID: m6-l3` · `type: code` · `estMin: 12` · `weight: 30`
- `default`, 타임아웃(`time.After`). · `contrast`: Promise.race → select

### 6.4 sync 패키지
`m6/sync.md` · `lessonID: m6-l4` · `type: code` · `estMin: 12` · `weight: 40`
- WaitGroup / Mutex / Once. `callout warn` ★: 데이터 레이스 → `go run -race`
- `callout tip`: channel이 항상 정답은 아니다. 단순 카운터엔 Mutex.

### 6.5 context
`m6/context.md` · `lessonID: m6-l5` · `type: code` · `estMin: 12` · `weight: 50`
- 취소/타임아웃/값 전파. · `contrast`: AbortController → context

### 6.6 동시성 패턴
`m6/patterns.md` · `lessonID: m6-l6` · `type: code` · `estMin: 14` · `weight: 60`
- worker pool, fan-out/in, pipeline. · `quiz`: `q-m6`

---

## 모듈 7 — 패키지 · 모듈 · 표준 라이브러리

### 7.1 패키지 & 가시성 & init
`m7/packages.md` · `lessonID: m7-l1` · `type: concept` · `estMin: 8` · `weight: 10`

### 7.2 모듈 관리
`m7/go-mod.md` · `lessonID: m7-l2` · `type: code` · `estMin: 10` · `weight: 20`

### 7.3 표준 라이브러리 투어
`m7/stdlib-tour.md` · `lessonID: m7-l3` · `type: code` · `estMin: 14` · `weight: 30`
- `callout tip`: 프레임워크 없이 표준 lib만으로 웹 서버가 된다.

### 7.4 JSON & 태그
`m7/json.md` · `lessonID: m7-l4` · `type: code` · `estMin: 10` · `weight: 40`
- `callout warn`: unexported 필드는 JSON에 안 나온다. · `quiz`: `q-m7`

---

## 모듈 8 — 제네릭 · 테스트 · 관용구

### 8.1 제네릭
`m8/generics.md` · `lessonID: m8-l1` · `type: code` · `estMin: 12` · `weight: 10`
- `callout tip`: 인터페이스로 충분하면 제네릭 쓰지 마라.

### 8.2 테스트 & 벤치마크
`m8/testing.md` · `lessonID: m8-l2` · `type: code` · `estMin: 12` · `weight: 20`
- table-driven test가 Go 관용구. · `contrast`: JUnit/pytest(외부) → 표준 내장

### 8.3 관용적 Go & 마무리
`m8/idiomatic-go.md` · `lessonID: m8-l3` · `type: concept` · `estMin: 10` · `weight: 30`
- 함정 총정리 콜아웃 + 다음 학습 경로. · `quiz`: `q-m8`

---

## 다이어그램 마스터 리스트

파일 위치: `layouts/_partials/diagrams/<id>.html` (인라인 SVG, 외부 이미지 금지)

| id | 사용 레슨 | 설명 | 상태 |
|----|----------|------|------|
| `slice-internals` | 3.1, 3.2 | slice{ptr,len,cap} + 백킹 배열, append 재할당 | ✅ |
| `value-vs-pointer-receiver` | 4.2 | 값/포인터 리시버 메모리 차이 | ⬜ |
| `interface-satisfaction` | 4.4 | 구조체 메서드셋 → 인터페이스 암묵 만족 | ⬜ |
| `error-flow` | 5.1 | 값으로서 error가 호출부로 전파 | ⬜ |
| `goroutine-channel` | 6.2 | goroutine들이 channel로 통신 | ⬜ |
| `goroutine-scheduler` | 6.1 | G-M-P 모델 간략화 | ⬜ |

SVG 규칙: `viewBox` 기준 반응형, 색은 CSS 변수(`var(--brand)`, `var(--go-blue)`, `var(--text)`),
`role="img"` + `aria-label` 필수.

---

## 퀴즈 마스터 리스트

파일 위치: `data/quizzes.yaml` (최상위 키 = 아래 id)

| id | 모듈 | 문항 | 핵심 | 상태 |
|----|------|------|------|------|
| `q-m1-basics` | 1 | 3 | export 규칙, 미사용 변수, run vs build | ⬜ |
| `q-m2` | 2 | 3 | 짧은 선언 스코프, 형 변환, switch | ⬜ |
| `q-m3` | 3 | 3 | nil map, len 바이트, 슬라이스 공유 | ✅ |
| `q-m4` | 4 | 4 | 임베딩, 리시버, 인터페이스, nil 인터페이스 | ⬜ |
| `q-m5` | 5 | 3 | err 관용구, defer 평가, panic vs error | ⬜ |
| `q-m6` | 6 | 4 | unbuffered, main 종료, select, race | ⬜ |
| `q-m7` | 7 | 4 | 가시성, go mod, json 태그, unexported | ⬜ |
| `q-m8` | 8 | 3 | 제네릭 vs 인터페이스, test, race 플래그 | ⬜ |

---

## "함정(gotcha)" 총목록 — 이 프로젝트의 차별점

각 레슨에서 반드시 `{{< callout warn >}}`로 노출한다. ★는 특히 중요(본문에도 ★ 표기).

| # | 함정 | 레슨 |
|---|------|------|
| 1 | 미사용 변수/import = 컴파일 에러 | 1.3 |
| 2 | 암묵적 형 변환 없음 | 2.2 |
| 3 | `for range` 변수 캡처 — Go 1.22 전후 차이 | 2.4 |
| 4 | ★ 슬라이스 백킹 공유 → 예기치 못한 수정 | 3.2 |
| 5 | nil map에 쓰기 → panic | 3.3 |
| 6 | `len(s)`는 바이트 수 | 3.4 |
| 7 | ★ 값 리시버는 원본 안 바꿈 | 4.2 |
| 8 | ★ nil 인터페이스 vs 값이 nil인 인터페이스 | 4.4 |
| 9 | ★ defer 인자는 defer 시점에 평가 | 5.3 |
| 10 | main 종료 시 goroutine 사망 | 6.1 |
| 11 | ★ 데이터 레이스 — `-race`로 탐지 | 6.4 |
| 12 | unexported 필드는 JSON에 안 나옴 | 7.4 |
| 13 | goroutine 누수 | 8.3 |

모듈 8.3에서 이 표 전체를 회고 콜아웃으로 다시 노출한다.

---

## 작성 순서 (권장)

1. 모듈 3 (`m3-l1`, `m3-l3`, `m3-l4`) — 3.2는 이미 있음. 함정 밀도가 가장 높아 톤이 잡힌다.
2. 모듈 4 (5개) — 다이어그램 2종 동반 제작.
3. 모듈 1~2 (8개) — 상대적으로 서술 위주라 빠르다.
4. 퀴즈 4종(`q-m1-basics`, `q-m2`, `q-m4`) 채우기 → **v1 완성.**
5. 이후 모듈 5~8.
