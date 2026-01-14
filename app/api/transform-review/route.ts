import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const TRANSFORM_PROMPT = `
아래 리뷰를 원문에 담긴 정보와 맥락은 유지하되,
같은 사람이 다시 쓴 글처럼 보이지 않도록
문맥, 이야기 순서, 말하는 방식 자체를 바꿔서 다시 작성해줘.
말투는 실제 사용자가 커뮤니티나 카톡에
생각나는 대로 쓴 후기 느낌이면 좋아.
맞춤법이나 문장 구조가 정확할 필요는 없고,
줄임말, 여/요 말투, ㅋㅋ·ㅎㅎ 같은 웃음 표현,
MZ 단어·신조어도 자연스럽게 섞어줘.
:경고: 중요한 조건
- 원문에 나온 사건이나 경험의 서술 순서를 그대로 따르지 말 것
 (중간 이야기부터 시작하거나, 기억나는 부분 위주로 풀어도 됨)
- 원문에서 눈에 띄는 표현이나 반복되는 말투는
 같은 의미라도 다른 방식으로 풀어 쓸 것
- 문단을 너무 깔끔하게 정리하지 말고,
 말하다가 생각 바뀐 것처럼 흐름이 살짝 튀어도 괜찮음
- 원문에 없는 정보는 새로 만들지 말 것
- 요약, 총평, 결론처럼 정리하는 문장은 추가하지 말 것
- 분량을 임의로 늘리거나 새로운 내용을 덧붙이지 말 것
법적 리스크 차단
 수치 없음
 결과 단정 없음
 전후 비교 없음
 외모 변화 없음
 "추천합니다 / 답입니다" 없음
이건 생각하지말고 원문에서 문맥만 수정하는 걸로 해줘
목표는  원문을 여러 번 본 사람도 읽으면서
아, 이 글이 그 글이구나 하고 바로 연결하기 어려운 후기 야. 문맥만 바꾸는 작업이야

[입력 리뷰]
{review}

[출력 형식]
변환된 리뷰만 출력하세요. 설명이나 부가 설명 없이 변환된 텍스트만 작성하세요.`;

interface TransformRequest {
  review: string;
}

interface TransformResponse {
  success: boolean;
  transformedText?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TransformResponse>> {
  try {
    const body: TransformRequest = await request.json();

    // 필수 파라미터 검증
    if (!body.review) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: review',
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

    // 문맥 변경 실행
    const { text } = await generateText({
      model: openai('gpt-5.1'),
      prompt: TRANSFORM_PROMPT.replace('{review}', body.review),
      maxOutputTokens: 4096,
    });

    return NextResponse.json({
      success: true,
      transformedText: text.trim(),
    });
  } catch (error) {
    console.error('Transform review error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
