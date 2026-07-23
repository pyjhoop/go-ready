---
title: "함수 — 다중 반환값 & named return"
slug: "functions"
lessonID: "m2-l3"
type: "code"
estMin: 11
weight: 30
module: "m2"
moduleTitle: "타입 · 함수 · 제어 흐름"
step: 2
summary: "(value, error) 하나에 Go의 에러 철학 전체가 압축돼 있다. 에러가 평범한 반환값이 되면, 무시하려면 명시적으로 버려야 한다."
---

Go 함수에서 가장 먼저 눈에 띄는 건 **값을 두 개 이상 반환한다**는 점이다. 그리고 그 두 번째 값이 거의 항상 `error`라는 사실에, 이 언어의 에러 철학 전체가 들어있다.
{.lead}

## (value, error) — 관용구가 된 반환 형태

Go에는 예외(exception)가 없다. 대신 함수가 결과와 에러를 **나란히 반환**한다. 이건 문법 기능이라기보다 언어 전체가 합의한 관용구다.

{{< gocode file="main.go" output="5 0 | division by zero" >}}
```go
package main

import (
    "errors"
    "fmt"
)

func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

func main() {
    q, err := divide(10, 2)
    fmt.Print(q, " ")

    _, err2 := divide(1, 0)
    if err2 != nil {
        fmt.Print("0 | ", err2)
    }
    _ = err
}
```
{{< /gocode >}}

성공하면 `(결과, nil)`을, 실패하면 `(zero value, error)`를 반환한다. 호출부는 `if err != nil`로 즉시 검사한다. 예외처럼 어딘가로 던져져서 제어 흐름이 사라지는 일이 없다 — 에러가 **보이는 곳에** 있다.

핵심은 이게 강제된다는 점이다. 에러가 평범한 반환값이 되면, 그걸 무시하려면 `_`로 **명시적으로 버려야** 한다. "실수로 에러를 놓쳤다"가 아니라 "내가 이 에러를 버리기로 했다"가 코드에 남는다.

{{< contrast from="Python / Java" note="예외를 던지고 try/catch로 잡는다 → 에러 경로가 코드에서 숨는다" to="Go" goNote="(result, error)를 반환하고 호출부가 즉시 검사 → 에러 경로가 항상 보인다" >}}

## named return — 짧은 함수의 문서화

Go는 반환값에 **이름을 붙일 수** 있다. 그러면 함수 시그니처만 봐도 무엇을 돌려주는지 읽힌다.

```go
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return // naked return — x, y를 자동으로 반환
}
```

`x`, `y`는 함수 진입 시 zero value로 미리 선언돼 있고, `return`만 쓰면(naked return) 현재 값들이 반환된다. 시그니처가 `(x, y int)`라 반환값의 **의미가 이름으로 문서화**되는 효과가 있다.

하지만 이건 양날의 검이다. naked return은 짧은 함수에서만 읽기 쉽다. 함수가 길어지면 "지금 `x`에 뭐가 들어있지?"를 추적하기 어려워진다.

{{< callout warn >}}
named return과 naked return은 **짧은 함수의 문서화 용도**로만 쓴다. 함수가 몇십 줄로 길어지면 어디서 값이 바뀌는지 놓치기 쉬우니, 그럴 땐 `return x, y`처럼 명시적으로 값을 적어라. 편의가 가독성을 해치는 순간 관용구가 아니게 된다.
{{< /callout >}}

## 함수는 일급 시민이다

Go에서 함수는 값이다. 변수에 담고, 인자로 넘기고, 반환할 수 있다. 클로저(closure)도 지원해서 바깥 변수를 캡처한다.

이게 왜 중요한가? 표준 라이브러리의 핵심 패턴들이 전부 여기서 나오기 때문이다:

- `http.HandlerFunc` — 함수 하나를 HTTP 핸들러로 넘긴다.
- `sort.Slice(s, func(i, j int) bool { ... })` — 정렬 기준을 함수로 전달한다.

```go
adder := func(delta int) func(int) int {
    return func(x int) int { return x + delta } // delta를 캡처
}
add10 := adder(10)
fmt.Println(add10(5)) // 15
```

`adder`가 반환한 함수는 자신이 태어난 자리의 `delta`를 기억한다. 이 "함수 + 캡처된 환경"이 클로저이고, Go에서 상태를 가진 콜백을 만드는 표준 방법이다. 이 캡처 동작은 다음 레슨의 `for range` 함정으로 곧장 이어진다.
