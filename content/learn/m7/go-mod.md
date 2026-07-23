---
title: "모듈 관리 — go.mod와 의존성"
slug: "go-mod"
lessonID: "m7-l2"
type: "code"
estMin: 10
weight: 20
module: "m7"
moduleTitle: "패키지 · 모듈 · 표준 라이브러리"
step: 7
summary: "모듈은 함께 배포되는 패키지 묶음이고, go.mod가 그 이름과 의존성을 정의한다. import 경로가 URL처럼 생긴 이유, go.sum이 지키는 것, 그리고 go get / tidy의 역할."
---

패키지가 코드 조직 단위라면, **모듈**은 버전을 붙여 함께 배포하는 단위다. 프로젝트 루트의 `go.mod` 한 파일이 모듈의 이름과 의존성 전체를 선언한다. 중앙 레지스트리에 이름을 선점하는 전쟁이 없고, 락 파일을 손으로 만질 일도 거의 없다.
{.lead}

## go.mod — 모듈의 신분증

`go mod init <경로>`로 만든 `go.mod`는 세 가지를 담는다: 모듈 경로, Go 버전, 그리고 의존성 목록이다.

```
module github.com/you/myapp

go 1.22

require (
    github.com/google/uuid v1.6.0
    golang.org/x/text v0.14.0
)
```

여기서 `module github.com/you/myapp`가 이 프로젝트의 **정체이자 import 접두사**다. 내부 패키지 `store`는 바깥에서 `github.com/you/myapp/store`로 import된다. import 경로가 URL처럼 생긴 건 우연이 아니다 — **이름과 위치가 하나**라서, `go`가 그 주소로 직접 소스를 가져올 수 있다. 별도의 패키지 저장소에 이름을 등록할 필요가 없다.

## 의존성을 더하고 정리하기

새 라이브러리를 쓰려면 코드에서 import한 뒤 `go mod tidy`를 돌리면 된다. Go가 소스를 스캔해서 **실제로 쓰는 것만** `require`에 넣고, 안 쓰는 건 빼며, 필요한 걸 내려받는다.

{{< gocode file="터미널" output="go: downloading github.com/google/uuid v1.6.0" >}}
```go
// main.go 에서 이렇게 import 하면
import "github.com/google/uuid"

// 터미널에서
// $ go mod tidy      // import를 스캔해 go.mod / go.sum 을 맞춘다
// $ go build         // 빌드하며 필요한 모듈을 캐시로 가져온다
```
{{< /gocode >}}

주요 명령은 넷이다: `go get pkg@v1.2.3`(특정 버전 추가·갱신), `go mod tidy`(import와 go.mod를 동기화), `go mod download`(캐시로 미리 받기), `go list -m all`(의존성 트리 확인). 버전은 **시맨틱 버전** 태그(`v1.6.0`)를 그대로 쓴다.

## go.sum과 재현 가능한 빌드

`go.mod` 옆에는 `go.sum`이 생긴다. 이건 내려받은 각 모듈의 **암호학적 체크섬**을 적어둔 파일이다. 누군가 같은 버전 태그 뒤의 코드를 몰래 바꿔치기해도 해시가 어긋나 빌드가 거부된다.

{{< callout warn >}}
`go.mod`와 `go.sum`은 **반드시 커밋한다**. 이 둘이 있어야 다른 사람이(또는 CI가) 정확히 같은 의존성으로 빌드를 재현할 수 있다. 반대로, 내려받은 모듈 소스 자체(`$GOPATH/pkg/mod` 캐시)는 커밋하지 않는다 — `node_modules`를 저장소에 넣지 않는 것과 같다. 또 `go.sum`을 손으로 편집하지 마라. 해시 관리는 `go` 도구의 몫이다.
{{< /callout >}}

{{< callout tip >}}
`major` 버전이 바뀌면(v1 → v2) import 경로 끝에 버전이 붙는다: `github.com/foo/bar/v2`. 이건 실수가 아니라 설계다 — v1과 v2를 **동시에** 다른 이름으로 쓸 수 있어, 큰 프로젝트에서 의존성을 점진적으로 마이그레이션할 수 있다. 처음 보면 당황스럽지만 "깨는 변경은 새 이름"이라는 규칙이 셈틀 지옥을 막는다.
{{< /callout >}}

{{< contrast from="Node(npm) / Java(Maven)" note="package.json + 별도 lockfile, 중앙 레지스트리에 이름 등록, node_modules를 로컬에 대량 설치" to="Go" goNote="go.mod 하나가 이름·버전을 정의하고 import 경로가 곧 소스 주소, go.sum이 무결성을 보장하는 전역 캐시" >}}
