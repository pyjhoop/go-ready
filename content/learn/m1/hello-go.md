---
title: "Hello, Go — 프로그램 해부"
slug: "hello-go"
lessonID: "m1-l3"
type: "code"
estMin: 10
weight: 30
module: "m1"
moduleTitle: "Go의 세계관 & 툴링"
step: 1
summary: "대문자 하나가 접근 제어자다. 미사용 변수는 컴파일 에러다. 가장 작은 프로그램에 철학이 다 들어있다."
---

가장 작은 Go 프로그램을 한 줄씩 뜯어보면, 다른 언어에서 온 사람이 놀랄 두 가지가 나온다: **이름의 대소문자가 접근 제어**이고, **안 쓰는 것은 에러**다.
{.lead}

## 세 줄의 뼈대

{{< gocode file="main.go" output="Hello, Go!" >}}
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
```
{{< /gocode >}}

- `package main` — 이 파일이 실행 가능한 프로그램의 진입 패키지임을 선언한다. 라이브러리라면 다른 이름을 쓴다.
- `import "fmt"` — 표준 라이브러리의 포맷/출력 패키지를 가져온다.
- `func main()` — 프로그램의 시작점. `main` 패키지의 `main` 함수가 실행된다.

여기까지는 익숙할 것이다. 진짜 Go다운 부분은 그다음이다.

## 대문자가 곧 접근 제어자

Go에는 `public` / `private` 키워드가 없다. 대신 **이름의 첫 글자 대소문자**가 가시성을 결정한다.

- 대문자로 시작하면(`Println`, `MyType`) → **외부에 공개(exported)**
- 소문자로 시작하면(`helper`, `count`) → 같은 패키지 안에서만 사용

`fmt.Println`이 대문자인 이유가 이것이다 — 패키지 밖에서 부를 수 있게 공개된 것이다. 이 규칙 덕분에 코드를 스캔하는 것만으로 무엇이 공개 API인지 즉시 보인다. 접근 제어자를 찾아 눈을 굴릴 필요가 없다.

{{< contrast from="Java / C#" note="public/private 키워드를 선언마다 붙인다" to="Go" goNote="이름의 첫 글자 대소문자가 공개 여부를 결정한다" >}}

## 안 쓰면 컴파일이 멈춘다

Go에서 가장 자주 사람을 당황시키는 지점이다. **사용하지 않는 import나 지역 변수는 경고가 아니라 컴파일 에러**다. 아래 코드는 아예 빌드되지 않는다.

```go
package main

import (
    "fmt"
    "os"   // ← 안 쓰면: imported and not used: "os"
)

func main() {
    x := 42    // ← 안 쓰면: declared and not used: x
    fmt.Println("hi")
}
```

왜 이렇게까지 엄격할까? 이건 컴파일러를 **첫 번째 코드 리뷰어**로 세운 것이다. "이 import 아직 쓰나?", "이 변수 죽은 코드 아닌가?" 같은 회색지대를 언어 차원에서 제거한다. 큰 코드베이스가 시간이 지나며 썩는 속도를 늦추는 장치다.

{{< callout warn >}}
사용하지 않는 import·지역 변수는 **컴파일 에러**다. 디버깅 중 잠깐 변수를 죽이고 싶다면 `_ = x`로 명시적으로 버리거나, import는 `_ "pkg"`(부수효과용) 형태를 쓴다.
{{< /callout >}}

{{< contrast from="Python / JS" note="안 쓰는 변수·import는 조용히 무시된다 → 죽은 코드가 쌓인다" to="Go" goNote="안 쓰면 컴파일 에러 → 코드베이스가 잘 안 썩는다" >}}
