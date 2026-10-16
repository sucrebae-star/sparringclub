# GitHub Pages 배포

이 저장소는 공개 GitHub Pages의 무료 범위에서 정적 사이트를 배포합니다. `.github/workflows/publish-pages.yml`이 테스트와 빌드를 실행하고 `dist`만 배포합니다. 기존 Firebase 스파링클럽 데이터와 카카오 예약 상품은 이 배포에서 수정하지 않습니다. Cloudflare Functions의 과거 예약 API는 Pages에서 실행되지 않으며, 현재 홈페이지의 상담예약은 카카오 예약하기로 연결됩니다.

GitHub Pages 설정은 원래 `main` 브랜치 루트를 게시하고 `sparringclub.kr`을 사용자 지정 도메인으로 등록한 상태였습니다. 새 사이트의 배포 소스를 GitHub Actions로 전환하면 PR 브랜치를 먼저 게시해 검증할 수 있습니다. PR을 병합하면 `main`에서도 같은 빌드 절차를 사용합니다.

`sparringclub.kr`의 호스팅케이알 DNS는 사용자 사전 확인 전 변경하지 않습니다. 현재 A 레코드가 기존 서버 `116.124.39.226`을 가리켜, Pages에 새 파일을 게시하더라도 공개 도메인에는 옛 사이트가 계속 표시됩니다. 전환 전에는 Pages 배포 상태와 빌드 결과를 확인하고, 도메인 접속 전환에 필요한 DNS 변경값을 별도로 제시합니다. 기존 DNS·네임서버와 저장소 `CNAME`은 이 브랜치에서 수정하지 않습니다.

프로젝트 경로(`/sparringclub/`)와 사용자 지정 도메인 루트(`/`) 모두에서 링크·설치형 앱 캐시가 동작하도록 상대 경로를 사용합니다. 배포 산출물에서는 Cloudflare 전용 `_headers`, `_routes.json` 파일을 제거합니다.

참고: [GitHub Pages 게시 소스](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [사용자 지정 도메인](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
