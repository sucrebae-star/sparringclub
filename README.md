# 복싱사관학교 · 스파링클럽

복싱사관학교 공식 홈페이지와 기기별 UI를 추가하고, 기존 Firebase 스파링클럽을 보존했습니다. 상담예약은 [카카오 예약하기](https://booking.kakao.com/detail/ticket/752726)로 연결합니다. 방문자가 날짜와 시간을 고르면 담당자 확인 후 확정됩니다.

- `/` — 공식 홈페이지, 프로그램, 이용권·운영시간·방문 안내, 카카오 상담예약
- `/club.html` — 기존 회원·매칭·기록·체육관·커뮤니티·관리자 기능
- `/booking-admin.html` — 과거 자체 예약 구현의 관리자 화면. 현재 예약 운영에는 사용하지 않음
- 기존 `/#players`, `/#board`, `/?postId=...` 공유 주소와 설치형 앱은 클럽 화면으로 연결

## 실행 및 검증

Node.js 22.13 이상. 패키지 설치 없이 검사·빌드합니다.

```sh
npm test
npm run build
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

정적 배포에서도 카카오 상담예약 링크를 이용할 수 있습니다. 사이트는 개인정보를 직접 수집하지 않습니다.

```sh
npm run preview:fixtures
# http://127.0.0.1:4174/ — 외부 SMS 없음
# http://127.0.0.1:4174/club.html?qaRole=member
# qaRole=guest|member|manager|admin
```

QA 서버는 가상 회원 데이터로 Firebase를 대체하고 원격 쓰기를 차단합니다. 과거 자체 예약 API의 테스트 기반은 보존하지만 방문자 UI에서는 사용하지 않습니다.

## 운영 준비

[GitHub Pages 배포](docs/GITHUB-PAGES.md), [카카오 예약 운영](docs/KAKAO-BOOKING.md), [검증 결과](docs/VERIFICATION.md)를 참고하세요. 기존 Firebase 프로젝트와 데이터는 변경하지 않습니다. 자체 예약·SMS 구현은 [보존된 설계 문서](docs/BOOKING-SMS.md)에만 남아 있고 운영하지 않습니다.

`CNAME`, 호스팅케이알 DNS·네임서버·도메인은 이 변경에서 수정하지 않았습니다. 무료 호스팅 범위를 우선합니다. 카카오 예약 전환에 따라 유료 SMS 발송은 설정하지 않았습니다.

공식 연락처는 **063-717-6433**입니다. 로고·영상·생성 이미지 및 운영 정보의 근거는 [콘텐츠 출처](docs/CONTENT-SOURCES.md)에 정리했습니다. 미확인 체험비나 상세 수업시간은 임의로 확정하지 않습니다.
