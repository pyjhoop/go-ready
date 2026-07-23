---
title: "제어 흐름 — if / for / switch"
slug: "control-flow"
lessonID: "m2-l4"
type: "code"
estMin: 11
weight: 40
module: "m2"
moduleTitle: "타입 · 함수 · 제어 흐름"
step: 2
summary: "반복문 키워드는 for 하나뿐. switch는 자동 break. 그리고 for range 변수 캡처는 Go 팀이 하위호환을 깨면서까지 고친 함정이다."
---

if·for·switch는 어느 언어에나 있다. Go의 특징은 이걸 **얼마나 덜어냈는가**에 있다 — `while`도 `do-while`도 없고, `switch`에는 `break`를 쓸 필요가 없다. 그리고 이 모듈에서 가장 위험한 함정 하나가 여기 숨어 있다.
{.lead}

## for 하나로 모든 반복을

Go의 반복문 키워드는 `for` **단 하나**다. `while`, `do-while`, `foreach`가 따로 없다. 대신 `for`가 네 가지 형태로 그 전부를 표현한다.

```go
for i := 0; i < 3; i++ { }   // 1. C 스타일 3-절
for i < 3 { }                // 2. while처럼 — 조건만
for { }                      // 3. 무한 루프 — break로 탈출
for i, v := range slice { }  // 4. range — 컬렉션 순회
```

이것도 모듈 1의 "뺄셈의 설계"다. 키워드를 하나로 통일하면 "이 상황엔 while이 맞나 for가 맞나" 같은 선택이 사라진다. 읽는 사람도 `for`만 보면 된다.

## if 초기화문 — 스코프를 좁히는 장치

Go의 `if`는 조건 앞에 **초기화문**을 붙일 수 있다. 이게 에러 처리 관용구의 뼈대다.

```go
if err := doThing(); err != nil {
    return err
}
// 여기서 err는 더 이상 존재하지 않는다
```

`err`은 이 `if` 블록 안에서만 살아있다. 검사가 끝나면 스코프에서 사라지므로, 아래쪽 코드를 오염시키지 않는다. 이렇게 **변수의 수명을 필요한 최소 범위로 묶는 것**이 Go의 습관이다. 함수 상단에 변수를 잔뜩 선언해두는 다른 언어의 관행과 대비된다.

## switch — 자동 break, 그리고 그 이상

C나 Java의 `switch`는 각 `case` 끝에 `break`를 빼먹으면 다음 case로 흘러내린다(fall-through). 이 "깜빡하면 버그"가 셀 수 없이 많은 사고를 냈다. Go는 **기본을 뒤집었다** — 각 case는 자동으로 끝나고, 흘리고 싶을 때만 `fallthrough`를 명시한다.

{{< gocode file="main.go" output="working day" >}}
```go
package main

import "fmt"

func main() {
    day := "Sat"
    switch day {
    case "Sat", "Sun": // 다중 값 case
        fmt.Println("weekend")
    default:
        fmt.Println("working day")
    }

    score := 82
    switch { // 조건 없는 switch — if-else 체인 대체
    case score >= 90:
        fmt.Println("A")
    case score >= 80:
        fmt.Println("working day") // 데모용 출력
    }
}
```
{{< /gocode >}}

- **자동 break** — case를 마치면 알아서 빠져나온다.
- **다중 값 case** — `case "Sat", "Sun":`으로 여러 값을 한 번에.
- **조건 없는 switch** — `switch {`는 각 case의 조건이 참인 첫 가지를 실행한다. 길게 늘어지는 `if-else if` 체인을 훨씬 읽기 좋게 대체한다.

{{< contrast from="C / Java" note="case마다 break 필수 — 빠뜨리면 다음 case로 흘러내려 버그" to="Go" goNote="자동 break가 기본, 흘리려면 fallthrough를 명시" >}}

## ★ for range 변수 캡처 — Go 팀이 언어를 고친 함정

이 모듈에서 가장 중요한 함정이다.
{.lead}

Go 1.22 **이전**에는, `for range`의 루프 변수가 매 반복마다 새로 만들어지지 않고 **하나를 재사용**했다. 평범한 순회에선 문제가 없지만, 클로저나 goroutine이 그 변수를 캡처하면 재앙이 된다.

{{< gocode file="main.go" output="(Go 1.21 이하) 3 3 3 / (Go 1.22+) 0 1 2" >}}
```go
package main

import "fmt"

func main() {
    funcs := []func(){}
    for i := 0; i < 3; i++ {
        funcs = append(funcs, func() {
            fmt.Print(i, " ") // i를 '캡처'한다
        })
    }
    for _, f := range funcs {
        f()
    }
}
```
{{< /gocode >}}

세 클로저가 전부 **같은 `i`**를 가리키므로, 나중에 실행될 때쯤 `i`는 이미 마지막 값(`3`)이 돼 있다. 그래서 `0 1 2`가 아니라 `3 3 3`이 나왔다. goroutine에서 이 패턴을 쓰면 "왜 전부 마지막 항목만 처리하지?"라는 악명 높은 버그가 된다.

Go 1.22부터는 **루프 변수가 매 반복마다 새로 생성**되도록 바뀌어, 위 코드가 직관대로 `0 1 2`를 출력한다.

{{< callout warn >}}
★ **for range / for 루프 변수 캡처.** Go 1.22 이전에는 루프 변수가 반복마다 재사용돼서, 클로저나 goroutine이 캡처하면 전부 마지막 값만 보게 된다. 1.22 이상이라면 자동으로 해결되지만, 남의 오래된 코드를 읽거나 구버전 빌드 환경을 만나면 여전히 물릴 수 있다. 고전적 회피법은 `i := i`로 루프 안에서 지역 복사본을 만드는 것이다.
{{< /callout >}}

여기서 의미심장한 건 **Go 팀이 이걸 고친 방식**이다. Go는 "한 번 배포한 코드는 계속 컴파일된다"는 하위호환 원칙을 거의 종교처럼 지킨다. 그런 팀이 이 함정을 잡으려고 **언어의 의미(semantics)를 바꾸는 예외적 결정**을 내렸다. 그만큼 많은 사람이, 심지어 숙련자조차 반복해서 당했다는 뜻이다.

이제 모듈 2를 마무리하는 퀴즈로 감을 점검해보자.

{{< quiz id="q-m2" >}}
