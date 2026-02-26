/**
 * WhatsApp 랜딩페이지 이미지 생성 스크립트
 * Vercel AI SDK + FLUX.2 Max
 *
 * 생성 이미지 (총 7장, 모두 16:9):
 *   hero          — K뷰티 에디토리얼 히어로 배너
 *   carousel-eyes — 눈 성형 슬라이드
 *   carousel-nose — 코 성형 슬라이드
 *   carousel-vline — 윤곽 성형 슬라이드
 *   carousel-skin — 피부 시술 슬라이드
 *   carousel-lifting — 리프팅 슬라이드
 *   testimonial   — 상담 후 만족 트러스트 이미지
 *
 * 사용법:
 *   tsx --env-file .env scripts/image-gen/generate-whatsapp-landing.ts
 */

import { experimental_generateImage as generateImage } from 'ai';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = path.join(process.cwd(), 'output', 'whatsapp-landing');
const KDOC_DIR   = path.join(process.cwd(), '..', 'k-doc', 'public', 'images', 'event', 'whatsapp-quote');

// ─────────────────────────────────────────────────────────────────────────────
// SVG overlay helper — carousel slides
// ─────────────────────────────────────────────────────────────────────────────

interface CarouselOverlay {
  badge: string;
  badgeColor: string;
  accentColor: string;
  englishLabel: string;
  koreanTitle: string;
  tags: string;
  darkColor: string;
}

