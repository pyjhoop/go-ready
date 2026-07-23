---
title: "panic & recover — 진짜 예외가 필요한 드문 순간"
slug: "panic-recover"
lessonID: "m5-l4"
type: "code"
estMin: 10
weight: 40
module: "m5"
moduleTitle: "에러 처리 · panic · defer"
step: 5
summary: "panic은 Go의 진짜 예외지만, 일상 에러 처리 도구가 아니다. 프로그램을 멈추는 비상 신호이고, recover는 defer 안에서만 그 낙하를 잡을 수 있다."
---

`panic`은 Go에도 예외 비슷한 게 있다는 증거다. 하지만 이건 `if err != nil`의 대체재가 **아니다.** 정상 흐름으로는 복구 불가능한, 프로그래머의 실수나 회복 불능 상태를 위한 비상 탈출구다.
{.lead}

## panic이 하는 일

`panic(v)`가 호출되면 현재 함수의 정상 실행이 즉시 중단되고, 스택을 거슬러 올라가며 **각 함수의 defer들을 실행**한다. 아무도 잡지 않으면 프로그램 전체가 스택 트레이스를 출력하고 죽는다.

우리는 이미 panic을 여러 번 봤다 — nil map에 쓰기, 슬라이스 범위 초과 인덱싱, nil 포인터 역참조. 이들의 공통점: **프로그램의 불변식이 깨진, 계속 진행하면 안 되는 상태**다. panic은 "여기서 멈추는 게 잘못된 데이터로 계속 가는 것보다 낫다"는 판단이다.

```go
func mustPositive(n int) {
    if n <= 0 {
        panic(fmt.Sprintf("양수가 필요한데 %d를 받음", n)) // 프로그래머의 계약 위반
    }
}
```

## recover는 defer 안에서만 동작한다

`recover()`는 진행 중인 panic을 붙잡아 스택 되감기를 멈추고, 프로그램을 정상 흐름으로 되돌린다. **결정적 제약: `recover`는 오직 `defer`된 함수 안에서 호출될 때만 효과가 있다.** 다른 곳에서 부르면 그냥 `nil`을 반환하고 아무 일도 안 한다.

이유는 앞 레슨의 메커니즘에 있다 — panic이 스택을 되감을 때 실행되는 유일한 코드가 defer다. 그러니 그 낙하를 낚아채려면 defer 안에 손을 뻗고 있어야 한다.

{{< gocode file="main.go" output="복구함: 뭔가 터졌다\n프로그램은 계속된다" >}}
```go
package main

import "fmt"

func safeCall() {
    defer func() {
        if r := recover(); r != nil { // panic이 있었으면 r에 그 값이 담긴다
            fmt.Println("복구함:", r)
        }
    }()

    panic("뭔가 터졌다") // 여기서 스택 되감기 시작
    fmt.Println("이 줄은 실행되지 않는다")
}

func main() {
    safeCall()
    fmt.Println("프로그램은 계속된다") // recover 덕분에 여기 도달
}
```
{{< /gocode >}}

## 언제 panic이 정당한가

거의 언제나 답은 "쓰지 마라, 에러를 반환하라"이다. panic이 정당화되는 좁은 경우는:

- **프로그래머의 실수** — 절대 일어나선 안 될 불변식 위반(라이브러리의 `MustCompile` 계열).
- **초기화 실패** — 프로그램이 시작조차 못 할 상태(필수 설정 누락 등).
- **경계에서의 방어적 recover** — 웹 서버가 한 요청 핸들러의 panic 때문에 프로세스 전체가 죽지 않도록, 요청마다 최상단에서 recover해 그 요청만 500으로 처리하는 패턴.

{{< callout warn >}}
panic을 일상 에러 처리에 쓰지 마라. panic으로 던지고 recover로 잡는 건 결국 예외의 재발명이고, Go가 의도적으로 없앤 "숨은 제어 흐름"을 도로 들여오는 것이다. 라이브러리 함수는 **panic을 밖으로 흘려보내지 않는 게** 관용이다 — 내부에서 recover해 에러 값으로 변환해 반환하라. 공개 API의 시그니처는 `error`를 말해야지, panic으로 뒤통수를 치면 안 된다.
{{< /callout >}}

{{< callout info >}}
정리하면 두 층이다. **에러(값)** = 예상 가능한 실패, 호출부가 검사해 처리한다. **panic** = 예상 밖의 회복 불능, 기본적으로 프로그램을 멈춘다. 90% 이상은 에러로 해결되고, panic은 정말 드물게, recover는 더 드물게 쓴다.
{{< /callout >}}

{{< quiz id="q-m5" >}}
