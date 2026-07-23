---
title: "동시성 패턴 — worker pool · fan-out/in · pipeline"
slug: "patterns"
lessonID: "m6-l6"
type: "code"
estMin: 14
weight: 60
module: "m6"
moduleTitle: "동시성: goroutine & channel"
step: 6
summary: "goroutine·channel·select·sync·context를 조합하면 몇 가지 검증된 패턴이 나온다. worker pool, fan-out/fan-in, pipeline — 실전 동시성의 표준 레퍼토리다."
---

지금까지의 조각들 — goroutine, channel, select, WaitGroup — 을 조합하면 재사용 가능한 **패턴**이 된다. 새 동시성 코드를 짤 때 무에서 시작하지 말고, 이 검증된 형태 중 하나를 골라 맞춰라.
{.lead}

## worker pool — 고정된 일꾼으로 작업 큐를 처리

goroutine이 값싸다고 작업마다 하나씩 무한정 띄우면, 수백만 개가 되어 메모리·DB 커넥션을 고갈시킨다. **worker pool**은 일꾼 수를 고정하고, 그들이 하나의 작업 채널에서 일감을 꺼내 처리하게 해 **동시성의 상한**을 건다.

{{< gocode file="main.go" output="처리한 작업 수: 9" >}}
```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    jobs := make(chan int, 9)
    results := make(chan int, 9)

    var wg sync.WaitGroup
    for w := 0; w < 3; w++ { // 일꾼 3명 고정
        wg.Add(1)
        go func() {
            defer wg.Done()
            for j := range jobs { // 채널이 닫힐 때까지 일감을 꺼낸다
                results <- j * j
            }
        }()
    }

    for i := 1; i <= 9; i++ {
        jobs <- i
    }
    close(jobs) // 더 없음 → range 루프들이 끝난다

    go func() { wg.Wait(); close(results) }() // 다 끝나면 결과 채널 닫기

    count := 0
    for range results {
        count++
    }
    fmt.Println("처리한 작업 수:", count)
}
```
{{< /gocode >}}

일꾼 3명이 작업 9개를 나눠 처리한다. 일꾼 수를 바꾸면 동시성 수준이 바뀐다. `close(jobs)`가 모든 일꾼의 `range` 루프를 끝내고, 별도 goroutine이 `wg.Wait()` 후 `results`를 닫아 소비 루프도 끝난다.

## fan-out / fan-in

- **fan-out** — 하나의 작업 채널을 여러 goroutine이 함께 소비한다(방금 worker pool이 그 예다). 일을 병렬로 분산한다.
- **fan-in** — 여러 goroutine이 각자의 결과를 **하나의 채널로 합류**시킨다. 소비자는 출처를 신경 쓰지 않고 한 채널에서 다 받는다.

둘을 합치면 "한 큐 → N개 일꾼(fan-out) → 결과 한 큐(fan-in)"라는 전형적 파이프라인 골격이 된다.

## pipeline — 단계를 채널로 잇는다

각 단계가 goroutine이고, 앞 단계의 출력 채널이 다음 단계의 입력 채널이 되는 구조다. 데이터가 컨베이어처럼 흐르며 각 단계가 자기 변환만 한다. 유닉스 파이프(`gen | sq | print`)의 goroutine 버전이다.

{{< gocode file="main.go" output="1 4 9 " >}}
```go
package main

import "fmt"

func gen(nums ...int) <-chan int { // 1단계: 숫자 생성
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            out <- n
        }
    }()
    return out
}

func sq(in <-chan int) <-chan int { // 2단계: 제곱
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            out <- n * n
        }
    }()
    return out
}

func main() {
    for v := range sq(gen(1, 2, 3)) { // gen → sq → 소비
        fmt.Print(v, " ")
    }
}
```
{{< /gocode >}}

각 단계는 입력 채널(`<-chan int`, 수신 전용)을 받아 출력 채널을 돌려준다. 단계를 추가하려면 함수를 하나 더 끼워 넣기만 하면 된다. 각 단계가 `defer close(out)`으로 자기 출력을 닫아 다음 단계의 `range`가 자연히 끝난다.

{{< callout warn >}}
동시성 코드의 대표 버그는 **goroutine 누수**다 — 아무도 읽지 않는 채널로 보내려다, 혹은 닫히지 않는 채널을 `range`하다 goroutine이 영영 멈춰 쌓인다. 파이프라인·워커 풀에서는 **누가 어느 채널을 언제 닫는가**를 명확히 설계하라(송신자가 닫는다). 조기 종료가 가능한 경우엔 `context`(m6-l5)로 하위 goroutine에 취소를 전파해 누수를 막아라.
{{< /callout >}}

{{< callout tip >}}
패턴을 외우되 이념화하지 마라. 실전 순서는 보통 이렇다 — (1) 먼저 **가장 단순한 동기 코드**로 맞게 짠다. (2) 병목이 정말 동시성으로 풀리는지 확인한다. (3) 그때 worker pool/pipeline을 얹고 **반드시 `-race`로 검증**한다. "동시성부터"가 아니라 "필요해서 동시성"이 Go다운 순서다.
{{< /callout >}}

{{< quiz id="q-m6" >}}
