---
title: "context — 취소와 마감을 전파한다"
slug: "context"
lessonID: "m6-l5"
type: "code"
estMin: 12
weight: 50
module: "m6"
moduleTitle: "동시성: goroutine & channel"
step: 6
summary: "요청 하나가 여러 goroutine으로 퍼질 때, 취소·타임아웃·마감을 그 전체 트리에 전파하는 표준 도구가 context다. 첫 인자 ctx는 Go 서버 코드의 관용구다."
---

goroutine을 띄우기는 쉽지만 **멈추게 하기**는 어렵다. 사용자가 요청을 취소했거나 제한 시간이 지났을 때, 그 요청을 위해 퍼진 모든 goroutine에게 "이제 그만"을 전해야 한다. `context`가 그 신호를 전파하는 표준 통로다.
{.lead}

## 왜 context가 필요한가

웹 요청 하나가 DB 조회, 외부 API 호출, 캐시 접근으로 갈라져 여러 goroutine을 만든다고 하자. 클라이언트가 연결을 끊거나 3초 타임아웃이 걸리면, 그 하위 작업들을 **더 진행시킬 이유가 없다.** 계속 돌면 자원만 낭비하고 goroutine 누수가 된다.

`context.Context`는 이 취소 신호를 **호출 트리 아래로 흘려보내는** 값이다. 부모 context를 취소하면 그로부터 파생된 모든 자식 context가 함께 취소된다. 핵심은 `ctx.Done()` — 취소되는 순간 닫히는 채널이다. goroutine은 `select`에서 이 채널을 지켜보다가 닫히면 스스로 정리하고 빠진다.

## 타임아웃과 취소 만들기

`context.Background()`가 뿌리다. 여기서 `WithTimeout`, `WithCancel`, `WithDeadline`으로 자식을 파생한다. 반환된 `cancel` 함수는 **반드시 호출**해야 자원이 회수된다 — `defer cancel()`이 관용구다.

{{< gocode file="main.go" output="작업 취소됨: context deadline exceeded" >}}
```go
package main

import (
    "context"
    "fmt"
    "time"
)

func slowWork(ctx context.Context) error {
    select {
    case <-time.After(500 * time.Millisecond): // 500ms 걸리는 작업
        return nil
    case <-ctx.Done(): // 그 전에 context가 취소되면
        return ctx.Err() // 취소 사유를 반환
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
    defer cancel() // 반드시 호출 — 안 하면 자원 누수

    if err := slowWork(ctx); err != nil {
        fmt.Println("작업 취소됨:", err) // deadline 100ms < 작업 500ms
    }
}
```
{{< /gocode >}}

작업은 500ms가 필요한데 context는 100ms에 마감된다. `ctx.Done()`이 먼저 닫히므로 `slowWork`는 `context deadline exceeded`를 반환하며 즉시 빠져나온다. 작업을 실제로 중단시키는 게 아니라, **작업 스스로가 `ctx.Done()`을 지켜보다 협조적으로 멈추는** 구조다.

## 관용 규칙

- context는 함수의 **첫 번째 인자**로 넘긴다: `func Fetch(ctx context.Context, id string)`. 이게 Go 표준 라이브러리·서버 코드 전반의 규약이다.
- **구조체 필드에 저장하지 말고** 인자로 흘려라. context는 요청 하나의 수명에 묶인 값이다.
- `context.WithValue`로 요청 범위 값(요청 ID 등)을 실을 수 있지만 남용 금지 — 함수 파라미터를 대신하는 우회로로 쓰면 안 된다.

{{< callout warn >}}
`cancel` 함수를 받고 안 부르면 **context 자원이 새어** goroutine 누수로 이어진다. 파생하자마자 `defer cancel()`을 거는 습관을 들여라. 또한 context는 **협조적 취소**다 — `ctx.Done()`을 어디서도 확인하지 않는 goroutine은 취소해도 계속 돈다. 취소를 존중하려면 블로킹 지점마다 `select`에 `ctx.Done()`을 함께 두어야 한다.
{{< /callout >}}

{{< callout info >}}
표준 라이브러리가 이미 context를 받는다. `http.Request`에는 `req.Context()`가 있고, `database/sql`의 `QueryContext`, `net`의 다이얼러가 모두 ctx를 존중한다. 즉 요청 최상단에서 받은 ctx를 아래로 성실히 넘기기만 하면, 취소가 스택 전체에 자동으로 퍼진다.
{{< /callout >}}

{{< contrast from="JS AbortController / signal" note="controller.abort()로 신호를 보내고 fetch가 signal을 구독 — 웹 API 중심" to="Go" goNote="context.WithCancel/Timeout으로 신호를 만들고 ctx.Done()을 select로 구독 — 호출 트리 전체에 표준적으로 전파" >}}
