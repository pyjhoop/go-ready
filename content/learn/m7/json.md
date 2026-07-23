---
title: "JSON & struct 태그"
slug: "json"
lessonID: "m7-l4"
type: "code"
estMin: 10
weight: 40
module: "m7"
moduleTitle: "패키지 · 모듈 · 표준 라이브러리"
step: 7
summary: "encoding/json은 리플렉션으로 struct와 JSON을 오간다. 필드 매핑은 struct 태그로 제어하고, 가장 자주 당하는 함정은 unexported 필드가 조용히 사라지는 것이다."
---

웹 API를 다루면 JSON 직렬화/역직렬화가 일상이다. Go는 `encoding/json`으로 struct와 JSON을 자동으로 오가되, **필드 이름 매핑**은 struct 태그라는 메타데이터로 제어한다. 여기서 경험자도 반드시 한 번은 당하는 함정이 있다.
{.lead}

## Marshal / Unmarshal — struct ↔ JSON

`json.Marshal`은 값을 JSON 바이트로, `json.Unmarshal`은 JSON을 struct로 되돌린다. 리플렉션으로 필드를 훑기 때문에 코드 생성이나 사전 등록이 필요 없다.

{{< gocode file="main.go" output="{\"name\":\"Ada\",\"age\":36}" >}}
```go
package main

import (
    "encoding/json"
    "fmt"
)

type User struct {
    Name string `json:"name"` // JSON 키를 소문자 name으로
    Age  int    `json:"age"`
}

func main() {
    u := User{Name: "Ada", Age: 36}
    b, _ := json.Marshal(u)   // struct → JSON
    fmt.Println(string(b))    // {"name":"Ada","age":36}
}
```
{{< /gocode >}}

`User{Name: "Ada"}`의 필드는 대문자인데 JSON 키는 소문자 `name`으로 나갔다. 이걸 정하는 게 백틱 안의 **struct 태그** `json:"name"`이다. 태그가 없으면 필드 이름 그대로(`Name`) 대문자로 나가버려 대개 API 규약과 어긋난다.

## struct 태그 옵션

태그에는 이름 뒤로 옵션을 콤마로 덧붙인다. 실무에서 가장 자주 쓰는 셋:

```go
type Product struct {
    ID    int     `json:"id"`
    Name  string  `json:"name"`
    Price float64 `json:"price,omitempty"` // zero value면 아예 생략
    notes string  `json:"-"`               // (설령 대문자여도) 항상 제외
    Tags  []string `json:"tags,omitempty"`
}
```

- `json:"id"` — 키 이름을 지정.
- `omitempty` — 값이 zero value(0, "", nil, 빈 슬라이스 등)면 출력에서 뺀다. 선택적 필드에 유용.
- `json:"-"` — 이 필드는 직렬화에서 완전히 제외.

역직렬화 시 JSON 키 매칭은 **대소문자를 구분하지 않는다** — `Name`, `name`, `NAME`이 모두 `Name` 필드로 들어온다. 반면 없는 필드는 조용히 무시되고, 빠진 필드는 zero value로 남는다.

{{< callout warn >}}
★ **unexported(소문자) 필드는 JSON에 아예 나오지 않는다.** `encoding/json`은 리플렉션으로 필드를 읽는데, 소문자 필드는 다른 패키지에서 접근 불가라 리플렉션도 건드리지 못한다. 위 예의 `notes`처럼 소문자 필드는 `json:"-"` 태그를 붙이든 안 붙이든 **어차피 직렬화되지 않는다.** "분명 값을 채웠는데 JSON에 없다"의 90%는 필드 첫 글자가 소문자인 경우다. API로 내보낼 필드는 반드시 **대문자로 시작**하게 하라.
{{< /callout >}}

{{< callout info >}}
큰 JSON을 다룰 땐 `json.Marshal`(메모리에 통째로) 대신 `json.NewEncoder(w).Encode(v)` / `json.NewDecoder(r).Decode(&v)`를 쓴다. 이들은 `io.Writer`·`io.Reader` 위에서 **스트리밍**으로 동작해, HTTP 응답 본문에 바로 쓰거나 요청 본문에서 바로 읽을 때 메모리 효율이 좋다. 구조가 불규칙해 struct로 못 받을 때만 `map[string]any`로 받되, 그건 타입 안전성을 포기하는 것이라 최후의 수단이다.
{{< /callout >}}

{{< contrast from="Python/JS" note="json.loads가 dict를, JSON.parse가 객체를 돌려줘 어떤 키든 런타임에 받는다 — 유연하지만 타입 검증은 내 몫" to="Go" goNote="struct에 정적으로 매핑하고 태그로 키·옵션을 선언 — 컴파일 타임 타입 보장, 대신 대문자 필드 규칙을 지켜야 한다" >}}

{{< quiz id="q-m7" >}}
