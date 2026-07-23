---
title: "goroutine — 수천 개를 띄워도 되는 이유"
slug: "goroutines"
lessonID: "m6-l1"
type: "diagram"
estMin: 12
weight: 10
module: "m6"
moduleTitle: "동시성: goroutine & channel"
step: 6
summary: "goroutine은 OS 스레드가 아니다. 런타임이 소수의 스레드 위에 수천 개를 다중화한다. go 한 단어의 비용이 그만큼 싸다."
---

`go f()` — 함수 호출 앞에 `go`를 붙이면 그 함수는 **새 goroutine에서 동시에** 실행된다. 이 한 단어가 Go 동시성의 전부이자, 많은 사람이 Go를 배우는 이유다.
{.lead}

## goroutine은 스레드가 아니다

다른 언어에서 스레드를 수천 개 만드는 건 무모하다 — OS 스레드 하나가 보통 1MB 안팎의 스택을 잡고, 커널이 관리하며, 컨텍스트 스위치 비용이 크다. 그래서 스레드 풀을 만들고 아껴 쓴다.

goroutine은 다르다. **몇 KB짜리 작은 스택으로 시작**하고(필요하면 자라고 줄어든다), OS가 아니라 **Go 런타임이 직접 스케줄링**한다. 런타임은 다수의 goroutine(G)을 소수의 OS 스레드(M) 위에 M:N으로 다중화한다. 그래서 goroutine 수만 개는 평범하다.

{{< diagram id="goroutine-scheduler" caption="런타임이 많은 G를 소수의 M 위에 다중화한다 — go 한 줄의 비용이 싼 이유" >}}

핵심 메커니즘 하나: 어떤 goroutine이 I/O나 채널에서 **블로킹되면, 런타임은 그 스레드(M)를 놀리지 않고 다른 실행 가능한 goroutine으로 갈아끼운다.** 블로킹이 커널 스레드를 잡아먹지 않으니, "요청마다 goroutine 하나"처럼 순진해 보이는 모델이 실제로 잘 굴러간다.

## main이 끝나면 모두 죽는다

여기서 첫 함정이 나온다. `main` 함수가 반환하면 프로그램이 종료되고, **아직 돌고 있던 goroutine들은 완료를 기다려주지 않고 그냥 사라진다.**

{{< gocode file="main.go" output="main 종료 (goroutine 출력은 안 보일 수 있다)" >}}
```go
package main

import "fmt"

func main() {
    go fmt.Println("goroutine에서 안녕") // 실행될 틈도 없이

    fmt.Println("main 종료 (goroutine 출력은 안 보일 수 있다)")
    // main이 여기서 반환 → 프로그램 종료 → 위 goroutine은 실행 보장 없음
}
```
{{< /gocode >}}

`go fmt.Println(...)`이 화면에 나올지는 **운이다.** main이 먼저 끝나면 goroutine은 시작조차 못 한다. 이걸 `time.Sleep`으로 "잠깐 기다리게" 때우고 싶은 유혹이 들지만, 그건 타이밍에 기댄 버그다. 올바른 해법은 다음 레슨들의 channel과 `sync.WaitGroup` — **완료를 명시적으로 기다리는** 동기화 장치다.

{{< callout warn >}}
`main`이 반환하면 살아있던 goroutine은 정리 기회 없이 즉시 죽는다. 동시 작업의 결과가 필요하면 `time.Sleep`으로 어림잡지 말고, channel이나 `sync.WaitGroup`으로 **끝날 때까지 명시적으로 기다려라.** Sleep 기반 동기화는 느린 기계에서 조용히 깨진다.
{{< /callout >}}

{{< callout info >}}
`go`는 함수를 **호출**하는 것이지 값을 반환받는 게 아니다. goroutine의 결과를 되받으려면 반환값을 쓸 수 없다 — 그래서 channel이 필요하다. "동시에 실행"과 "결과 회수"가 분리돼 있다는 점이 다음 레슨으로 이어진다.
{{< /callout >}}

{{< contrast from="Java Thread / OS 스레드" note="스레드 하나가 ~1MB, 커널이 스케줄링, 수천 개는 부담 → 스레드 풀로 아껴 쓴다" to="Go" goNote="goroutine은 몇 KB로 시작, 런타임이 소수 스레드 위에 다중화 → 수만 개도 예사, go 한 단어면 끝" >}}
