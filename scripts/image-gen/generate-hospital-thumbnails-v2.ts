/**
 * 병원 시술 썸네일 이미지 생성 스크립트 v2
 * Vercel AI Gateway + FLUX.2 Max
 * 5가지 완전히 다른 컨셉 / 인물 / 스타일 / 시술
 *
 * 사용법:
 * tsx --env-file .env scripts/image-gen/generate-hospital-thumbnails-v2.ts
 */

import { experimental_generateImage as generateImage } from 'ai';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = path.join(process.cwd(), 'output', 'hospital-thumbnails-v2');

interface Concept {
  id: string;
  desc: string;
  prompt: string;
  makeSvg: (w: number, h: number) => string;
}

const CONCEPTS: Concept[] = [
  // ──────────────────────────────────────────────────────────
  // 1. 파스텔 소프트 K-뷰티 — 쌍꺼풀 매몰법
  //    파스텔 라벤더/민트, 귀여운 스티커 요소, 하단 페이드
  // ──────────────────────────────────────────────────────────
  {
    id: '01-pastel-double-eyelid',
    desc: '파스텔 소프트 — 쌍꺼풀 매몰법',
    prompt: `
      Korean beauty clinic advertisement, K-beauty soft aesthetic,
      beautiful Korean woman early 20s, bright and fresh expression,
      tilting head slightly, touching her face gently with one finger near eye area,
      wide bright eyes with natural double eyelids, dewy glossy skin,
      soft pink blush cheeks, small nose, plump glossy lips,
      pale lavender to white gradient studio background, diffused soft light from above,
      wearing white or light pastel sleeveless top, hair softly framing face,
      youthful Korean beauty commercial photography,
      ultra-realistic, 8K, professional beauty editorial
    `.trim(),
    makeSvg: (w, h) => `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bottomFade1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F3E8FF" stop-opacity="0"/>
            <stop offset="52%" stop-color="#F3E8FF" stop-opacity="0.86"/>
            <stop offset="100%" stop-color="#EDE9FE" stop-opacity="0.98"/>
          </linearGradient>
        </defs>

        <!-- 하단 파스텔 페이드 -->
        <rect x="0" y="${h * 0.44}" width="${w}" height="${h * 0.56}" fill="url(#bottomFade1)"/>

        <!-- HOT 배지 -->
        <rect x="18" y="18" width="66" height="30" rx="8" fill="#F472B6"/>
        <text x="51" y="38" font-family="Arial Black, sans-serif" font-size="15" font-weight="900" fill="white" text-anchor="middle">HOT</text>

        <!-- 오른쪽 상단 스티커 태그 -->
        <rect x="${w - 132}" y="18" width="114" height="30" rx="15" fill="#A7F3D0" opacity="0.9"/>
        <text x="${w - 75}" y="38" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="12" font-weight="700" fill="#065F46" text-anchor="middle">눈매교정 전문</text>

        <!-- 소프트 텍스트 서브 -->
        <text x="22" y="${h * 0.65}" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#9333EA" letter-spacing="3">SOFT NATURAL</text>

        <!-- 메인 시술명 -->
        <text x="22" y="${h * 0.74}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.086)}" font-weight="900" fill="#1E1B4B">자연스러운</text>
        <text x="22" y="${h * 0.74 + Math.round(h * 0.094)}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.086)}" font-weight="900" fill="#7C3AED">쌍꺼풀</text>

        <!-- 가격 박스 -->
        <rect x="${w - 148}" y="${h * 0.77}" width="130" height="56" rx="12" fill="#EDE9FE"/>
        <text x="${w - 83}" y="${h * 0.77 + 21}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="11" fill="#7C3AED" text-anchor="middle" font-weight="600">VAT 포함</text>
        <text x="${w - 83}" y="${h * 0.77 + 47}" font-family="Arial Black, sans-serif" font-size="27" font-weight="900" fill="#7C3AED" text-anchor="middle">69만</text>
      </svg>
    `,
  },

  // ──────────────────────────────────────────────────────────
  // 2. 다크 럭셔리 골드 — 리쥬란힐러 피부재생
  //    블랙 배경, 황금 타이포그래피, 에디토리얼 하이엔드
  // ──────────────────────────────────────────────────────────
  {
    id: '02-dark-luxury-rejuran',
    desc: '다크 럭셔리 골드 — 리쥬란힐러',
    prompt: `
      High-end Korean plastic surgery clinic premium advertisement,
      sophisticated Korean woman early 30s, mature elegance, minimal satin makeup,
      strong direct gaze into camera, composed confident expression,
      Rembrandt-style dramatic side lighting from upper left,
      deep shadow on far side of face, warm hair rim light,
      very dark charcoal gradient to pure black background,
      flawless luminous skin showing fine pore detail,
      wearing off-shoulder black satin top or bare shoulder,
      premium luxury beauty editorial like La Mer or Sisley advertisement,
      ultra-realistic cinematic 8K, luxury brand photography
    `.trim(),
    makeSvg: (w, h) => `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#B8962E"/>
            <stop offset="50%" stop-color="#F5DEB3"/>
            <stop offset="100%" stop-color="#B8962E"/>
          </linearGradient>
          <linearGradient id="darkFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#080808" stop-opacity="0"/>
            <stop offset="45%" stop-color="#080808" stop-opacity="0.78"/>
            <stop offset="100%" stop-color="#050505" stop-opacity="0.97"/>
          </linearGradient>
        </defs>

        <!-- 다크 하단 오버레이 -->
        <rect x="0" y="${h * 0.38}" width="${w}" height="${h * 0.62}" fill="url(#darkFade)"/>

        <!-- 상단 왼쪽 골드 로고 텍스트 -->
        <text x="22" y="44" font-family="Georgia, Times New Roman, serif" font-size="14" font-style="italic" fill="#C9A84C" letter-spacing="2">RENOVA CLINIC</text>
        <rect x="22" y="50" width="110" height="1.2" fill="url(#goldLine)" opacity="0.6"/>

        <!-- 왼쪽 세로 골드 라인 -->
        <rect x="22" y="${h * 0.58}" width="2" height="${h * 0.29}" rx="1" fill="url(#goldLine)"/>

        <!-- 서브 영문 -->
        <text x="34" y="${h * 0.635}" font-family="Georgia, Times New Roman, serif" font-size="11" fill="#C9A84C" letter-spacing="4" font-style="italic">SKIN REJUVENATION</text>

        <!-- 메인 한국어 시술명 -->
        <text x="34" y="${h * 0.725}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.088)}" font-weight="900" fill="white" letter-spacing="-1.5">리쥬란힐러</text>
        <text x="34" y="${h * 0.725 + Math.round(h * 0.053)}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.046)}" font-weight="400" fill="#D4D4D4" letter-spacing="1">피부 속부터 근본 재생</text>

        <!-- 오른쪽 하단 가격 -->
        <text x="${w - 24}" y="${h * 0.865}" font-family="Arial Black, sans-serif" font-size="52" font-weight="900" fill="#C9A84C" text-anchor="end">188</text>
        <text x="${w - 24}" y="${h * 0.865 + 22}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="13" fill="#A89060" text-anchor="end">만원 · VAT 포함</text>
        <rect x="${w - 140}" y="${h * 0.865 + 28}" width="116" height="1.2" fill="url(#goldLine)" opacity="0.5"/>
      </svg>
    `,
  },

  // ──────────────────────────────────────────────────────────
  // 3. 비비드 팝 Gen-Z — 코필러 10분 시술
  //    코랄→핫핑크 그라디언트, 대각선 레이아웃, 굵은 타이포
  // ──────────────────────────────────────────────────────────
  {
    id: '03-vivid-pop-nose-filler',
    desc: '비비드 팝 Gen-Z — 코필러',
    prompt: `
      Vibrant K-pop idol concept beauty photo, Gen-Z energy aesthetic,
      Korean woman mid 20s, bold confident look, straight defined sculpted nose,
      glossy coral lips, striking graphic eye makeup with liner,
      playful confident expression, slightly tilted chin up, direct eye contact,
      vivid coral orange to hot pink gradient background, high saturation colors,
      subject positioned center to slightly right, energetic pose,
      wearing oversized colorful fashion top or streetwear,
      K-pop girl group concept card photo feel, clean pop art inspired,
      ultra-realistic 8K, vibrant fashion photography, crisp and sharp
    `.trim(),
    makeSvg: (w, h) => `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pinkGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FF5733"/>
            <stop offset="100%" stop-color="#FF1493"/>
          </linearGradient>
        </defs>

        <!-- 왼쪽 컬러 스트라이프 -->
        <rect x="0" y="0" width="10" height="${h}" fill="url(#pinkGrad)"/>

        <!-- NEW 배지 -->
        <rect x="20" y="18" width="82" height="30" rx="5" fill="#FF1493"/>
        <text x="61" y="38" font-family="Arial Black, sans-serif" font-size="14" font-weight="900" fill="white" text-anchor="middle" letter-spacing="1">NEW ✦</text>

        <!-- 오른쪽 상단 가격 프리뷰 -->
        <text x="${w - 22}" y="36" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="#FF5733" text-anchor="end">59만</text>
        <text x="${w - 22}" y="54" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="10" fill="#FF5733" text-anchor="end" font-weight="600">1cc 기준</text>

        <!-- 하단 대각선 블록 -->
        <polygon points="0,${h * 0.68} ${w * 0.68},${h * 0.68} ${w * 0.52},${h} 0,${h}" fill="#FF1493" opacity="0.94"/>

        <!-- 영문 서브 -->
        <text x="22" y="${h * 0.655}" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="#FF6EB4" letter-spacing="4">NOSE FILLER</text>

        <!-- 메인 한국어 -->
        <text x="22" y="${h * 0.76}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.09)}" font-weight="900" fill="white" letter-spacing="-1.5">코필러</text>
        <text x="22" y="${h * 0.76 + Math.round(h * 0.048)}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.042)}" font-weight="700" fill="#FFD1E8" letter-spacing="0">10분 코끝 라인 완성</text>

        <!-- 오른쪽 하단 큰 숫자 -->
        <text x="${w - 22}" y="${h - 28}" font-family="Arial Black, sans-serif" font-size="62" font-weight="900" fill="white" text-anchor="end" opacity="0.2">코</text>
      </svg>
    `,
  },

  // ──────────────────────────────────────────────────────────
  // 4. 클린 화이트 메디컬 — 울쎄라 HIFU 리프팅
  //    순백 배경, 블루 악센트, 전문 클리닉 느낌
  // ──────────────────────────────────────────────────────────
  {
    id: '04-clean-medical-ulthera',
    desc: '클린 화이트 — 울쎄라 HIFU 리프팅',
    prompt: `
      Professional Korean medical aesthetic clinic advertisement photo,
      clean minimal white background studio setup,
      Korean woman mid 30s, mature elegance, natural makeup, healthy glowing skin,
      composed professional expression with a subtle warm smile,
      looking slightly off-camera to the right, lifted chin posture,
      even soft studio lighting from front and slight top fill,
      no harsh shadows, bright and clean,
      wearing light blue or white button-up top, hair neatly arranged or half-up style,
      high-end medical clinic concept like Cinderella or JK Plastic Surgery,
      ultra-realistic 8K, crisp professional clinic photography
    `.trim(),
    makeSvg: (w, h) => `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="blueBtn" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0A84FF"/>
            <stop offset="100%" stop-color="#005FCC"/>
          </linearGradient>
          <linearGradient id="whiteFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="white" stop-opacity="0"/>
            <stop offset="55%" stop-color="white" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="white" stop-opacity="1.0"/>
          </linearGradient>
        </defs>

        <!-- 하단 화이트 페이드 -->
        <rect x="0" y="${h * 0.42}" width="${w}" height="${h * 0.58}" fill="url(#whiteFade)"/>

        <!-- 상단 블루 인증 배지 -->
        <rect x="18" y="18" width="130" height="30" rx="6" fill="url(#blueBtn)"/>
        <text x="83" y="37.5" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="12" font-weight="700" fill="white" text-anchor="middle" letter-spacing="0.5">의료기기 식약처 인증</text>

        <!-- 왼쪽 블루 세로 악센트 -->
        <rect x="22" y="${h * 0.62}" width="4" height="${h * 0.24}" rx="2" fill="url(#blueBtn)"/>

        <!-- 서브 영문 -->
        <text x="36" y="${h * 0.655}" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="#0A84FF" letter-spacing="3">ULTHERA HIFU</text>

        <!-- 메인 한국어 시술명 -->
        <text x="36" y="${h * 0.745}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.084)}" font-weight="900" fill="#0F172A" letter-spacing="-1">울쎄라</text>
        <text x="36" y="${h * 0.745 + Math.round(h * 0.092)}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.05)}" font-weight="600" fill="#334155" letter-spacing="-0.5">HIFU 리프팅 집중 케어</text>

        <!-- 오른쪽 가격 버튼 -->
        <rect x="${w - 150}" y="${h * 0.82}" width="132" height="56" rx="10" fill="url(#blueBtn)"/>
        <text x="${w - 84}" y="${h * 0.82 + 21}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="11" fill="rgba(255,255,255,0.8)" text-anchor="middle">VAT · 마취비 포함</text>
        <text x="${w - 84}" y="${h * 0.82 + 47}" font-family="Arial Black, sans-serif" font-size="26" font-weight="900" fill="white" text-anchor="middle">298만</text>
      </svg>
    `,
  },

  // ──────────────────────────────────────────────────────────
  // 5. 필름 빈티지 웜 — 눈밑지방 재배치
  //    따뜻한 앰버 크림, 필름 감성, 서프 폰트, 친밀감
  // ──────────────────────────────────────────────────────────
  {
    id: '05-film-vintage-undereye',
    desc: '필름 빈티지 웜 — 눈밑지방 재배치',
    prompt: `
      Vintage 35mm film photography style Korean beauty portrait,
      Korean woman late 20s, natural minimal look, warm inviting expression,
      genuine soft smile, slightly lifted chin, warm bright eyes looking at camera,
      rich warm golden honey-cream background with organic film grain texture,
      warm amber side lighting from right, gentle fill from left,
      Kodak Portra 400 film emulation, lifted shadows, warm peach skin tones,
      wearing warm beige or cream knit sweater or light linen,
      natural undone wavy hair, very light natural makeup no heavy filter,
      35mm analog photography intimate feel, soft focus edges,
      ultra-realistic 8K, nostalgic warm film photography
    `.trim(),
    makeSvg: (w, h) => `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="warmFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1C0E03" stop-opacity="0"/>
            <stop offset="48%" stop-color="#1C0E03" stop-opacity="0.72"/>
            <stop offset="100%" stop-color="#120900" stop-opacity="0.95"/>
          </linearGradient>
          <linearGradient id="amberLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#B8860B"/>
            <stop offset="50%" stop-color="#F0C040"/>
            <stop offset="100%" stop-color="#B8860B"/>
          </linearGradient>
        </defs>

        <!-- 웜 다크 하단 페이드 -->
        <rect x="0" y="${h * 0.43}" width="${w}" height="${h * 0.57}" fill="url(#warmFade)"/>

        <!-- 필름 스트립 장식 (상단) -->
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${14 + i * 38}" y="8" width="22" height="13" rx="3" fill="rgba(240,192,64,0.25)"/>`).join('\n        ')}

        <!-- 오른쪽 상단 필름 날짜 스탬프 -->
        <text x="${w - 18}" y="38" font-family="Courier New, monospace" font-size="11" fill="#D4A017" text-anchor="end" letter-spacing="1" opacity="0.8">2024:11:03</text>

        <!-- 왼쪽 앰버 세로 라인 -->
        <rect x="22" y="${h * 0.6}" width="2" height="${h * 0.27}" rx="1" fill="url(#amberLine)" opacity="0.7"/>

        <!-- 영문 서브 이탤릭 -->
        <text x="34" y="${h * 0.638}" font-family="Georgia, Times New Roman, serif" font-size="12" fill="#D4A017" letter-spacing="3" font-style="italic">Under Eye Care</text>
        <rect x="34" y="${h * 0.648}" width="100" height="1" fill="url(#amberLine)" opacity="0.5"/>

        <!-- 메인 한국어 텍스트 -->
        <text x="34" y="${h * 0.737}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.08)}" font-weight="900" fill="white" letter-spacing="-1.5">눈밑지방</text>
        <text x="34" y="${h * 0.737 + Math.round(h * 0.086)}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="${Math.round(h * 0.08)}" font-weight="900" fill="white" letter-spacing="-1.5">재배치</text>

        <!-- 오른쪽 하단 가격 앰버 -->
        <text x="${w - 22}" y="${h * 0.84}" font-family="Arial Black, sans-serif" font-size="50" font-weight="900" fill="#D4A017" text-anchor="end">128</text>
        <text x="${w - 22}" y="${h * 0.84 + 22}" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="13" fill="rgba(212,160,23,0.85)" text-anchor="end">만원 · VAT 포함</text>
        <rect x="${w - 150}" y="${h * 0.84 + 29}" width="128" height="1" fill="url(#amberLine)" opacity="0.4"/>

        <!-- 하단 클리닉 이름 -->
        <text x="${w / 2}" y="${h - 16}" font-family="Georgia, Times New Roman, serif" font-size="10" fill="rgba(212,160,23,0.45)" text-anchor="middle" letter-spacing="5">BELLE CLINIC</text>
      </svg>
    `,
  },
];

async function generateThumbnail(concept: Concept, index: number): Promise<void> {
  console.log(`\n[${index + 1}/${CONCEPTS.length}] ${concept.desc} 생성 중...`);

  const result = await generateImage({
    model: 'bfl/flux-2-max',
    prompt: concept.prompt,
    aspectRatio: '1:1',
  });

  if (!result.images?.length) throw new Error(`이미지 생성 실패: ${concept.id}`);

  const imgBuf = Buffer.from(result.images[0].base64, 'base64');

  const meta = await sharp(imgBuf).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;

  const svgBuf = Buffer.from(concept.makeSvg(w, h));

  const outputPath = path.join(OUTPUT_DIR, `${concept.id}.jpeg`);
  await sharp(imgBuf)
    .composite([{ input: svgBuf, top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(outputPath);

  console.log(`  ✓ 저장: ${path.basename(outputPath)} (${w}×${h})`);
}

async function main() {
  console.log('=== 병원 시술 썸네일 생성 v2 ===');
  console.log(`모델: bfl/flux-2-max | 총 ${CONCEPTS.length}장`);

  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error(
      'AI_GATEWAY_API_KEY 없음.\n실행: tsx --env-file .env scripts/image-gen/generate-hospital-thumbnails-v2.ts',
    );
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 모두 병렬 생성
  await Promise.all(CONCEPTS.map((c, i) => generateThumbnail(c, i)));

  console.log(`\n=== 완료! ${CONCEPTS.length}장 생성됨 ===`);
  console.log(`저장 위치: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('오류:', err.message);
  process.exit(1);
});
