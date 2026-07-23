---
title: "select — 여러 채널을 동시에 기다린다"
slug: "select"
lessonID: "m6-l3"
type: "code"
estMin: 12
weight: 30
module: "m6"
moduleTitle: "동시성: goroutine & channel"
step: 6
summary: "select는 여러 채널 중 준비된 하나를 골라 처리한다. default로 논블로킹을, time.After로 타임아웃을 표현한다 — 동시성 코드의 스위치보드다."
---

`<-ch` 하나는 그 채널만 기다린다. 하지만 실전에서는 **여러 채널 중 먼저 준비되는 쪽**을 처리하고 싶다. `select`가 그 역할을 한다 — 채널 연산들을 위한 `switch`다.
{.lead}

## 준비된 case를 고른다

`select`는 여러 채널 연산을 나열하고, **그중 진행 가능한(블록되지 않는) case 하나**를 실행한다. 여럿이 동시에 준비되면 그중 하나를 무작위로 고른다(특정 채널이 굶는 것을 막는 의도적 설계). 아무것도 준비 안 됐으면 하나가 준비될 때까지 블록된다.

```go
select {
case v := <-ch1:
    fmt.Println("ch1에서:", v)
case v := <-ch2:
    fmt.Println("ch2에서:", v)
case ch3 <- 10:
    fmt.Println("ch3으로 보냄")
}
```

수신뿐 아니라 **송신**도 case가 될 수 있다는 점에 주목하라. `select`는 "이 채널 연산들 중 지금 할 수 있는 걸 하라"는 뜻이다.

## default — 논블로킹으로 만든다

`default` case를 넣으면, 준비된 채널이 하나도 없을 때 블록하는 대신 **즉시 default로 빠진다.** 이걸로 "값이 있으면 받고, 없으면 그냥 지나간다"는 논블로킹 폴링을 만든다.

{{< gocode file="main.go" output="아직 값이 없음 (논블로킹)" >}}
```go
package main

import "fmt"

func main() {
    ch := make(chan int) // 아무도 보내지 않는 채널

    select {
    case v := <-ch:
        fmt.Println("받음:", v)
    default:
        fmt.Println("아직 값이 없음 (논블로킹)") // 블록 대신 여기로
    }
}
```
{{< /gocode >}}

## time.After — 타임아웃 패턴

가장 널리 쓰이는 `select` 관용구다. `time.After(d)`는 `d`가 지나면 값을 하나 내보내는 채널을 돌려준다. 이걸 case로 두면 **"응답이 오거나, 제한 시간이 지나거나"** 를 깔끔하게 표현한다.

{{< gocode file="main.go" output="타임아웃! 100ms 안에 응답이 없다" >}}
```go
package main

import (
    "fmt"
    "time"
)

func main() {
    result := make(chan string)

    go func() {
        time.Sleep(300 * time.Millisecond) // 느린 작업 흉내
        result <- "완료"
    }()

    select {
    case r := <-result:
        fmt.Println("응답:", r)
    case <-time.After(100 * time.Millisecond): // 100ms 제한
        fmt.Println("타임아웃! 100ms 안에 응답이 없다")
    }
}
```
{{< /gocode >}}

작업 채널이 100ms 안에 값을 못 주면 `time.After`의 채널이 먼저 준비되어 타임아웃 분기로 빠진다. 이 패턴이 네트워크 호출·워커 응답 대기 등 거의 모든 곳에서 반복된다.

{{< callout warn >}}
`select`에 아무 `default`도 없고 준비되는 case도 영영 없으면 그 goroutine은 **영원히 블록**된다 — deadlock의 흔한 형태다. 반대로 바쁜 루프 안에서 `default`를 남용하면 CPU를 태우는 busy-wait가 된다. "무한정 기다림"과 "즉시 포기" 사이가 필요할 때가 바로 `time.After`(또는 다음 레슨의 `context`)를 쓸 자리다.
{{< /callout >}}

{{< contrast from="JS Promise.race([...])" note="여러 프로미스 중 먼저 끝나는 하나로 resolve — 결과 회수 중심" to="Go" goNote="select로 여러 채널 중 준비된 하나를 처리 — 수신·송신·타임아웃·논블로킹을 한 구문에서" >}}
