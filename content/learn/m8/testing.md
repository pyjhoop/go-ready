---
title: "테스트 & 벤치마크 — 표준 내장"
slug: "testing"
lessonID: "m8-l2"
type: "code"
estMin: 12
weight: 20
module: "m8"
moduleTitle: "제네릭 · 테스트 · 관용구"
step: 8
summary: "테스트 프레임워크를 설치하지 않는다. testing 패키지와 go test가 표준이고, table-driven test가 Go의 관용구다. 벤치마크와 -race까지 같은 도구 안에 있다."
---

Go에서 테스트는 서드파티 프레임워크가 아니라 **표준 라이브러리와 `go test` 명령**이다. 어서션 라이브러리도, 특별한 러너도 없다. 대신 `_test.go` 파일에 평범한 함수를 쓰고, **table-driven** 패턴으로 케이스를 데이터로 나열하는 것이 관용구다.
{.lead}

## `_test.go`와 go test

같은 패키지 디렉터리 안, `xxx_test.go`로 끝나는 파일에 `func TestXxx(t *testing.T)` 시그니처의 함수를 두면 `go test`가 자동으로 찾아 실행한다. 실패는 예외가 아니라 `t.Errorf` / `t.Fatalf` 호출로 알린다.

{{< gocode file="math_test.go" output="PASS · ok  example/math  0.002s" >}}
```go
package math

import "testing"

func Add(a, b int) int { return a + b }

func TestAdd(t *testing.T) {
    got := Add(2, 3)
    want := 5
    if got != want {
        // 어서션 매크로가 아니라 평범한 if + 에러 보고
        t.Errorf("Add(2,3) = %d; want %d", got, want)
    }
}
```
{{< /gocode >}}

`t.Errorf`는 실패를 기록하고 **계속 진행**하고, `t.Fatalf`는 기록 후 그 테스트를 **즉시 중단**한다. 어서션 DSL이 없는 게 처음엔 허전하지만, "그냥 Go 코드로 검증한다"는 단순함이 Go답다. `go test ./...`로 전체 패키지를, `-v`로 상세 출력을, `-run TestAdd`로 특정 테스트만 돌린다.

## table-driven test — Go의 시그니처 패턴

같은 로직을 입력만 바꿔 여러 번 검증할 때, 케이스를 **슬라이스에 데이터로 나열**하고 루프를 돈다. 이것이 Go에서 가장 널리 쓰이는 테스트 형태다.

```go
func TestAdd(t *testing.T) {
    cases := []struct {
        name    string
        a, b    int
        want    int
    }{
        {"양수", 2, 3, 5},
        {"음수 포함", -1, 1, 0},
        {"둘 다 0", 0, 0, 0},
    }
    for _, c := range cases {
        t.Run(c.name, func(t *testing.T) { // 하위 테스트로 분리
            if got := Add(c.a, c.b); got != c.want {
                t.Errorf("Add(%d,%d) = %d; want %d", c.a, c.b, got, c.want)
            }
        })
    }
}
```

케이스를 추가하려면 구조체 리터럴 한 줄만 넣으면 된다. `t.Run`으로 감싸면 각 케이스가 이름 붙은 하위 테스트가 되어, 실패했을 때 **어느 케이스**인지 바로 보인다.

## 벤치마크와 -race

같은 도구가 성능 측정도 한다. `func BenchmarkXxx(b *testing.B)`를 쓰고 `go test -bench=.`로 돌리면, Go가 `b.N`을 자동 조정하며 반복 측정한다.

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ { // b.N은 런타임이 정한다
        Add(2, 3)
    }
}
```

그리고 모듈 6에서 예고한 `-race`가 여기서 빛난다: `go test -race ./...`는 테스트를 돌리며 데이터 레이스까지 함께 잡는다. CI에서 동시성 코드를 검증하는 표준 방법이다.

{{< callout tip >}}
테스트 파일을 `package math_test`(뒤에 `_test`)로 선언하면 **외부에서 보는 관점**으로만 테스트하게 된다 — unexported에 접근 못 하니, 공개 API 계약만 검증하는 블랙박스 테스트가 된다. 반대로 같은 `package math`로 두면 내부까지 들여다본다. 공개 동작을 테스트할 땐 전자가 더 튼튼하다.
{{< /callout >}}

{{< callout info >}}
커버리지도 내장이다: `go test -cover`가 퍼센트를, `go test -coverprofile=c.out && go tool cover -html=c.out`이 줄 단위 시각화를 준다. 별도 도구를 깔 필요가 없다. 단, 커버리지 숫자는 **테스트가 돌린 줄**일 뿐 검증의 질을 보장하진 않는다 — 100%가 목표가 되면 의미 없는 테스트를 양산하게 된다.
{{< /callout >}}

{{< contrast from="JUnit / pytest" note="외부 프레임워크를 설치하고 @Test·assert 매크로, 별도 러너로 구동" to="Go" goNote="testing 패키지와 go test가 표준 내장 — 평범한 if로 검증하고 table-driven으로 케이스를 데이터화, 벤치·커버리지·race까지 한 도구" >}}
