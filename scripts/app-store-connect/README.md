# App Store Connect API 스크립트

App Store Connect API를 사용한 업무(앱 정보 조회 등) 스크립트 모음입니다.

## 설정

- **키 파일**: `keys/AuthKey_58PL82U37A.p8` (이 폴더의 `keys/` 아래에 두세요. `.gitignore`로 커밋 제외됨)
- **Key ID / Issuer ID**: 스크립트에 하드코딩 (`list-apps.ts` 상단)

## 실행

**앱 목록 조회**

```bash
npx tsx scripts/app-store-connect/list-apps.ts
```

JWT로 인증한 뒤 팀에 등록된 앱 목록(id, name, bundleId, sku, primaryLocale)을 출력합니다.

**메타데이터 기준표 검증**

```bash
npx tsx scripts/app-store-connect/verify-metadata.ts
```

팀의 첫 번째 앱, iOS 버전(READY_FOR_SALE 우선)의 로컬라이제이션(제목·서브타이틀·소개문구)을 API로 조회한 뒤 **`lib/app-store-connect/baseline.ts`**에 정의한 기준표와 비교합니다. 불일치 시 기대값/실제값을 출력하고 exit code 1로 종료합니다. (기준표는 admin 앱정보 페이지와 스크립트가 동일한 파일을 참조합니다.)

## 401 NOT_AUTHORIZED 가 나올 때

다음을 확인하세요.

1. **API 접근 승인**: App Store Connect → Users and Access → Integrations → App Store Connect API에서 Account Holder가 "Request Access" 후 승인받았는지
2. **Issuer ID**: 같은 Integrations 페이지 **상단**에 나오는 Issuer ID(UUID)가 스크립트의 `ISSUER_ID`와 일치하는지
3. **Key ID**: API 키 생성 시 표시된 Key ID(예: 58PL82U37A)가 스크립트의 `KEY_ID`와 일치하는지
4. **키 상태**: 해당 API 키가 Revoke 되지 않았는지 (Revoked면 새 키 생성 후 .p8 교체)
5. **.p8 파일**: `keys/AuthKey_58PL82U37A.p8`이 키 생성 시 다운로드한 원본 그대로인지 (이름/경로는 상관없으나 내용이 동일해야 함)
