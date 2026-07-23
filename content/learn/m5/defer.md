---
title: "defer — 정리를 선언 옆에 붙인다"
slug: "defer"
lessonID: "m5-l3"
type: "code"
estMin: 10
weight: 30
module: "m5"
moduleTitle: "에러 처리 · panic · defer"
step: 5
summary: "defer는 함수가 끝날 때 실행을 예약한다. 여는 코드 바로 옆에 닫는 코드를 두어 리소스 누수를 막는다. 단, 인자는 defer를 만나는 순간 평가된다."
---

`defer`는 뒤에 오는 함수 호출을 **지금 실행하지 않고, 현재 함수가 리턴할 때 실행하도록 예약**한다. 파일을 여는 줄 바로 아래에 닫는 줄을 둘 수 있어, 정리를 잊는 실수를 구조적으로 막는다.
{.lead}

## 여는 곳 옆에 닫는 곳을 둔다

리소스 누수의 근본 원인은 "여는 코드"와 "닫는 코드"가 멀리 떨어져 있다는 것이다. 그 사이에 `return`이 여러 개 생기면 어느 경로에서 닫기를 빠뜨리기 쉽다. `defer`는 이 거리를 없앤다:

```go
f, err := os.Open(path)
if err != nil {
    return err
}
defer f.Close()   // 열자마자 닫기를 예약 — 어느 return으로 나가든 실행된다

// 이 아래에서 return이 몇 개든, f.Close()는 반드시 불린다
```

`defer f.Close()`는 함수가 **어떤 경로로 끝나든**(정상 return이든, 에러 return이든, 심지어 panic이든) 실행된다. 그래서 정리 코드가 딱 한 줄, 딱 한 곳에 있으면 된다.

## LIFO — 쌓인 역순으로 풀린다

여러 개를 `defer`하면 **스택처럼 쌓였다가 역순(LIFO)으로** 실행된다. 나중에 예약한 것이 먼저 풀린다. 자원을 A→B→C 순으로 열었으면 C→B→A 순으로 닫는 게 자연스러운데, LIFO가 정확히 그 순서를 준다.

{{< gocode file="main.go" output="작업 시작\n작업 끝\ndefer 3\ndefer 2\ndefer 1" >}}
```go
package main

import "fmt"

func main() {
    defer fmt.Println("defer 1") // 가장 먼저 예약 → 가장 나중 실행
    defer fmt.Println("defer 2")
    defer fmt.Println("defer 3") // 가장 나중 예약 → 가장 먼저 실행

    fmt.Println("작업 시작")
    fmt.Println("작업 끝")
}
```
{{< /gocode >}}

## ★ 인자는 defer를 만나는 순간 평가된다

가장 많이 걸려 넘어지는 지점이다. `defer f(x)`에서 `x`는 **함수가 리턴할 때가 아니라, `defer` 문을 만나는 그 순간** 평가되어 고정된다. 실행만 미뤄질 뿐, 인자는 지금 값으로 얼어붙는다.

{{< gocode file="main.go" output="지금 값: 10\n(함수 종료 시) defer가 본 값: 10" >}}
```go
package main

import "fmt"

func main() {
    x := 10
    defer fmt.Println("(함수 종료 시) defer가 본 값:", x) // 여기서 x=10이 박제됨

    x = 99 // 이후에 바꿔도
    fmt.Println("지금 값:", x)
    // defer는 여전히 10을 출력한다 — 인자가 defer 시점에 평가됐기 때문
}
```
{{< /gocode >}}

`x`를 나중에 `99`로 바꿔도 defer는 `10`을 출력한다. 만약 **함수가 끝날 때의 최신 값**을 쓰고 싶다면 클로저로 감싸라: `defer func() { fmt.Println(x) }()`. 이러면 `x`를 실행 시점에 읽는다.

{{< callout warn >}}
★ **defer의 인자는 defer 시점에 평가된다.** `defer resp.Body.Close()`처럼 대상 자체가 나중에 nil로 바뀔 수 있으면 특히 조심하라. 그리고 **루프 안 defer 누적**을 경계하라 — `for` 안에서 `defer f.Close()`를 쓰면 닫기가 루프가 아니라 **함수 전체가 끝날 때** 한꺼번에 실행된다. 파일 수천 개를 여는 루프라면 핸들이 계속 쌓여 고갈된다. 루프 바디를 별도 함수로 빼내 그 함수가 끝날 때마다 정리되게 하라.
{{< /callout >}}

{{< callout tip >}}
named return과 결합하면 defer로 **반환값을 사후 가공**할 수 있다: `func do() (err error) { defer func() { if err != nil { err = fmt.Errorf("wrap: %w", err) } }() ... }`. 다음 레슨의 `recover`도 바로 이 메커니즘 위에서 동작한다.
{{< /callout >}}

{{< contrast from="Java try-with-resources / Python with" note="블록 스코프를 벗어날 때 자동 정리 — 여는 곳과 스코프가 묶여 있다" to="Go" goNote="defer로 여는 줄 바로 옆에 정리를 예약 — 스코프가 아니라 함수 종료에 묶이고, LIFO로 역순 실행" >}}
