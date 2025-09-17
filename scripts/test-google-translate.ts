/**
 * Google Translate API 테스트 스크립트
 * "안녕하세요"를 영어와 태국어로 번역하여 출력
 */

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBiNzG9ERTywmtzap6sQ0KjrD4FU5uQxzg';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

interface TranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

interface TranslateRequest {
  q: string;
  source: string;
  target: string;
}

/**
 * Google Translate API를 사용하여 텍스트를 번역하는 함수
 */
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  try {
    const requestBody: TranslateRequest = {
      q: text,
      source: sourceLang,
      target: targetLang,
    };

    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: TranslateResponse = await response.json();

    if (result.data.translations && result.data.translations.length > 0) {
      return result.data.translations[0].translatedText;
    } else {
      throw new Error('No translation found in response');
    }
  } catch (error) {
    console.error(`Translation error (${sourceLang} → ${targetLang}):`, error);
    throw error;
  }
}

/**
 * 메인 테스트 함수
 */
async function testGoogleTranslate() {
  try {
    console.log('🌐 Google Translate API 테스트 시작...');
    console.log('📝 원본 텍스트: "안녕하세요"');
    console.log('');

    // 영어로 번역
    console.log('🔄 한국어 → 영어 번역 중...');
    const englishTranslation = await translateText('안녕하세요', 'ko', 'en');
    console.log(`✅ 영어 번역: "${englishTranslation}"`);
    console.log('');

    // 태국어로 번역
    console.log('🔄 한국어 → 태국어 번역 중...');
    const thaiTranslation = await translateText('안녕하세요', 'ko', 'th');
    console.log(`✅ 태국어 번역: "${thaiTranslation}"`);
    console.log('');

    // 결과 요약
    console.log('📊 번역 결과 요약:');
    console.log(`  한국어: 안녕하세요`);
    console.log(`  영어: ${englishTranslation}`);
    console.log(`  태국어: ${thaiTranslation}`);
    console.log('');
    console.log('🎉 Google Translate API 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    throw error;
  }
}

// 스크립트 실행
if (require.main === module) {
  testGoogleTranslate()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { testGoogleTranslate, translateText };
