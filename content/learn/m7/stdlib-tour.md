---
title: "표준 라이브러리 투어 — 배터리 포함"
slug: "stdlib-tour"
lessonID: "m7-l3"
type: "code"
estMin: 14
weight: 30
module: "m7"
moduleTitle: "패키지 · 모듈 · 표준 라이브러리"
step: 7
summary: "Go의 표준 라이브러리는 프레임워크를 끌어오기 전에 이미 웹 서버·HTTP 클라이언트·시간·IO를 다 갖고 있다. 다른 언어에서 서드파티로 채우던 자리를 표준이 채운다는 감각을 잡는다."
---

Go로 처음 실무 코드를 짜는 사람이 가장 자주 놀라는 지점은 "생각보다 아무것도 설치 안 해도 된다"는 것이다. HTTP 서버, JSON, 암호화, 시간 처리가 전부 표준 라이브러리 안에 있다. 프레임워크는 선택이지 전제가 아니다.
{.lead}

## `net/http` — 프레임워크 없는 웹 서버

다른 언어라면 Express·Flask·Spring부터 깔았을 자리에, Go는 `net/http`만으로 프로덕션급 서버를 세운다. 라우팅·요청 파싱·응답 쓰기가 전부 표준이다.

{{< gocode file="main.go" output="(localhost:8080에서 요청을 받는 HTTP 서버가 뜬다)" >}}
```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /hello/{name}", func(w http.ResponseWriter, r *http.Request) {
        name := r.PathValue("name") // Go 1.22+ 경로 변수
        fmt.Fprintf(w, "Hello, %s!", name)
    })
    // 서드파티 라우터 없이 표준 라이브러리만으로 동작한다
    http.ListenAndServe(":8080", mux)
}
```
{{< /gocode >}}

Go 1.22부터는 `ServeMux`가 `GET`/`POST` 같은 메서드와 `{name}` 경로 변수까지 이해한다. 예전에 서드파티 라우터를 쓰던 가장 큰 이유가 사라졌다는 뜻이다. `http.Handler` 인터페이스(메서드 `ServeHTTP` 하나)가 미들웨어·핸들러의 공통 계약이라, 로깅·인증 같은 미들웨어도 함수 하나로 감싸 조립한다.

## `net/http` 클라이언트와 `io`

같은 패키지가 클라이언트 쪽도 담당한다. 그리고 응답 본문은 `io.Reader`라서, 파일이든 네트워크든 **같은 인터페이스**로 흐른다.

```go
resp, err := http.Get("https://api.example.com/data")
if err != nil {
    return err
}
defer resp.Body.Close() // 반드시 닫는다 — 안 닫으면 연결 누수

body, err := io.ReadAll(resp.Body) // resp.Body는 io.Reader
```

`resp.Body`가 `io.Reader`라는 점이 핵심이다. `io.Copy`, `json.NewDecoder`, `bufio.Scanner` 같은 도구들이 전부 이 작은 인터페이스 위에서 동작하므로, 데이터 출처를 몰라도 같은 코드로 다룬다. 4.4에서 본 "작은 인터페이스의 조합"이 표준 라이브러리 전체를 관통하는 원리다.

## 자주 쓰는 나머지 패키지들

- `time` — 시간·기간·타이머. `time.Now()`, `time.Duration`, `time.After`(모듈 6에서 이미 등장).
- `strings` / `strconv` — 문자열 조작과 숫자↔문자열 변환(`strconv.Atoi`, `strconv.Itoa`).
- `os` / `bufio` — 파일·표준 입출력, 버퍼링된 읽기.
- `encoding/json` — 다음 레슨의 주제.
- `errors` / `fmt` — 모듈 5에서 다룬 에러 래핑·검사.
- `sort` / `slices` / `maps` — 정렬과 컬렉션 유틸(`slices`·`maps`는 제네릭 기반, 모듈 8 복선).

{{< callout tip >}}
새 의존성을 추가하기 전에 **"표준에 이미 있지 않나?"를 먼저 물어라.** Go 커뮤니티는 서드파티를 얇게 유지하는 문화가 강하다. 의존성 하나가 곧 공급망 위험이자 유지보수 부담이기 때문이다. 웹 서버, HTTP 클라이언트, JSON, 암호화, 압축, 템플릿은 표준으로 대개 충분하다. 프레임워크는 정말로 반복되는 보일러플레이트가 쌓였을 때 도입해도 늦지 않다.
{{< /callout >}}

{{< callout warn >}}
`resp.Body`·파일·`io.ReadCloser`는 다 쓰면 **반드시 `Close()`** 해야 한다. 안 닫으면 파일 디스크립터와 네트워크 연결이 새어 서버가 서서히 자원 고갈로 죽는다. 여는 즉시 `defer resp.Body.Close()`를 거는 것이 관용구다 — 단, `err`를 먼저 검사한 뒤에 defer를 걸어라. 에러일 때 `resp`는 nil일 수 있다.
{{< /callout >}}

{{< contrast from="Node/Python" note="웹 서버·라우팅·시간 라이브러리를 npm/pip으로 골라 설치하고 조립 — 생태계가 넓지만 선택과 관리 부담" to="Go" goNote="net/http·time·io·encoding이 표준에 포함 — 설치 없이 바로 프로덕션급, 인터페이스로 서로 조합된다" >}}
