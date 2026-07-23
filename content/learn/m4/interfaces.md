---
title: "인터페이스 — 암묵적 만족"
slug: "interfaces"
lessonID: "m4-l4"
type: "diagram"
estMin: 14
weight: 40
module: "m4"
moduleTitle: "구조체 · 메서드 · 인터페이스"
step: 4
summary: "구현하는 쪽은 인터페이스를 import조차 안 해도 된다. 의존성이 뒤집히고, 작은 인터페이스의 조합이 유연성을 만든다."
---

인터페이스는 Go에서 다형성을 구현하는 유일한 도구다. 그리고 그 방식이 다른 언어와 근본적으로 다르다 — **구현하겠다고 선언하지 않는다.** 메서드를 갖추면 자동으로 만족된다.
{.lead}

## 암묵적 만족 — implements가 없다

Java나 C#은 `class Cat implements Speaker`처럼 **"나는 이 인터페이스를 구현한다"를 명시**한다. Go에는 그 선언이 없다. 어떤 타입이 인터페이스가 요구하는 메서드를 **전부 가지고 있으면**, 그것만으로 인터페이스를 만족한다. 컴파일러가 컴파일 타임에 이를 검사한다("컴파일 타임 덕 타이핑").

{{< diagram id="interface-satisfaction" caption="Cat이 Speak()를 가지면 — 선언 없이도 Speaker를 자동 만족" >}}

{{< gocode file="main.go" output="meow" >}}
```go
package main

import "fmt"

type Speaker interface {
    Speak() string
}

type Cat struct{}

func (c Cat) Speak() string { return "meow" } // Speaker를 import조차 안 함

func main() {
    var s Speaker = Cat{} // Cat이 Speak()를 가지므로 자동으로 Speaker
    fmt.Println(s.Speak())
}
```
{{< /gocode >}}

`Cat`은 `Speaker`를 언급조차 하지 않는다. 그저 `Speak() string`을 가질 뿐인데, 그것만으로 `Speaker` 자리에 들어간다.

## 의존성이 뒤집힌다

이 작은 차이가 아키텍처를 바꾼다. `implements`가 없으니, **구현하는 쪽이 인터페이스를 알 필요가 없다.** 그래서 인터페이스는 구현하는 쪽이 아니라 **사용하는 쪽에서 정의**하는 게 관용이다.

표준 라이브러리의 `io.Reader`가 대표적이다. 파일, 네트워크 연결, 문자열 버퍼 — 이들은 서로 모른 채 각자 `Read()` 메서드를 가지고 있고, `io.Reader`를 받는 함수는 그 전부를 받아들인다. 구현자들은 `io` 패키지를 import할 필요조차 없다.

여기서 Go 커뮤니티의 유명한 격언이 나온다 — **"Accept interfaces, return structs"**(인터페이스를 받고, 구조체를 반환하라). 함수는 넓은 인터페이스를 받아 유연성을 얻고, 구체 타입을 반환해 호출자에게 명확함을 준다.

{{< callout info >}}
`io.Reader`가 메서드 **단 하나**인 게 우연이 아니다. 인터페이스가 작을수록 만족하기 쉽고, 조합하기 쉽다. Go는 큰 인터페이스 하나보다 **작은 인터페이스 여럿의 조합**을 선호한다("The bigger the interface, the weaker the abstraction"). 인터페이스를 설계할 때 "메서드를 더 뺄 수 없나?"를 먼저 물어라.
{{< /callout >}}

## ★ nil 인터페이스 함정

Go에서 가장 악명 높은 함정이다. 이걸 이해하려면 인터페이스의 정체부터 알아야 한다 — 인터페이스 값은 **(타입, 값) 쌍**이다.
{.lead}

인터페이스가 진짜 nil이 되려면 **타입과 값이 둘 다 비어** 있어야 한다. 그런데 구체 타입의 nil 포인터를 인터페이스에 담으면, **타입 칸은 채워지고 값 칸만 nil**이 된다. 이 인터페이스는 `!= nil`이다.

{{< gocode file="main.go" output="err != nil? true  (함정!)" >}}
```go
package main

import "fmt"

type MyError struct{}

func (e *MyError) Error() string { return "boom" }

func doWork() error {
    var p *MyError = nil // 에러 없음을 nil 포인터로 표현 (실수!)
    return p             // (타입=*MyError, 값=nil)로 감싸짐
}

func main() {
    err := doWork()
    fmt.Println("err != nil?", err != nil, " (함정!)") // true!
}
```
{{< /gocode >}}

`doWork`는 "에러 없음"을 의도했지만, `*MyError`의 nil을 `error`로 반환하는 순간 인터페이스는 `(타입=*MyError, 값=nil)`이 된다. 타입 칸이 채워졌으니 `err != nil`이 **참**이 되고, 호출부의 에러 처리 코드가 엉뚱하게 실행된다.

{{< callout warn >}}
★ **nil 인터페이스 vs 값이 nil인 인터페이스.** 인터페이스는 (타입, 값) 쌍이라, 구체 타입의 nil 포인터를 담으면 타입 칸이 채워져 `err != nil`이 된다. 규칙은 단순하다 — **에러가 없으면 구체 타입 변수를 거치지 말고 그냥 `nil`을 반환하라.** `return nil`이지 `return p`(p가 nil인 포인터)가 아니다.
{{< /callout >}}

{{< contrast from="Java / C#" note="implements로 구현을 명시 선언 → 인터페이스와 구현이 강하게 묶인다" to="Go" goNote="메서드만 갖추면 암묵적으로 만족 → 구현자는 인터페이스를 몰라도 된다" >}}
