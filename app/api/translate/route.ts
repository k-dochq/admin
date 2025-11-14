import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyAfGGGFNp2oHTnwRl_QTNnmnbRF43EnZKs';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

interface TranslateRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

interface TranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

interface ApiResponse {
  success: boolean;
  translatedText?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();

    // 필수 파라미터 검증
    if (!body.text || !body.sourceLang || !body.targetLang) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: text, sourceLang, targetLang',
        },
        { status: 400 },
      );
    }

    // Google Translate API 호출
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: body.text,
        source: body.sourceLang,
        target: body.targetLang,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Google Translate API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Translation failed: ${response.statusText}`,
        },
        { status: response.status >= 500 ? 500 : 400 },
      );
    }

    const result: TranslateResponse = await response.json();

    if (result.data.translations && result.data.translations.length > 0) {
      return NextResponse.json({
        success: true,
        translatedText: result.data.translations[0].translatedText,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'No translation found in response',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Translation API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
