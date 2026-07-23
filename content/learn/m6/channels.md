---
title: "channel — 통신으로 메모리를 공유한다"
slug: "channels"
lessonID: "m6-l2"
type: "diagram"
estMin: 14
weight: 20
module: "m6"
moduleTitle: "동시성: goroutine & channel"
step: 6
summary: "channel은 goroutine 사이로 값을 안전하게 건네는 타입 있는 파이프다. unbuffered는 만나는 순간 동기화되고, buffered는 완충한다. lock 대신 이걸 먼저 떠올려라."
---

goroutine을 여러 개 띄웠다면, 그들이 데이터를 주고받아야 한다. Go의 답은 공유 변수에 lock을 거는 게 아니라 **channel** — 값을 한쪽에서 넣고 다른 쪽에서 꺼내는, 타입이 정해진 파이프다.
{.lead}

## 만들고, 보내고, 받는다

`ch := make(chan int)`로 만들고, `ch <- v`로 보내고, `v := <-ch`로 받는다. 화살표가 값이 흐르는 방향을 가리킨다. channel은 타입이 있어서 `chan int`에는 int만 흐른다.

{{< diagram id="goroutine-channel" caption="한 goroutine이 보내고 다른 goroutine이 받는다 — 값이 넘어가는 순간 두 쪽이 동기화된다" >}}

{{< gocode file="main.go" output="받음: 42" >}}
```go
package main

import "fmt"

func main() {
    ch := make(chan int) // unbuffered 채널

    go func() {
        ch <- 42 // 누군가 받을 때까지 여기서 대기(블록)
    }()

    v := <-ch // 값이 올 때까지 여기서 대기 → 42를 받는 순간 양쪽이 진행
    fmt.Println("받음:", v)
}
```
{{< /gocode >}}

이 예제는 앞 레슨의 "main이 먼저 끝나는" 문제도 자연스럽게 푼다. `<-ch`가 값을 받을 때까지 main이 **블록**되므로, goroutine이 보낼 때까지 기다려준다. 채널은 데이터 전달인 동시에 **동기화**다.

## unbuffered vs buffered — 만남이냐 완충이냐

이 구분이 채널 이해의 핵심이다.

- **unbuffered (`make(chan int)`)** — 용량 0. 송신은 **수신자가 받는 바로 그 순간까지 블록**되고, 수신도 값이 올 때까지 블록된다. 송신과 수신이 **랑데부(만남)** 해야 값이 넘어간다. 그래서 그 자체로 강력한 동기화 지점이 된다.
- **buffered (`make(chan int, 3)`)** — 용량 3. 버퍼가 차기 전까지 송신은 **안 기다리고 넣고 지나간다.** 버퍼가 꽉 차면 그때부터 블록. 수신은 버퍼가 비어야 블록.

unbuffered는 "손에서 손으로 직접 건넨다", buffered는 "우체통에 넣어두면 나중에 꺼내 간다"로 기억하면 된다.

```go
done := make(chan bool)      // unbuffered: 완료 신호로 자주 쓴다
jobs := make(chan int, 100)  // buffered: 생산자가 소비자보다 잠깐 앞서갈 여유
```

## 닫기(close)와 range

송신자가 더 보낼 게 없으면 `close(ch)`로 채널을 닫는다. 수신 쪽은 `for v := range ch`로 **닫힐 때까지** 값을 모두 받아낸다. 닫힌 채널에서 받으면 즉시 zero value와 `ok=false`가 나온다: `v, ok := <-ch`.

{{< callout warn >}}
채널을 잘못 다루면 **deadlock**이다 — 받을 사람 없는 unbuffered 채널로 보내면 그 goroutine은 영원히 멈춘다. 모든 goroutine이 서로를 기다리면 런타임이 `fatal error: all goroutines are asleep - deadlock!`으로 프로그램을 죽인다. 그리고 **닫는 건 송신자의 책임**이다. 이미 닫힌 채널에 또 보내거나 또 닫으면 panic이다. 수신자는 채널을 닫지 않는다.
{{< /callout >}}

{{< callout tip >}}
"Don't communicate by sharing memory; share memory by communicating." — 공유 변수 + lock 대신, **값을 채널로 건네** 소유권을 넘기는 사고방식이다. 한 시점에 한 goroutine만 그 값을 만지므로 경쟁 자체가 사라진다. 물론 채널이 만능은 아니다(단순 카운터엔 Mutex가 낫다 — m6-l4). 하지만 "누가 이 데이터를 소유하는가"를 흐름으로 설계할 때 채널이 첫 도구다.
{{< /callout >}}

{{< contrast from="스레드 + 공유 메모리 + lock" note="같은 변수를 여러 스레드가 만지고, mutex로 접근을 직렬화 — lock 순서 실수가 곧 버그" to="Go" goNote="값을 channel로 건네 소유권을 이전 — 한 번에 한 goroutine만 만지니 경쟁이 원천 차단" >}}
