---
title: "sync 패키지 — 채널이 답이 아닐 때"
slug: "sync"
lessonID: "m6-l4"
type: "code"
estMin: 12
weight: 40
module: "m6"
moduleTitle: "동시성: goroutine & channel"
step: 6
summary: "WaitGroup으로 완료를 기다리고, Mutex로 공유 상태를 보호하고, Once로 딱 한 번 초기화한다. 데이터 레이스는 -race로 잡는다. 채널이 늘 최선은 아니다."
---

"share memory by communicating"이 원칙이지만, 단순한 공유 상태에는 채널이 과하다. `sync` 패키지는 고전적인 동기화 도구 — WaitGroup, Mutex, Once — 를 제공한다. 이들을 **채널의 반대말이 아니라 상황별 도구**로 익혀야 한다.
{.lead}

## WaitGroup — "다 끝날 때까지 기다려"

goroutine 여러 개를 띄우고 **전부 끝나기를 기다리는** 가장 흔한 요구다. `sync.WaitGroup`이 카운터로 이걸 한다: `Add(n)`으로 셀 개수를 늘리고, 각 goroutine이 끝날 때 `Done()`으로 하나 줄이고, `Wait()`가 0이 될 때까지 블록한다.

{{< gocode file="main.go" output="3개 작업 모두 완료" >}}
```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup

    for i := 0; i < 3; i++ {
        wg.Add(1) // 시작 전에 카운터를 올린다
        go func(id int) {
            defer wg.Done() // 끝나면 하나 줄인다 (defer로 확실히)
            _ = id
        }(i)
    }

    wg.Wait() // 카운터가 0이 될 때까지 블록
    fmt.Println("3개 작업 모두 완료")
}
```
{{< /gocode >}}

`wg.Add`는 goroutine을 띄우기 **전에** 부르고, `wg.Done`은 `defer`로 걸어 어떤 경로로 끝나든 반드시 불리게 하는 게 관용이다.

## Mutex — 공유 상태를 직렬화한다

여러 goroutine이 같은 변수를 동시에 쓰면 **데이터 레이스**다. `sync.Mutex`로 임계 구역을 감싸 한 번에 하나만 들어가게 한다. 2장에서 언급했듯 `var mu sync.Mutex`는 zero value가 곧 사용 가능한 상태라 초기화가 필요 없다.

{{< gocode file="main.go" output="counter = 1000" >}}
```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var mu sync.Mutex
    var wg sync.WaitGroup
    counter := 0

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            mu.Lock()   // 한 번에 하나만 진입
            counter++   // 임계 구역
            mu.Unlock()
        }()
    }
    wg.Wait()
    fmt.Println("counter =", counter) // 항상 1000
}
```
{{< /gocode >}}

`mu.Lock()` 없이 `counter++`만 하면 결과가 매번 다르게 나온다(1000보다 작게). `Unlock`은 `defer mu.Unlock()`으로 걸어 빠뜨림을 막는 게 안전하다.

## Once — 딱 한 번만

`sync.Once`의 `Do(f)`는 여러 goroutine이 동시에 불러도 `f`를 **정확히 한 번만** 실행한다. 지연 초기화(lazy init), 싱글턴 설정 로드에 쓴다. 직접 플래그와 lock으로 구현하려다 미묘한 레이스를 내느니 이걸 쓴다.

{{< callout warn >}}
★ **데이터 레이스는 조용하다.** lock 없이 공유 변수를 동시에 읽고 쓰면 컴파일도 되고 대개 그럴듯한 값이 나오다가, 부하가 몰리는 프로덕션에서 값이 깨지거나 프로그램이 터진다. Go는 이걸 잡는 도구를 내장했다 — **`go run -race`**(또는 `go test -race`). 레이스 감지기가 실행 중 충돌하는 접근을 잡아 정확한 스택을 알려준다. 동시성 코드는 반드시 `-race`로 돌려보라.
{{< /callout >}}

{{< callout tip >}}
channel이 항상 정답은 아니다. **단순한 카운터나 짧은 임계 구역 하나를 보호할 때는 Mutex가 더 간단하고 빠르다.** 채널은 "데이터의 소유권을 goroutine 사이로 넘길 때", Mutex는 "여러 goroutine이 같은 상태를 공유하며 지켜야 할 때"가 어울린다. 도구를 이념으로 고르지 말고 문제 모양으로 골라라.
{{< /callout >}}

{{< contrast from="Java synchronized / ReentrantLock" note="lock을 언어·라이브러리 곳곳에서, 완료 대기는 join()" to="Go" goNote="sync.Mutex로 임계 구역, sync.WaitGroup으로 완료 대기, -race로 레이스 탐지까지 표준 내장" >}}
