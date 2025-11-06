/**
 * Payverse 서명 생성 테스트 스크립트
 *
 * 서명 생성 규칙:
 * - 형식: ||secretKey||mid||orderId||amount||reqDate||
 * - 해시 알고리즘: SHA-512
 *
 * 참고 문서:
 * https://docs.payverseglobal.com/ko/apisdk/v1.0.0/integration-pre-check/performing-encryption/
 */

import * as crypto from 'crypto';

/**
 * Payverse 서명 생성 함수
 *
 * @param secretKey - API 연동 시 필요한 Secret Key
 * @param mid - 상점 ID
 * @param orderId - 주문 ID
 * @param amount - 결제 금액
 * @param reqDate - 요청 일시 (YYYYMMDDHHmmss 형식)
 * @returns SHA-512 해시 값 (소문자 hex 문자열)
 */
export function generatePayverseSign(
  secretKey: string,
  mid: string,
  orderId: string,
  amount: string | number,
  reqDate: string,
): string {
  // 서명 생성 형식: ||secretKey||mid||orderId||amount||reqDate||
  const plainText = `||${secretKey}||${mid}||${orderId}||${amount}||${reqDate}||`;

  // SHA-512 해시 생성
  const hash = crypto.createHash('sha512').update(plainText, 'utf8').digest('hex');

  return hash;
}

/**
 * 테스트 함수
 */
function testGenerateSign() {
  console.log('🔐 Payverse 서명 생성 테스트 시작...\n');

  // 테스트 데이터 (k-doc 프로젝트의 실제 값 사용)
  const secretKey = 'tmdh40gi709a8526';
  const mid = '202505003M';
  const orderId = 'testOrderId';
  const amount = 100;
  const reqDate = '20241219000000';

  console.log('📋 입력 파라미터:');
  console.log(`  secretKey: ${secretKey}`);
  console.log(`  mid: ${mid}`);
  console.log(`  orderId: ${orderId}`);
  console.log(`  amount: ${amount}`);
  console.log(`  reqDate: ${reqDate}`);
  console.log('');

  // 서명 생성
  const sign = generatePayverseSign(secretKey, mid, orderId, amount, reqDate);

  console.log('📝 Plain Text:');
  console.log(`  ||${secretKey}||${mid}||${orderId}||${amount}||${reqDate}||`);
  console.log('');

  console.log('✅ 생성된 서명 (SHA-512):');
  console.log(`  ${sign}`);
  console.log('');

  // 추가 테스트 케이스
  console.log('🧪 추가 테스트 케이스:\n');

  const testCases = [
    {
      name: '예시 1: 문서의 PHP 예시',
      secretKey: '0123456789123456',
      mid: 't_KRW_Test',
      orderId: 'TEST_OrderID',
      amount: 100,
      reqDate: '20241018160512',
      expectedHash:
        'b56c0324ce84dfce6fffa2c3b2b83cc28e3d0111b2629b6be29eb541b7545947afd81f0aabe762fb06fcdb47101a58f5cc9462a9f15ba3383372d8006708bd0c',
    },
  ];

  testCases.forEach((testCase) => {
    const generatedSign = generatePayverseSign(
      testCase.secretKey,
      testCase.mid,
      testCase.orderId,
      testCase.amount,
      testCase.reqDate,
    );

    const plainText = `||${testCase.secretKey}||${testCase.mid}||${testCase.orderId}||${testCase.amount}||${testCase.reqDate}||`;

    console.log(`📌 ${testCase.name}:`);
    console.log(`  Plain Text: ${plainText}`);
    console.log(`  Generated:  ${generatedSign}`);
    console.log(`  Expected:   ${testCase.expectedHash}`);
    console.log(`  Match:      ${generatedSign === testCase.expectedHash ? '✅' : '❌'}`);
    console.log('');
  });

  console.log('🎉 테스트 완료!');
}

// 스크립트 실행
if (require.main === module) {
  testGenerateSign();
}
