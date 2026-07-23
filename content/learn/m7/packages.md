---
title: "패키지 · 가시성 · init"
slug: "packages"
lessonID: "m7-l1"
type: "concept"
estMin: 8
weight: 10
module: "m7"
moduleTitle: "패키지 · 모듈 · 표준 라이브러리"
step: 7
summary: "패키지는 디렉터리 하나이고, 공개 여부는 이름의 첫 글자 대소문자가 결정한다. init 함수는 패키지가 로드될 때 자동으로 불린다 — 편하지만 남용하면 추적 불가능한 마법이 된다."
---

Go의 코드 조직 단위는 클래스가 아니라 **패키지**다. 패키지는 곧 디렉터리 하나이고, 무엇을 밖으로 내보낼지는 접근 제어자 키워드가 아니라 **이름의 첫 글자**가 정한다. 이 단순한 규칙 두 개가 Go 프로젝트 구조의 뼈대다.
{.lead}

## 패키지 = 디렉터리, 파일이 아니다

한 디렉터리 안의 모든 `.go` 파일은 **같은 패키지**에 속한다. 파일을 여러 개로 쪼개도 그것들은 하나의 네임스페이스를 공유한다 — 파일 경계는 사람이 읽기 편하라고 나눈 것일 뿐, 컴파일러에겐 의미가 없다. 그래서 같은 패키지 안에서는 다른 파일에 있는 함수를 `import` 없이 그냥 부른다.

```
myapp/
├── go.mod
├── main.go          // package main
└── store/
    ├── store.go     // package store
    ├── user.go      // package store — store.go와 같은 네임스페이스
    └── query.go     // package store
```

이것이 자바의 "파일 하나 = 클래스 하나 = 이름 하나" 규칙과 근본적으로 다른 지점이다. 관련된 타입·함수를 여러 파일에 흩어 놓아도 사용하는 쪽에서는 `store.NewUser()` 하나로 보인다.

## 가시성은 대문자가 결정한다

식별자(함수·타입·변수·필드·메서드)의 **첫 글자가 대문자면 exported(공개)**, 소문자면 unexported(패키지 내부 전용)다. `public`/`private` 키워드가 없다.

```go
package store

func NewUser(name string) *User { ... } // 공개 — 다른 패키지에서 store.NewUser
func validate(name string) error { ... } // 비공개 — store 패키지 안에서만

type User struct {
    ID    int    // 공개 필드
    name  string // 비공개 필드 — 같은 패키지 안에서만 접근
}
```

이 규칙의 진짜 가치는 **선언부를 스캔하는 것만으로 공개 API가 한눈에 보인다**는 점이다. 키워드를 찾아 헤맬 필요 없이 대문자로 시작하는 이름만 훑으면 그게 곧 이 패키지의 계약이다. 캡슐화의 경계가 타입이 아니라 **패키지**라는 것도 기억하라 — 같은 패키지 안이라면 다른 타입의 소문자 필드에도 접근할 수 있다.

## init — 자동으로 불리는 초기화 훅

`init()` 함수는 패키지가 처음 로드될 때 `main`보다 **먼저, 자동으로** 실행된다. 인자도 반환값도 없고, 직접 호출할 수도 없다. 한 패키지에 여러 개, 한 파일에 여러 개 둘 수 있다.

```go
package config

var settings map[string]string

func init() {
    // 패키지가 쓰이기 전에 전역 상태를 준비
    settings = loadFromEnv()
}
```

실행 순서는 정해져 있다: import된 패키지들이 먼저 초기화되고(의존성 그래프의 잎부터), 그 다음 패키지 수준 변수들이 선언 순서대로, 마지막에 `init()`들이 돈다.

{{< callout warn >}}
`init`은 편리하지만 **숨은 마법**이다. 아무도 호출하지 않았는데 상태가 바뀌어 있으니, 버그를 추적할 때 "이게 언제 세팅됐지?"에서 막힌다. 특히 부수효과만을 위해 `import _ "some/driver"`로 패키지를 끌어와 `init`을 도는 패턴은 강력하지만(예: `database/sql` 드라이버 등록) 그만큼 흐름을 감춘다. 가능하면 명시적인 생성자 함수(`New...`)를 쓰고, `init`은 정말로 자동이어야 하는 등록/검증에만 아껴 써라.
{{< /callout >}}

{{< callout info >}}
패키지 이름은 **짧고 소문자, 관용적으로 단수**다(`store`, `http`, `json`). 사용하는 쪽에서 `store.User`처럼 붙어 읽히므로, `userstore`처럼 접두사를 중복하거나 `util`·`common`처럼 아무 의미 없는 이름을 쓰면 그 자체가 냄새다. 이름이 안 떠오른다는 건 대개 그 패키지가 한 가지 일에 집중하지 못했다는 신호다.
{{< /callout >}}

{{< contrast from="Java/Python" note="public/private 키워드, __ 접두사 관례 등으로 가시성을 표시하고 파일과 클래스가 1:1로 묶인다" to="Go" goNote="이름 첫 글자 대소문자로 가시성을 정하고, 디렉터리 하나가 통째로 한 패키지 = 하나의 네임스페이스" >}}
