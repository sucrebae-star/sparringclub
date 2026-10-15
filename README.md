# 복싱사관학교 · 스파링클럽

복싱사관학교 공식 홈페이지와 기기별 UI를 추가하고, 기존 Firebase 스파링클럽을 보존했습니다. 홈페이지 예약은 Cloudflare Pages Functions + D1, 관장님 접수 알림은 SOLAPI 유료 SMS로 준비했습니다.

- `/` — 공식 홈페이지, 프로그램, 운영시간, 방문 안내, 자체 상담·체험 예약
- `/club.html` — 기존 회원·매칭·기록·체육관·커뮤니티·관리자 기능
- `/booking-admin.html` — 비밀키 인증 후 예약 조회·확정·취소
- 기존 `/#players`, `/#board`, `/?postId=...` 공유 주소와 설치형 앱은 클럽 화면으로 연결

## 실행 및 검증

Node.js 22.13 이상. 패키지 설치 없이 검사·빌드합니다.

```sh
npm test
npm run build
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

단순 정적 서버에서는 예약 API가 없으므로 전화 문의만 이용할 수 있습니다. 실제 서버 연결 전 접수 완료를 표시하지 않습니다.

```sh
npm run preview:fixtures
# http://127.0.0.1:4174/ — 가상 예약 / 외부 SMS 없음
# http://127.0.0.1:4174/club.html?qaRole=member
# qaRole=guest|member|manager|admin
```

QA 서버는 가상 회원 데이터로 Firebase를 대체하고 원격 쓰기를 차단합니다. 예약은 메모리 SQLite에서 실제 서버 검증과 SQL을 실행하고 문자 전송을 대체합니다. 재시작하면 가상 예약은 사라집니다. 운영 배포물에 포함되지 않습니다.

## 운영 준비

[Cloudflare Pages 배포](docs/CLOUDFLARE-PAGES.md), [예약·문자 설정](docs/BOOKING-SMS.md), [검증 결과](docs/VERIFICATION.md)를 참고하세요. Cloudflare 연결과 문자 서비스 설정 전에는 온라인 예약이 비활성화됩니다. 기존 Firebase 프로젝트와 데이터는 변경하지 않습니다.

`CNAME`, 호스팅케이알 DNS·네임서버·도메인은 이 변경에서 수정하지 않았습니다. 무료 호스팅 범위를 우선하며 문자 발송만 사용자가 선택한 유료 SMS 방식입니다.

공식 연락처는 **063-717-6433**입니다. 로고·영상·생성 이미지 및 운영 정보의 근거는 [콘텐츠 출처](docs/CONTENT-SOURCES.md)에 정리했습니다. 미확인 체험비나 상세 수업시간은 임의로 확정하지 않습니다.