function makeCarouselSvg(w: number, h: number, o: CarouselOverlay): string {
  const titleSize  = Math.round(h * 0.2);
  const tagsSize   = Math.round(h * 0.082);
  const labelY     = h * 0.64;
  const titleY     = h * 0.78;
  const tagsY      = titleY + titleSize * 0.78;

  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${o.darkColor}" stop-opacity="0"/>
      <stop offset="42%"  stop-color="${o.darkColor}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${o.darkColor}" stop-opacity="0.92"/>
    </linearGradient>
  </defs>

  <!-- bottom dark fade -->
  <rect x="0" y="${h * 0.3}" width="${w}" height="${h * 0.7}" fill="url(#g)"/>

  <!-- badge -->
  <rect x="18" y="18" width="64" height="30" rx="8" fill="${o.badgeColor}"/>
  <text x="50" y="38.5"
    font-family="Arial Black, sans-serif"
    font-size="14" font-weight="900" fill="white" text-anchor="middle">
    ${o.badge}
  </text>

  <!-- english label -->
  <text x="24" y="${labelY}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${Math.round(h * 0.055)}" font-weight="700"
    fill="${o.accentColor}" letter-spacing="3.5">
    ${o.englishLabel}
  </text>

  <!-- korean title -->
  <text x="24" y="${titleY}"
    font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif"
    font-size="${titleSize}" font-weight="900"
    fill="white" letter-spacing="-2">
    ${o.koreanTitle}
  </text>

  <!-- tags -->
  <text x="24" y="${tagsY}"
    font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif"
    font-size="${tagsSize}" font-weight="400"
    fill="rgba(255,255,255,0.65)">
    ${o.tags}
  </text>
</svg>`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Concepts
// ─────────────────────────────────────────────────────────────────────────────

interface Concept {
  id: string;
  desc: string;
  prompt: string;
  overlay?: CarouselOverlay;
}

const CONCEPTS: Concept[] = [

  // ── 히어로 배너 ──────────────────────────────────────────────────────────
  {
    id: 'hero',
    desc: '히어로 배너 — K뷰티 에디토리얼',
    prompt: `
      Premium Korean medical beauty clinic hero banner,
      strikingly beautiful Korean woman mid-20s, perfect flawless glass skin,
      elegant natural makeup with soft dewy finish,
      warm confident smile looking directly into camera,
      upper body portrait, face centered with slight upward tilt,
      dreamy soft purple-lavender gradient studio background fading to near-white,
      wearing elegant white or pale cream draped top, bare shoulder,
      hair loosely swept with gentle wave framing face,
      soft wrap-around studio lighting, no harsh shadows,
      premium K-beauty luxury advertisement feel,
      ultra-realistic cinematic 8K, beauty editorial photography
    `.trim(),
  },

  // ── 캐러셀 1: 눈 성형 ─────────────────────────────────────────────────
  {
    id: 'carousel-eyes',
    desc: '캐러셀 1 — 눈 성형',
    prompt: `
      Korean beauty clinic eye surgery advertisement,
      beautiful Korean woman early-20s, wide luminous eyes as absolute focal point,
      perfect natural double eyelids, long lashes, bright clear whites,
      gentle hand touching cheek near eye area, playful expression,
      soft lavender to pale violet gradient background,
      dewy glowing porcelain skin, peachy coral lips,
      youthful fresh K-beauty magazine editorial,
      ultra-realistic 8K, dreamy soft-focus portrait photography
    `.trim(),
    overlay: {
      badge: 'BEST', badgeColor: '#6C5CE7', accentColor: '#C4B5FD',
      englishLabel: 'EYE SURGERY', koreanTitle: '눈 성형',
      tags: '쌍꺼풀 · 눈매교정 · 앞트임', darkColor: '#150829',
    },
  },

  // ── 캐러셀 2: 코 성형 ─────────────────────────────────────────────────
  {
    id: 'carousel-nose',
    desc: '캐러셀 2 — 코 성형',
    prompt: `
      Korean beauty clinic rhinoplasty advertisement,
      elegant Korean woman mid-20s, refined sculpted nose as the focal feature,
      face in three-quarter profile view, nose bridge and tip clearly visible,
      cool pearl-white to warm ivory gradient background,
      flawless porcelain skin with subtle nose-bridge highlight,
      hair elegantly swept up to reveal full face,
      wearing minimal white silk top, small pearl earring,
      quiet luxury editorial aesthetics,
      ultra-realistic 8K, high-end beauty photography
    `.trim(),
    overlay: {
      badge: 'HOT', badgeColor: '#F59E0B', accentColor: '#FDE68A',
      englishLabel: 'RHINOPLASTY', koreanTitle: '코 성형',
      tags: '코끝 · 콧대 · 코축소', darkColor: '#1C1209',
    },
  },

  // ── 캐러셀 3: 윤곽 성형 ───────────────────────────────────────────────
  {
    id: 'carousel-vline',
    desc: '캐러셀 3 — 윤곽·V라인',
    prompt: `
      Korean beauty clinic facial contouring advertisement,
      Korean woman late-20s, strikingly sharp V-line jawline as focal point,
      face angled 3/4 downward showing perfect slender defined chin and jaw,
      blush rose to soft peach warm gradient studio background,
      sculpted high cheekbones, slender neck, flawless smooth skin,
      hair pulled back in a sleek bun revealing full face,
      silver minimal earring, elegant summer outfit,
      fashion editorial meets medical aesthetics,
      ultra-realistic 8K, premium beauty campaign photography
    `.trim(),
    overlay: {
      badge: 'NEW', badgeColor: '#EC4899', accentColor: '#FBCFE8',
      englishLabel: 'FACIAL CONTOURING', koreanTitle: '윤곽 성형',
      tags: '사각턱 · 광대 · V라인', darkColor: '#1A060F',
    },
  },

  // ── 캐러셀 4: 피부 시술 ───────────────────────────────────────────────
  {
    id: 'carousel-skin',
    desc: '캐러셀 4 — 피부 시술',
    prompt: `
      Korean beauty clinic skin treatment advertisement,
      Korean woman mid-20s, extraordinary glass skin as absolute focal point,
      extreme close-up portrait filling frame, skin luminosity is everything,
      impossibly smooth pore-less dewy translucent skin with natural glow,
      eyes gently closed, serene blissful expression, parted lips with gloss,
      soft mint-green to pure white gradient background,
      fresh botanicals or water droplet near face suggesting hydration,
      skin care luxury brand like La Mer or SK-II advertisement feel,
      ultra-realistic 8K, extreme skin texture detail photography
    `.trim(),
    overlay: {
      badge: 'HOT', badgeColor: '#10B981', accentColor: '#6EE7B7',
      englishLabel: 'SKIN TREATMENT', koreanTitle: '피부 시술',
      tags: '레이저 · 보톡스 · 필러', darkColor: '#02150A',
    },
  },

  // ── 캐러셀 5: 리프팅 ──────────────────────────────────────────────────
  {
    id: 'carousel-lifting',
    desc: '캐러셀 5 — 리프팅',
    prompt: `
      Korean beauty clinic lifting procedure advertisement,
      Korean woman early-30s, mature beauty yet strikingly youthful appearance,
      lifted contoured face, high defined cheekbones, no sagging, radiant skin,
      three-quarter portrait showing lifted jawline and elevated cheek structure,
      deep midnight blue to rich navy gradient background,
      confident composed expression, direct intense gaze,
      wearing elegant navy off-shoulder or strapless, small diamond earring,
      Dior or Chanel beauty campaign photography aesthetic,
      ultra-realistic cinematic 8K, luxury high-fashion beauty editorial
    `.trim(),
    overlay: {
      badge: 'BEST', badgeColor: '#3B82F6', accentColor: '#BFDBFE',
      englishLabel: 'LIFTING', koreanTitle: '리프팅',
      tags: '실리프팅 · 울쎄라 · 쁘띠', darkColor: '#020817',
    },
  },

  // ── 상담 트러스트 이미지 ───────────────────────────────────────────────
  {
    id: 'testimonial',
    desc: '상담 트러스트 — WhatsApp 견적 수령',
    prompt: `
      Korean woman late-20s looking at smartphone with bright joyful satisfied smile,
      just received exciting good news on phone, natural spontaneous reaction,
      holding phone at chest height, face lit by warm screen glow,
      warm cozy indoor setting, soft café or living room bokeh background,
      wearing casual chic outfit, natural makeup, hair loosely down,
      genuine emotion conveying delight and relief after receiving quote,
      warm golden hour side lighting, soft shadows, cinematic depth of field,
      ultra-realistic 8K, lifestyle photography authentic moment
    `.trim(),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Generate
// ─────────────────────────────────────────────────────────────────────────────

async function generate(concept: Concept, index: number): Promise<void> {
  console.log(`\n[${index + 1}/${CONCEPTS.length}] ${concept.desc} 생성 중...`);

  const result = await generateImage({
    model: 'bfl/flux-2-max',
    prompt: concept.prompt,
    aspectRatio: '16:9',
  });

  if (!result.images?.length) throw new Error(`이미지 생성 실패: ${concept.id}`);

  const imgBuf = Buffer.from(result.images[0].base64, 'base64');
  const outputPath = path.join(OUTPUT_DIR, `${concept.id}.jpeg`);

  if (concept.overlay) {
    // carousel — composite SVG text overlay
    const meta = await sharp(imgBuf).metadata();
    const w = meta.width  ?? 1344;
    const h = meta.height ?? 756;
    const svgBuf = Buffer.from(makeCarouselSvg(w, h, concept.overlay));

    await sharp(imgBuf)
      .composite([{ input: svgBuf, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toFile(outputPath);
  } else {
    // hero / testimonial — clean photo, no overlay
    await sharp(imgBuf)
      .jpeg({ quality: 92 })
      .toFile(outputPath);
  }

  console.log(`  ✓ 저장: ${path.basename(outputPath)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy to k-doc public
// ─────────────────────────────────────────────────────────────────────────────

function copyToKdoc(): void {
  fs.mkdirSync(KDOC_DIR, { recursive: true });
  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.jpeg'));
  for (const file of files) {
    fs.copyFileSync(
      path.join(OUTPUT_DIR, file),
      path.join(KDOC_DIR, file),
    );
    console.log(`  → 복사: k-doc/public/images/event/whatsapp-quote/${file}`);
  }
  console.log(`\n총 ${files.length}장 → k-doc 이동 완료`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== WhatsApp 랜딩 이미지 생성 ===');
  console.log(`모델: bfl/flux-2-max | 총 ${CONCEPTS.length}장 (16:9)`);

  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error(
      'AI_GATEWAY_API_KEY 없음.\n실행: tsx --env-file .env scripts/image-gen/generate-whatsapp-landing.ts',
    );
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 순차 생성 (API rate limit 대응)
  for (let i = 0; i < CONCEPTS.length; i++) {
    await generate(CONCEPTS[i], i);
  }

  console.log(`\n=== 생성 완료 (${CONCEPTS.length}장) ===`);
  console.log(`저장 위치: ${OUTPUT_DIR}`);

  console.log('\n=== k-doc 이미지 폴더로 복사 중... ===');
  copyToKdoc();
}

main().catch((err) => {
  console.error('오류:', err.message);
  process.exit(1);
});
