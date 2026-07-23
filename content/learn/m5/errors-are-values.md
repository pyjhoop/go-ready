---
title: "에러는 값이다"
slug: "errors-are-values"
lessonID: "m5-l1"
type: "diagram"
estMin: 12
weight: 10
module: "m5"
moduleTitle: "에러 처리 · panic · defer"
step: 5
summary: "Go에는 예외가 없다. 에러는 함수가 돌려주는 평범한 반환값이고, 호출부가 매번 직접 검사한다. 장황함의 대가로 예측 가능한 제어 흐름을 산다."
---

Go는 예외를 던지지 않는다. 실패는 특별한 사건이 아니라 **평범한 반환값**이다 — 함수가 결과와 함께 `error`를 돌려주고, 호출한 쪽이 그것을 검사한다.
{.lead}

## `throw`가 없다는 것의 의미

Java·Python·JS·C++에서 온 사람에게 가장 먼저 사라진 것은 `try/catch`다. Go에는 그런 게 없다. 대신 실패할 수 있는 함수는 마지막 반환값으로 `error`를 내놓고, 관용구는 언제나 똑같다:

```go
f, err := os.Open("config.yaml")
if err != nil {
    return err            // 처리하거나, 위로 넘기거나
}
defer f.Close()
// f를 정상적으로 사용
```

`error`는 마법의 타입이 아니다. 그냥 표준 라이브러리에 정의된 **인터페이스**일 뿐이다:

```go
type error interface {
    Error() string
}
```

`Error() string` 메서드 하나만 가지면 무엇이든 에러가 될 수 있다. 이것이 4장에서 배운 암묵적 인터페이스 만족의 실전 사례다 — 커스텀 에러 타입을 만드는 건 구조체에 `Error()`를 붙이는 것뿐이다.

{{< diagram id="error-flow" caption="에러는 스스로 튀어오르지 않는다 — 각 계층이 직접 검사하고 직접 반환한다" >}}

## 왜 이 장황함을 감수하는가

예외의 편리함은 명백하다: 실패 지점에서 `throw` 한 줄이면 어딘가의 `catch`가 알아서 받는다. 하지만 그 편리함의 대가는 **제어 흐름이 코드에서 사라진다**는 것이다. 어떤 함수가 예외를 던질 수 있는지, 그 예외가 어디서 잡히는지는 코드를 봐서는 알 수 없다. 스택을 거슬러 올라가는 숨은 점프가 곳곳에 잠복해 있다.

Go의 선택은 정반대다 — **모든 실패 경로를 눈에 보이게** 만든다. `if err != nil`이 많다는 건 실패할 수 있는 지점이 많다는 뜻이고, 그것이 코드에 정직하게 드러나 있다는 뜻이다. 큰 팀에서 6개월 뒤 남이 이 코드를 읽을 때, 어디서 무엇이 잘못될 수 있는지 스캔만으로 파악된다.

{{< gocode file="main.go" output="열기 실패: open none.txt: no such file or directory" >}}
```go
package main

import (
    "errors"
    "fmt"
    "os"
)

func loadConfig(path string) error {
    _, err := os.Open(path)
    if err != nil {
        return err // 에러를 값으로 위로 전달
    }
    return nil
}

func main() {
    if err := loadConfig("none.txt"); err != nil {
        fmt.Println("열기 실패:", err)
        return
    }
    // errors.New / fmt.Errorf로 직접 에러를 만들 수도 있다
    _ = errors.New("직접 만든 에러")
}
```
{{< /gocode >}}

## 에러를 만드는 두 가지 기본 도구

직접 에러를 만들 때 90%는 이 둘로 해결된다:

- **`errors.New("메시지")`** — 고정 문자열 에러. 가장 단순하다.
- **`fmt.Errorf("... %s ...", v)`** — 값을 끼워 넣어 문맥을 담는다. 다음 레슨에서 볼 `%w`로 다른 에러를 감쌀 수도 있다.

{{< callout info >}}
`if err != nil`이 반복돼 장황해 보이는 건 사실이다. 하지만 이것은 버그가 아니라 **설계 의도**다. 제어 흐름이 명시적이라 예측 가능하고, "이 줄에서 실패하면 어떻게 되는가"의 답이 언제나 바로 다음 세 줄에 있다. Go 팀의 표현: *"Errors are values"* — 에러는 프로그래밍할 수 있는 평범한 데이터다.
{{< /callout >}}

{{< callout warn >}}
에러를 무시하려면 `_`로 **명시적으로** 버려야 한다: `f, _ := os.Open(path)`. 이건 "나는 이 실패를 알면서도 무시한다"는 선언이다. 반면 예외 언어에서 `catch {}` 빈 블록으로 삼키는 것은 눈에 잘 띄지 않는다. Go는 무시조차 코드에 남긴다.
{{< /callout >}}

{{< contrast from="Java / Python / JS" note="throw로 예외를 던지면 스택을 거슬러 어딘가의 catch로 점프 — 실패 경로가 코드에서 안 보인다" to="Go" goNote="(result, error)를 반환하고 호출부가 즉시 검사 — 모든 실패 지점이 코드에 그대로 드러난다" >}}
