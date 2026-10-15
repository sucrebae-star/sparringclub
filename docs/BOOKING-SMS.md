# 자체 예약과 휴대폰 문자 알림

## 구현된 흐름

1. 홈페이지에서 관심 프로그램, 이름(키즈는 보호자), 휴대폰, 희망 방문일·시간대, 개인정보 수집 동의를 입력합니다.
2. 서버에서 날짜·운영 시간대·입력값·동의를 검증하고 D1에 **예약 요청**을 저장합니다. 다음날부터 60일 이내 평일을 받습니다. 프로그램별 확정 수업시간이 아니므로 희망 시간대를 받습니다.
3. 저장 후에만 접수번호를 보여줍니다. 희망 일정 접수이며 자동으로 예약이 확정되지는 않습니다.
4. 관장님이 지정한 휴대폰으로 SOLAPI SMS를 발송합니다. 짧은 문자에는 접수번호·프로그램 코드·희망 일정만 포함합니다. 방문자 이름·휴대폰은 문자에 넣지 않습니다.
5. `/booking-admin.html`에서 비밀키로 인증해 예약 내역과 문자 접수 상태를 확인하고, 전화 안내 후 확정·취소합니다. 방문자에게 확정 문자를 자동으로 보내는 기능은 포함하지 않습니다.

문자 예시:

```text
[복싱사관학교] 새 예약
10-16 18-22 BOXING
BA-261016-ABCDEF
```

문자 접수 성공은 SOLAPI의 접수 결과입니다. 휴대폰의 실제 수신 보장은 아니며, 전달 결과는 SOLAPI 발송 내역에서 확인합니다. 발송 오류가 나더라도 저장한 예약은 남고 관리 화면에 오류가 표시됩니다. 중복 재시도는 같은 접수번호를 반환하며 문자를 재발송하지 않습니다. 자동 SMS 재시도는 없습니다.

## 활성화에 필요한 설정

Cloudflare 계정 연결이 현재 로그아웃 상태여서 아직 배포하거나 실제 문자를 보내지 않았습니다. SOLAPI 계정·인증키·등록 발신번호·수신 휴대폰 번호도 아직 제공되지 않았습니다. 비밀키는 채팅·GitHub·공개 브라우저 코드에 넣지 않고 Cloudflare의 암호화 환경 변수에 설정합니다.

1. Pages를 GitHub 저장소에 연결하고 `npm run build` / `dist`로 배포합니다. 저장소 루트의 `functions/`가 예약 API로 함께 배포됩니다. 운영 예약용 D1을 만들고 `migrations/0001_bookings.sql`을 적용합니다. 기존 Firebase에는 적용하지 않습니다.
2. Pages에 D1 바인딩 `BOOKING_DB`를 연결합니다. Preview와 Production은 별도 D1·설정으로 분리합니다. Preview의 문자 전송은 비활성화하고 먼저 검증합니다.
3. SOLAPI에서 SMS 발송 계정과 인증키를 준비하고, 사용할 발신번호를 등록합니다. 발신번호는 관장님이 실제 소유·사용하는 번호로 등록해야 합니다. 공식 상담 번호 `063-717-6433`을 휴대폰 수신번호로 임의 사용하지 않습니다.
4. 아래 환경 변수와 비밀키를 설정합니다.
5. `workers/booking-cleanup.js`를 별도 Worker로 배포하고 **같은 D1**을 `BOOKING_DB`로 연결해 매시간 예약 보관기간 정리를 실행합니다. `workers/wrangler.toml.example`은 DB ID를 입력하기 전 배포할 수 없는 예시입니다. 정리가 정상 실행되는 것을 확인합니다.
6. 접근이 제한된 테스트 배포에서 `BOOKING_RETENTION_READY=true`, `BOOKING_ENABLED=true`로 설정한 뒤 비밀키 관리 화면 인증, 테스트 예약 저장·조회·확정·취소, 지정 휴대폰의 실제 SMS 수신까지 확인합니다. 이 수신 검사는 유료 1건 발송입니다. 확인이 끝난 후 운영 배포에도 두 값을 적용합니다. 공개 Preview에는 활성화하지 않습니다.

| 이름 | 설정 위치 / 목적 |
| --- | --- |
| `BOOKING_DB` | Pages 및 정리 Worker의 D1 바인딩 |
| `BOOKING_RATE_SECRET` | Pages 비밀키. 무작위 32자 이상, IP 기반 남용 방지용 HMAC |
| `BOOKING_ADMIN_SECRET` | Pages 비밀키. 무작위 32자 이상, 관리자 인증용. 일반 비밀번호로 짧게 설정하지 않음 |
| `SOLAPI_API_KEY` | Pages 비밀키 |
| `SOLAPI_API_SECRET` | Pages 비밀키 |
| `SMS_FROM` | SOLAPI에 등록한 발신번호, 숫자만 |
| `SMS_TO` | 관장님 알림 수신 휴대폰 번호, 숫자만 |
| `BOOKING_RETENTION_READY` | 정리 Worker 검증 후 `true` |
| `BOOKING_ENABLED` | 위 항목과 실제 수신 검증 후 `true` |

설정이 빠지면 신청 버튼을 비활성화하고 실제 전화 문의를 안내합니다. SMS 서비스 호출은 저장된 요청당 1회입니다. 사이트 호스팅은 Cloudflare 무료 플랜 범위로 시작하되, 사용량 한도를 확인해야 합니다. SMS 비용·충전·발신번호 등록은 SOLAPI 별도 계약·정책을 따릅니다. 이 작업에서 유료 플랜 가입·잔액 충전·실제 발송은 실행하지 않았습니다.

## 데이터 관리

- 예약 데이터는 기존 Firebase 회원 데이터와 분리한 D1에 저장합니다. 개인 연락처를 로그·URL·GitHub·SMS 본문에 넣지 않습니다.
- 신규 예약 접수 시와 정리 Worker 스케줄에서 30일이 지난 예약 및 만료된 남용 방지 키를 삭제합니다. 관리 화면은 최근 30일, 최대 100건을 표시합니다.
- 관리자 키는 메모리에만 보관하며 새로고침·잠금 시 다시 입력합니다. 관리자 응답과 예약 API는 캐시하지 않습니다. PWA 오프라인 캐시에도 포함하지 않습니다.
- 출처 검사, 서버 검증, 중복 요청 방지, HMAC 기반 15분당 5회 제한 및 숨김 필드를 포함합니다. 봇 유입이 늘면 Turnstile 등 추가 보호를 검토합니다.
- 대규모 예약 운영에는 관리자 계정 인증, 검색·페이지 구분, 문자 재시도·전달 결과 웹훅을 후속으로 추가할 수 있습니다.

## 공식 문서

- [Cloudflare Pages Functions 바인딩](https://developers.cloudflare.com/pages/functions/bindings/)
- [D1 준비된 쿼리](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)
- [SOLAPI 인증](https://solapi.com/developers/api/authentication-api-key)
- [SOLAPI 메시지 발송](https://solapi.com/developers/api/messages)
- [SOLAPI 요금](https://solapi.com/pricing)
