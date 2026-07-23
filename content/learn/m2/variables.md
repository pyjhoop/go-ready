---
title: "변수 · 상수 · 타입 추론"
slug: "variables"
lessonID: "m2-l1"
type: "code"
estMin: 11
weight: 10
module: "m2"
moduleTitle: "타입 · 함수 · 제어 흐름"
step: 2
summary: "null도 undefined도 없다. 모든 타입에 zero value가 있고, 그 zero value를 '쓸모 있게' 만드는 게 Go 표준 라이브러리 설계의 축이다."
---

변수 선언은 어느 언어에서나 지루한 주제다. 그런데 Go에서는 여기서부터 철학이 갈린다 — **선언된 변수는 언제나 유효한 값을 가진다.** `null`도 `undefined`도, "초기화 안 된 상태"라는 개념 자체가 없다.
{.lead}

## := 와 var — 언제 무엇을

Go에는 변수를 만드는 방법이 두 가지고, 각각의 자리가 명확하다.

{{< gocode file="main.go" output="0 | 3.14 | true | ready" >}}
```go
package main

import "fmt"

const version = "ready" // 컴파일 타임 상수

func main() {
    var count int         // 명시적 선언 — zero value로 초기화(0)
    pi := 3.14            // 짧은 선언 — 타입을 우변에서 추론(float64)
    var ok = true         // var + 추론 (타입 생략 가능)

    fmt.Println(count, "|", pi, "|", ok, "|", version)
}
```
{{< /gocode >}}

- `var count int` — 값을 안 줘도 된다. `int`의 zero value인 `0`으로 채워진다.
- `pi := 3.14` — `:=`는 선언과 대입을 한 번에 하고, 타입은 우변에서 **추론**된다. 함수 본문에서 가장 흔한 형태다.
- `const version` — 상수는 컴파일 타임에 확정된다. 런타임 값(예: 함수 호출 결과)은 상수가 될 수 없다.

`:=`는 편하지만 규칙이 있다. **함수 바깥(패키지 레벨)에서는 쓸 수 없고**, 좌변에 최소 한 개의 새 변수가 있어야 한다.

{{< callout warn >}}
`:=`는 **함수 안에서만** 쓸 수 있다. 그리고 좌변이 전부 기존 변수면 에러다 — `a, err := f()` 다음에 `b, err := g()`는 되지만(`b`가 새 변수), `a, err := g()`를 또 쓰면 "no new variables on left side of :=" 에러다. 이럴 땐 `=`를 쓴다.
{{< /callout >}}

## zero value — nil 체크 지옥의 끝

다른 언어에서 온 사람이 가장 늦게 체감하는 이점이다. JS의 `undefined`, Java의 `null`은 "값이 아직 없음"을 표현하려고 존재하지만, 그 대가로 코드 곳곳이 방어 코드로 뒤덮인다. Go는 이 상태를 아예 없앴다.

모든 타입에는 **zero value**가 정의돼 있다:

- 숫자 → `0`
- 문자열 → `""` (빈 문자열, `null`이 아니다)
- 불리언 → `false`
- 포인터·슬라이스·맵·인터페이스·함수 → `nil`

핵심은 이 zero value가 "임시로 채운 쓰레기 값"이 아니라 **의미 있게 쓸 수 있도록 설계됐다**는 점이다.

{{< contrast from="JS / Java" note="선언만 하면 undefined·null → 쓰기 전에 nil 체크가 흩어진다" to="Go" goNote="선언 즉시 유효한 zero value → '초기화 안 됨' 상태가 존재하지 않는다" >}}

## "zero value를 쓸모 있게" — 표준 라이브러리의 설계 원칙

이건 단순한 편의가 아니라 Go 표준 라이브러리 전체를 관통하는 설계 철학이다. 많은 타입이 **생성자 없이 zero value 그대로 바로 동작하도록** 만들어졌다.

```go
var mu sync.Mutex     // 초기화 없이
mu.Lock()             // 바로 Lock() 가능

var buf bytes.Buffer  // new()도 make()도 없이
buf.WriteString("hi") // 바로 쓰기 가능
```

`sync.Mutex`의 zero value는 "잠기지 않은 뮤텍스"이고, `bytes.Buffer`의 zero value는 "빈 버퍼"다. 둘 다 `New...()` 생성자를 부를 필요가 없다. 다른 언어라면 `new Mutex()`, `new Buffer()`로 초기화해야 할 것을, Go는 `var` 한 줄로 끝낸다.

{{< callout tip >}}
직접 타입을 설계할 때도 이 원칙을 따르면 좋다 — **zero value가 곧바로 유효한 상태가 되도록** 필드를 배치하면, 사용자가 생성자를 잊어도 안전하다. "생성자 없이 바로 쓸 수 있는가?"는 좋은 Go 타입 설계의 리트머스지다.
{{< /callout >}}
