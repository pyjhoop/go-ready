---
title: "맵(map)"
slug: "maps"
lessonID: "m3-l3"
type: "code"
estMin: 10
weight: 30
module: "m3"
moduleTitle: "슬라이스 · 맵 · 문자열"
step: 3
summary: "순회 순서가 랜덤이고, nil 상태의 읽기/쓰기가 비대칭이다."
---

맵은 익숙하지만 두 가지가 다르다: 순회 순서가 랜덤이고, nil 상태의 읽기/쓰기가 비대칭이다.
{.lead}

`make(map[K]V)`로 만들고, `v, ok := m[k]`의 comma-ok 패턴으로 "값이 있는지"와 "값이 무엇인지"를 한 번에 얻는다. `ok`가 false면 키가 없는 것이고, 그때 `v`는 zero value다.

{{< gocode file="main.go" output="1 true\nfalse\n0" >}}
```go
package main

import "fmt"

func main() {
    m := make(map[string]int)
    m["go"] = 1

    v, ok := m["go"]
    fmt.Println(v, ok)      // 1 true

    _, ok = m["rust"]
    fmt.Println(ok)         // false

    var nm map[string]int   // nil map
    fmt.Println(nm["x"])    // 읽기는 OK → 0
    // nm["x"] = 1          // 쓰기는 panic!
}
```
{{< /gocode >}}

## 순회 순서는 일부러 랜덤이다

Go의 map은 순회할 때마다 순서가 바뀐다. 버그가 아니라 **의도된 설계**다. Go 팀은 사람들이 우연히 유지되는 순서에 의존하는 걸 막으려고 일부러 순서를 랜덤화했다. 순서가 필요하면 키를 슬라이스로 뽑아 `sort`한 뒤 순회하라.

{{< callout warn >}}
nil map은 **읽기는 되지만 쓰기는 panic**이다(`assignment to entry in nil map`). 이 비대칭 때문에 구조체 필드로 선언만 하고 make를 잊으면 첫 쓰기에서 터진다.
{{< /callout >}}

{{< callout info >}}
map은 **동시 쓰기에 안전하지 않다.** 여러 goroutine이 동시에 쓰면 런타임이 `fatal error: concurrent map writes`로 프로그램을 죽인다.
{{< /callout >}}

{{< contrast from="Python dict / JS Object" note="삽입 순서 유지 · 조용한 실패" to="Go" goNote="순서 보장 없음(랜덤) + comma-ok + nil 쓰기 panic" >}}
