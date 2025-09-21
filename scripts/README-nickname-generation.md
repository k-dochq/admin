# 닉네임 생성 스크립트

## 개요

모든 사용자 중에서 `nickName`이 없는 사용자들에게 자동으로 영어 닉네임을 생성하여 할당하는
스크립트입니다.

## 기능

- `nickName`이 `null`이거나 빈 문자열인 사용자들을 찾아서 처리
- 영어 기반의 다양한 템플릿으로 닉네임 생성 (PascalCase, 2자리 태그)
- 중복 검사 및 금칙어 필터링
- 사용자 ID를 시드로 사용하여 재현 가능한 닉네임 생성
- 동시성 문제 방지를 위한 이중 체크

## 사용법

### 1. 스크립트 실행

```bash
npm run generate:nicknames
```

### 2. 직접 실행

```bash
npx tsx scripts/generate-missing-nicknames.ts
```

## 닉네임 생성 규칙

### 템플릿 종류

- `adj_noun`: 형용사 + 명사 (예: BoldRiver, SwiftFox)
- `color_animal`: 색상 + 동물 (예: SilverOtter, GoldenEagle)
- `gerund_animal`: 동명사 + 동물 (예: RunningWolf, FlyingDolphin)
- `mythic_noun`: 신화적 + 명사 (예: AuroraPhoenix, ZephyrAtlas)
- `sci_token`: 과학적 + 토큰 (예: QuantumNova, StellarPulse)
- `noun_token`: 명사 + 토큰 (예: RiverHub, HarborForge)
- `double_adj_noun`: 형용사 + 형용사 + 명사 (예: BoldSwiftRiver)

### 스타일

- **PascalCase**: `BoldRiver_q7`
- **최대 길이**: 20자
- **태그**: 2자리 base36 (예: q7, 2f, x9)

### 예시 닉네임

- `SwiftFox_2f`
- `GoldenEagle_q7`
- `RunningWolf_x9`
- `AuroraPhoenix_3k`
- `QuantumNova_7m`

## 안전 기능

### 1. 중복 검사

- 생성된 닉네임이 이미 사용 중인지 데이터베이스에서 확인
- 중복 시 다른 닉네임으로 재시도 (최대 10회)

### 2. 금칙어 필터링

- 부적절한 단어나 시스템 예약어 제외
- Leet speak 변환 후 검사

### 3. 동시성 보호

- 처리 전에 다시 한번 닉네임 존재 여부 확인
- 이미 닉네임이 있는 사용자는 건너뛰기

### 4. 재현성

- 사용자 ID를 시드로 사용하여 같은 사용자는 항상 같은 닉네임 생성
- 시드 기반 난수 생성기 사용

## 출력 예시

```
🔍 닉네임이 없는 사용자들을 찾는 중...
📊 닉네임이 필요한 사용자 수: 15

👤 사용자 처리 중: user1@example.com (ID: 123e4567-e89b-12d3-a456-426614174000)
✅ 닉네임 생성 완료: SwiftFox_2f

👤 사용자 처리 중: user2@example.com (ID: 123e4567-e89b-12d3-a456-426614174001)
✅ 닉네임 생성 완료: GoldenEagle_q7

📈 처리 결과:
✅ 성공: 15명
❌ 실패: 0명

🎉 닉네임 생성 작업이 완료되었습니다!
```

## 주의사항

1. **백업**: 실행 전 데이터베이스 백업 권장
2. **테스트**: 소규모 데이터로 먼저 테스트
3. **권한**: 데이터베이스 쓰기 권한 필요
4. **중단**: Ctrl+C로 언제든 중단 가능

## 트러블슈팅

### 에러: "Prisma connection failed"

- 데이터베이스 연결 확인
- `.env` 파일의 `DATABASE_URL` 확인

### 에러: "Permission denied"

- 데이터베이스 사용자 권한 확인
- `public.User` 테이블의 `nickName` 컬럼 업데이트 권한 필요

### 에러: "Duplicate nickname"

- 매우 드문 경우, 스크립트가 자동으로 재시도
- 여전히 실패하면 다른 시드로 재실행
