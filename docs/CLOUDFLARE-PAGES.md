# Cloudflare Pages 배포

## 준비된 설정

| 항목 | 값 |
| --- | --- |
| 저장소 | `sucrebae-star/sparringclub` |
| 검토 브랜치 | `codex/academy-responsive-ui` |
| 프레임워크 프리셋 | None |
| 빌드 명령 | `npm run build` |
| 출력 디렉터리 | `dist` |
| 루트 디렉터리 | 저장소 루트 |
| Node.js | 22 이상 |

빌드에는 유료 플러그인이나 패키지 설치가 필요하지 않습니다. 자체 예약 API는 Pages Functions와 D1을 사용합니다. [예약·문자 설정](BOOKING-SMS.md)을 함께 적용해야 합니다. Firebase 설정·저장소·컬렉션은 기존 프로젝트 그대로입니다. 기존 Firebase 서비스의 사용량 및 결제 상태는 변경하지 않았습니다.

## 현재 상태

2026-10-16 현재 Cloudflare CLI가 로그인되어 있지 않고 Cloudflare 연결 플러그인도 없습니다. Cloudflare Pages 프로젝트 생성·배포는 실행하지 않았으며, 유료 플랜을 신청하지 않았습니다. 현재 DNS A 레코드는 `116.124.39.226`을 가리킵니다.

연결 후 Pages의 Git 연동에서 위 설정으로 `*.pages.dev` 미리보기를 먼저 생성하세요. Firebase Authentication에서 새로운 미리보기 도메인이 필요한 경우 해당 프로젝트의 승인 도메인을 별도로 확인해야 합니다. 이 작업에서는 인증 허용 도메인도 변경하지 않았습니다.

PR을 검토하기 전 `main`에 병합하지 않습니다. 기존 GitHub Pages/도메인 연결이 있을 수 있으므로 Pages의 운영 연결과 기존 호스팅 전환은 별도 확인 후 진행합니다. 저장소의 기존 `CNAME`은 원문을 유지했고, `dist`에는 복사하지 않습니다.

사용자는 이번 작업에서 `sparringclub.kr` 배포를 요청했습니다. Pages와 예약 기능의 실제 운영 검증이 끝나고 호스팅케이알 관리 권한이 확보된 뒤 도메인을 연결해야 합니다. 아직 DNS·네임서버·`www` 레코드는 변경하지 않았습니다.

API는 `/api/*`에서만 Functions를 실행하도록 배포 경로를 제한했습니다. 예약·관리 API와 데이터는 공개 정적 파일에 포함되지 않으며 개인정보 응답은 캐시하지 않습니다.

## 공식 문서

- [정적 HTML 사이트](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [빌드 설정](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [미리보기 배포](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [사용자 지정 도메인](https://developers.cloudflare.com/pages/configuration/custom-domains/)

Cloudflare는 신규 프로젝트에 Workers를 권장하지만 정적 사이트의 Pages 배포도 지원합니다. 이 프로젝트는 사용자의 Pages 우선 요청과 기존 정적 구조에 맞춰 유지했습니다.
