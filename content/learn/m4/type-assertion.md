---
title: "타입 단언 & 타입 스위치"
slug: "type-assertion"
lessonID: "m4-l5"
type: "code"
estMin: 10
weight: 50
module: "m4"
moduleTitle: "구조체 · 메서드 · 인터페이스"
step: 4
summary: "인터페이스에 담긴 구체 타입을 꺼내는 법. 그리고 any 남용은 타입 안전성을 런타임으로 미룬다는 신호다."
---

인터페이스는 구체 타입을 감춘다. 가끔은 그 안에 뭐가 들었는지 다시 꺼내야 한다 — 그게 **타입 단언(type assertion)**과 **타입 스위치**다. 그리고 이걸 자주 쓰게 된다면, 대개 설계를 다시 봐야 한다는 신호다.
{.lead}

## 타입 단언 — comma-ok가 안전판

`i.(T)`는 인터페이스 `i`에 실제로 `T`가 들었는지 확인하고 꺼낸다. 두 가지 형태가 있는데, 이 선택이 안전을 가른다.

{{< gocode file="main.go" output="hello 로 꺼냄: true / int 아님: false" >}}
```go
package main

import "fmt"

func main() {
    var i interface{} = "hello"

    // comma-ok 형태 — 실패해도 panic 없이 ok=false
    s, ok := i.(string)
    fmt.Print(s, " 로 꺼냄: ", ok, " / ") // hello 로 꺼냄: true

    n, ok2 := i.(int)  // 실제론 string이라 실패
    fmt.Print("int 아님: ", ok2)          // false, n은 zero value(0)
    _ = n

    // 단일 형태 — 틀리면 panic
    // x := i.(int)    // panic: interface conversion
}
```
{{< /gocode >}}

- **comma-ok 형태** `v, ok := i.(T)` — 실패하면 `ok`가 `false`, `v`는 zero value. panic 없음.
- **단일 형태** `v := i.(T)` — 실패하면 **panic**. 타입을 100% 확신할 때만.

실무에서는 거의 항상 comma-ok를 쓴다. 모듈 3의 맵 조회에서 본 그 comma-ok 패턴이 여기서 또 나온다.

## 타입 스위치 — 여러 타입을 분기

타입이 여러 경우면 `switch i.(type)`로 한 번에 분기한다.

```go
func describe(i any) string {
    switch v := i.(type) {
    case int:
        return fmt.Sprintf("int: %d", v)
    case string:
        return fmt.Sprintf("string of len %d", len(v))
    default:
        return "unknown"
    }
}
```

각 `case` 안에서 `v`는 그 타입으로 이미 변환돼 있다. `case int`에서 `v`는 `int`, `case string`에서 `v`는 `string`이다. 외부 데이터(JSON 등)를 파싱할 때 자주 쓴다.

## any 남용은 설계 신호다

`any`(= `interface{}`)는 아무 값이나 담는 만능 상자다. 편하지만, **자주 쓰인다면 타입 안전성을 런타임으로 미루고 있다는 뜻**이다. 컴파일러가 잡아줄 수 있었던 타입 오류를, `any`로 감싸는 순간 런타임 panic으로 미뤄버린다.

{{< callout warn >}}
**`any` + 타입 단언이 코드에 자주 등장하면 설계를 의심하라.** 대개 더 나은 답은 ① 적절한 **인터페이스**를 정의해 필요한 동작만 요구하거나, ② 제네릭(모듈 8)으로 타입을 유지하는 것이다. 타입 단언은 **외부 데이터 파싱**이나 **라이브러리 경계**처럼 타입을 미리 알 수 없는 곳으로 한정해야 한다.
{{< /callout >}}

{{< contrast from="Java" note="instanceof로 검사하고 명시적으로 캐스팅한다" to="Go" goNote="comma-ok 단언 / 타입 스위치로 안전하게 꺼내되, any 남용은 피한다" >}}

이제 모듈 4를 마무리하는 퀴즈로 구조체·리시버·인터페이스를 점검해보자.

{{< quiz id="q-m4" >}}
