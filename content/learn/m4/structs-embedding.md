---
title: "구조체 & 임베딩"
slug: "structs-embedding"
lessonID: "m4-l1"
type: "code"
estMin: 11
weight: 10
module: "m4"
moduleTitle: "구조체 · 메서드 · 인터페이스"
step: 4
summary: "임베딩은 상속처럼 보이지만 has-a에 문법 설탕을 얹은 것이다. 가상 디스패치가 없으니 오버라이드도 없다 — 가릴(shadow) 뿐이다."
---

Go에는 클래스가 없다. 대신 구조체(struct)와 **임베딩(embedding)**이 있다. 임베딩은 상속처럼 생겼지만 상속이 아니다 — 이 차이를 놓치면 계속 헛발을 딛는다.
{.lead}

## 구조체 — 필드의 묶음

구조체는 데이터를 묶는 가장 기본 단위다. 클래스와 달리 메서드가 몸통 안에 들어있지 않고, 필드만 담는다(메서드는 다음 레슨에서 별도로 붙인다).

```go
type Animal struct {
    Name string
}
func (a Animal) Speak() string { return a.Name + " makes a sound" }
```

## 임베딩 — 이름 없는 필드

한 구조체 안에 다른 구조체를 **이름 없이** 넣으면, 그 필드와 메서드가 바깥 구조체로 **승격(promotion)**된다.

{{< gocode file="main.go" output="Rex makes a sound / Rex barks" >}}
```go
package main

import "fmt"

type Animal struct{ Name string }

func (a Animal) Speak() string { return a.Name + " makes a sound" }

type Dog struct {
    Animal            // 임베딩 — 이름 없는 필드
    Breed string
}

func (d Dog) Bark() string { return d.Name + " barks" }

func main() {
    d := Dog{Animal: Animal{Name: "Rex"}, Breed: "Lab"}
    fmt.Println(d.Speak()) // Animal의 메서드가 승격됨
    fmt.Println(d.Bark())  // d.Name도 승격됨 (d.Animal.Name 생략 가능)
}
```
{{< /gocode >}}

`Dog`는 `Speak()`를 직접 정의하지 않았는데도 `d.Speak()`가 된다. 임베딩된 `Animal`의 메서드가 `Dog`로 승격됐기 때문이다. `d.Name`도 `d.Animal.Name`의 축약이다. 겉보기엔 `Dog extends Animal`처럼 보인다.

## 상속과 무엇이 다른가

여기가 핵심이다. 임베딩은 **has-a(포함)에 문법 설탕**을 얹은 것이지, is-a(상속)가 아니다. 결정적 차이는 **가상 디스패치(virtual dispatch)가 없다**는 것.

```go
func (a Animal) Describe() string { return "I am " + a.Speak() }
```

`Dog`가 `Speak()`를 새로 정의해도, `Animal.Describe()` 안의 `a.Speak()`는 여전히 **`Animal`의 `Speak()`**를 부른다. 하위 타입의 것으로 바뀌지 않는다. 다른 언어의 상속이라면 오버라이드된 버전이 불렸겠지만, Go에는 그런 연결이 없다.

- **오버라이드가 아니라 가림(shadow)이다** — 바깥에서 같은 이름의 메서드를 정의하면 승격된 것을 **가릴 뿐**, 임베딩된 타입 내부의 호출까지 바꾸진 못한다.
- **`super`도 메서드 체인도 없다** — 부모를 거슬러 올라가는 개념 자체가 없다. 필요하면 `d.Animal.Speak()`처럼 명시적으로 부른다.

{{< contrast from="Java / C++" note="extends로 계층을 만들고 가상 디스패치로 하위 메서드가 자동 호출된다" to="Go" goNote="임베딩은 메서드 승격일 뿐 — 가상 디스패치가 없어 오버라이드가 아니라 가림이다" >}}

{{< callout info >}}
`extends`가 아예 없으니, 여러 층으로 쌓인 취약한 클래스 트리(fragile base class)를 만들 방법 자체가 없다. 다형성이 필요하면 상속이 아니라 **인터페이스**로 푼다(이 모듈 4.4). 임베딩은 "코드 재사용", 인터페이스는 "다형성" — Go는 이 둘을 깔끔히 분리했다.
{{< /callout >}}
