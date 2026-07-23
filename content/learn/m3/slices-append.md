---
title: "슬라이스의 함정 — append & 공유"
slug: "slices-append"
lessonID: "m3-l2"
type: "code"
estMin: 13
weight: 20
module: "m3"
moduleTitle: "슬라이스 · 맵 · 문자열"
step: 3
summary: "슬라이싱은 백킹 배열을 공유한다. 실무에서 진짜로 사람을 잡는 버그."
---

이 프로젝트에서 가장 중요한 함정이다. 실무에서 진짜로 사람을 잡는 버그.
{.lead}

슬라이싱 `s[1:3]`은 새 배열을 만들지 않는다. 원본과 **같은 백킹 배열을 공유하는 새 뷰**를 만들 뿐이다. 그래서 한쪽을 수정하면 다른 쪽에 그대로 반영된다.

{{< gocode file="main.go" output="original: [1 99 3 4 5]\nview: [99 3] safe: [0 3]" >}}
```go
package main

import "fmt"

func main() {
    original := []int{1, 2, 3, 4, 5}
    view := original[1:3]           // 같은 배열 공유

    view[0] = 99                    // view 수정인데...
    fmt.Println("original:", original)  // 원본도 바뀐다!

    safe := make([]int, len(view))  // copy로 독립 확보
    copy(safe, view)
    safe[0] = 0
    fmt.Println("view:", view, "safe:", safe)
}
```
{{< /gocode >}}

{{< diagram id="slice-internals" caption="슬라이스 = {ptr, len, cap} 헤더 → 백킹 배열을 가리키는 뷰. cap 초과 append는 새 배열로 재할당된다." >}}

## append의 재할당 규칙

`append`는 cap에 여유가 있으면 **제자리에** 원소를 넣고, 초과하면 대략 2배 크기의 **새 배열을 할당**한 뒤 복사한다. 문제는 이 재할당 시점이 공유가 끊기는 순간이라는 것 — 그리고 그 시점을 코드만 보고 예측하기 어렵다는 것이다.

그래서 더 교묘한 버그가 나온다: `sub := s[0:2]; sub = append(sub, x)`. 만약 `s`의 cap에 여유가 있으면, 이 append는 새 배열을 만드는 대신 `s`의 **세 번째 원소를 조용히 덮어쓴다**.

{{< callout warn >}}
★ 슬라이스를 함수에 넘길 때 **원본이 바뀔 수 있다**는 걸 항상 의식하라. 라이브러리 함수가 인자로 받은 슬라이스에 append하면, 호출자의 데이터를 오염시킬 수 있다.
{{< /callout >}}

## 방어법

독립적인 사본이 필요하면 `copy()`를 쓴다(위 예제). 또는 **full-slice 표현식** `s[low:high:max]`으로 cap을 명시적으로 제한하면, 이후 append가 무조건 새 배열을 쓰게 강제할 수 있다. 남에게 넘길 슬라이스나, 남에게서 받은 슬라이스를 append할 때 특히 유용한 방어다.

{{< contrast from="JS Array / Python list" note="슬라이싱하면 항상 새 배열이 만들어진다 — 공유 걱정이 없다" to="Go" goNote="슬라이싱은 뷰를 만든다 — 백킹을 공유하므로 수정이 전파된다" >}}

{{< quiz id="q-m3" >}}
