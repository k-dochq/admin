import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const TRANSLATION_PROMPT = `당신은 전문 번역가입니다. 주어진 텍스트를 {targetLanguage}로 자연스럽게 번역하세요.

[번역 규칙]
1. 원문의 뉘앙스와 감정을 최대한 유지
2. 해당 언어권의 자연스러운 표현 사용
3. 구어체와 신조어는 해당 언어권의 유사한 표현으로 변환
4. 문화적 맥락을 고려한 번역
5. ㅋㅋ, ㅎㅎ, ㅠㅠ, ㅜㅜ 등 한국어에서만 사용하는 웃음·감정 표현은 제외할 것. 단, ^^ 와 같은 기호 기반의 눈웃음 표현은 필요할 경우 사용해도 됨.
6. 한국어가 완전히 빠지도록 모든 한국어 제거 완료해서 번역해줘

[입력 텍스트]
{text}

[출력 형식]
번역된 텍스트만 출력하세요. 설명이나 부가 설명 없이 번역된 텍스트만 작성하세요.`;

interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

interface TranslateResponse {
  success: boolean;
  translatedText?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TranslateResponse>> {
  try {
    const body: TranslateRequest = await request.json();

    // 필수 파라미터 검증
    if (!body.text || !body.targetLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: text, targetLanguage',
        },
        { status: 400 },
      );
    }

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API key is not configured',
        },
        { status: 500 },
      );
    }

    // OpenAI provider 생성
    const openai = createOpenAI({
      apiKey: apiKey,
    });

    // 번역 실행
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: TRANSLATION_PROMPT.replace('{targetLanguage}', body.targetLanguage).replace(
        '{text}',
        body.text,
      ),
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    return NextResponse.json({
      success: true,
      translatedText: text.trim(),
    });
  } catch (error) {
    console.error('Translate review error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
