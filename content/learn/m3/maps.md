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
summary: "순회 순서는 일부러 랜덤이다. nil map은 읽기는 되지만 쓰기는 panic이다 — 이 비대칭이 함정의 핵심."
---

맵은 어느 언어에나 있는 익숙한 자료구조다. Go의 맵에서 낯선 건 딱 두 가지다 — **순회 순서가 매번 뒤바뀌고**, **초기화하지 않은 맵에 쓰면 죽는다.**
{.lead}

## make 와 comma-ok

맵은 `make`로 만들고, 값 조회는 **comma-ok** 관용구로 한다.

{{< gocode file="main.go" output="90 true / 0 false" >}}
```go
package main

import "fmt"

func main() {
    scores := make(map[string]int)
    scores["alice"] = 90

    v, ok := scores["alice"]
    fmt.Print(v, " ", ok, " / ")   // 90 true

    // 없는 키를 조회하면? 에러가 아니라 zero value + false
    v2, ok2 := scores["bob"]
    fmt.Print(v2, " ", ok2)        // 0 false
}
```
{{< /gocode >}}

`scores["bob"]`처럼 없는 키를 조회해도 에러가 나지 않는다. `int`의 zero value인 `0`을 돌려준다. 그래서 "값이 0인 키"와 "없는 키"를 구별하려면 두 번째 반환값 `ok`가 필요하다. 이게 **comma-ok** 패턴이고, Go 곳곳(맵 조회, 타입 단언, 채널 수신)에서 재등장한다.

## 순회 순서는 일부러 랜덤이다

Go 맵을 `range`로 돌리면 순서가 **매 실행마다 바뀐다.** 이건 버그도, 미정의 동작도 아니다 — Go 팀이 **의도적으로 무작위화**한 것이다.

왜 이렇게까지 했을까? 다른 언어에서 해시맵의 순회 순서는 "정의되지 않음"이지만, 구현상 우연히 일정하게 나오는 경우가 많다. 그러면 개발자가 자기도 모르게 그 우연한 순서에 **의존하는 코드**를 짜고, 런타임 버전이 바뀌면 조용히 깨진다. Go는 이 함정을 원천 봉쇄하려고 순서를 매번 섞는다 — "순서에 의존하지 마라"를 조언이 아니라 **강제**로 만든 것이다. 정렬된 순회가 필요하면 키를 슬라이스로 뽑아 `sort` 후 돌린다.

## nil map — 읽기는 OK, 쓰기는 panic

가장 잘 물리는 함정이다. `make` 없이 선언만 한 맵(즉 zero value인 **nil map**)은 **읽을 수는 있지만 쓸 수는 없다.**

```go
var m map[string]int   // nil map (make 안 함)
_ = m["x"]             // OK — zero value 0을 반환
m["x"] = 1             // panic: assignment to entry in nil map
```

읽기가 멀쩡히 동작하기 때문에 더 위험하다. 코드가 한참 잘 돌다가, 첫 **쓰기** 시점에서야 터진다.

{{< callout warn >}}
**nil map은 읽기는 되지만 쓰기는 panic이다.** 이 비대칭 때문에, 구조체 필드로 맵을 두고 `make`를 깜빡하면 그 필드에 처음 값을 넣는 순간 `assignment to entry in nil map`으로 죽는다. 맵은 쓰기 전에 반드시 `make(map[K]V)`로 초기화하라 — 구조체라면 생성자나 초기화 함수에서.
{{< /callout >}}

{{< callout info >}}
맵은 동시 접근에도 안전하지 않다. 여러 goroutine이 같은 맵에 동시에 쓰면 `fatal error: concurrent map writes`로 프로그램이 즉시 죽는다(복구 불가). 동시성이 필요하면 `sync.Mutex`나 `sync.Map`을 쓴다 — 자세한 건 모듈 6에서 다룬다.
{{< /callout >}}

{{< contrast from="Python dict / JS Object" note="없는 키 접근·순서 처리가 언어마다 제각각이고 암묵적이다" to="Go" goNote="comma-ok로 존재 여부를 명시하고, 순회 순서는 아예 무작위로 못 박았다" >}}
