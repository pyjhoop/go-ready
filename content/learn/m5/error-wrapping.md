---
title: "에러 래핑 & 검사 — %w, errors.Is / As"
slug: "error-wrapping"
lessonID: "m5-l2"
type: "code"
estMin: 10
weight: 20
module: "m5"
moduleTitle: "에러 처리 · panic · defer"
step: 5
summary: "에러를 위로 넘기다 보면 '어디서 왜' 실패했는지 문맥이 필요하다. %w로 원인을 감싸고, errors.Is로 값을, errors.As로 타입을 꺼낸다."
---

에러를 그냥 위로 넘기기만 하면 최상단에서 받는 건 `no such file` 같은 앙상한 메시지뿐이다. **어느 단계에서 왜** 그랬는지 문맥을 붙이는 것이 래핑이고, 감싼 에러를 다시 꺼내 보는 것이 `errors.Is` / `errors.As`다.
{.lead}

## `%w` — 에러를 감싸 사슬을 만든다

`fmt.Errorf`에 `%w`(wrap) 동사를 쓰면, 새 메시지로 문맥을 더하면서 **원본 에러를 안에 보존**한다. 이렇게 감싼 에러들은 하나의 사슬(chain)이 된다.

```go
func loadConfig(path string) error {
    f, err := os.Open(path)
    if err != nil {
        // 문맥을 더하되 원본 err를 %w로 보존
        return fmt.Errorf("설정 로드 실패 (%s): %w", path, err)
    }
    defer f.Close()
    return nil
}
```

최상단 로그에는 `설정 로드 실패 (config.yaml): open config.yaml: no such file or directory`처럼 **경로 전체의 이야기**가 남는다. `%w` 대신 `%v`를 쓰면 메시지 문자열은 같아 보여도 원본 에러가 사슬에서 끊겨, 아래에서 볼 `errors.Is`가 통하지 않는다.

## `errors.Is` — 특정 에러 '값'인지 검사

문자열을 비교하지 마라(`err.Error() == "..."`는 깨지기 쉽다). 표준 라이브러리는 센티넬(sentinel) 에러 값을 제공하고, `errors.Is`가 사슬을 **끝까지 따라가며** 그 값이 안에 있는지 확인한다.

{{< gocode file="main.go" output="파일이 없습니다 (errors.Is로 원인 감지)" >}}
```go
package main

import (
    "errors"
    "fmt"
    "io/fs"
    "os"
)

func loadConfig(path string) error {
    _, err := os.Open(path)
    if err != nil {
        return fmt.Errorf("설정 로드 실패: %w", err) // 감싼다
    }
    return nil
}

func main() {
    err := loadConfig("none.txt")
    // 여러 겹 감싸여 있어도, 사슬 안에 fs.ErrNotExist가 있으면 true
    if errors.Is(err, fs.ErrNotExist) {
        fmt.Println("파일이 없습니다 (errors.Is로 원인 감지)")
    }
}
```
{{< /gocode >}}

## `errors.As` — 특정 '타입'을 꺼낸다

원인이 단순한 값이 아니라 필드를 가진 커스텀 에러 타입이라면, `errors.As`로 사슬에서 그 타입을 찾아 **변수에 추출**한다. 찾으면 `true`를 반환하고 대상 포인터를 채운다.

```go
var perr *fs.PathError
if errors.As(err, &perr) {
    // perr.Op, perr.Path 등 구조화된 필드에 접근 가능
    fmt.Println("문제의 경로:", perr.Path)
}
```

기억법: **`Is`는 값 비교(이 에러인가?), `As`는 타입 추출(이 타입으로 꺼내 필드를 보고 싶다).**

{{< callout warn >}}
문맥을 더할 때 `%v`가 아니라 **`%w`를 써야** `errors.Is` / `errors.As`가 통한다. `%v`는 원본을 문자열로 납작하게 눌러 사슬을 끊는다. 반대로, 원본 에러를 호출자에게 **노출하고 싶지 않을 때**(내부 구현 누출 방지)는 일부러 `%v`로 감싸 사슬을 끊는 것도 정당한 선택이다.
{{< /callout >}}

{{< callout tip >}}
래핑은 로그의 품질을 결정한다. `return err`만 반복하면 최상단에서 "무엇이"만 알고 "어디서"는 모른다. 각 계층에서 **그 계층만 아는 문맥**(어떤 경로, 어떤 사용자 ID, 어떤 단계)을 `%w`로 얹어 나가면, 스택 트레이스 없이도 실패의 전체 경로가 한 줄에 재구성된다.
{{< /callout >}}

{{< contrast from="Java 예외 체이닝" note="new IOException(msg, cause)로 cause를 감싸고 getCause()로 거슬러 올라간다 — 스택 트레이스에 의존" to="Go" goNote="fmt.Errorf(\"...: %w\", err)로 감싸고 errors.Is/As로 사슬을 검사 — 값 기반, 스택 트레이스 없이 프로그래밍 가능" >}}
