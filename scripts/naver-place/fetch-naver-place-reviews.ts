/**
 * 네이버 플레이스(지도) 방문자 리뷰 크롤링 → DB 형식 엑셀 출력
 *
 * - POST https://pcmap-api.place.naver.com/graphql (getVisitorReviews) 호출
 * - 커서 페이지네이션으로 전체 리뷰 수집 후 우리 Review/ReviewImage 구조에 맞게 매핑
 * - 엑셀 2시트: Reviews, ReviewImages (이미지는 URL만 기록)
 *
 * 쿠키: 지정하지 않으면 기본 쿠키 사용. 만료 시 NAVER_PLACE_COOKIES 또는 --cookie-file 로 새 쿠키 지정.
 *
 * 실행 예:
 *   npx tsx scripts/naver-place/fetch-naver-place-reviews.ts --business-id=1107984486
 *   npx tsx scripts/naver-place/fetch-naver-place-reviews.ts --business-id=1107984486 --out=./reviews.xlsx --max-reviews=100
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const API_URL = 'https://pcmap-api.place.naver.com/graphql';
const PAGE_SIZE = 20;

/** 기본 쿠키 (curl 참고). 만료 시 브라우저에서 복사해 env 또는 --cookie-file 로 덮어쓰기. */
const DEFAULT_COOKIES =
  'NAC=e88IDYhkXeXBB; NNB=ACZYVTM7HOMGQ; _tt_enable_cookie=1; _ttp=01K3BSR5S36KH1RYHX71SCB77Z_.tt.1; ttcsid=1755963987748::BlxlY6HFzKOWnYQHghGT.1.1755963987748; ttcsid_D1D6BRRC77UA06S85GP0=1755963987748::gzj0eejtcUnODrHuaqsp.1.1755963987953; NID_AUT=ueTr6VtuzAEgJv3rJ07X3/LfthH9hE3h0WaXIbTAlsCelzSSPbcZGfdHiDZM8ZhQ; tooltipDisplayed=true; ba.uuid=1d8e98df-e223-45ee-aed3-ce89f6882a38; _ga=GA1.1.1871114764.1758861742; _fbp=fb.1.1764837914846.969394738486800110; cto_bundle=GTdtG19XSUI5MUJyblE3QnFuSXY1WnglMkZGdXBRT3Rwekt1THM0R2tpN3dMWHdESTNpYVVzTTA4eHBzd3k2WTVmQVJBQnh4Y1ExZVAlMkJFWGVrVTY0QWxWYUNoeVVGakVuRGNsTkV2TjNmYnluOFpjYml0SWpHYURYSUJsVUU4NmdGajE1d2UlMkZMR2lhTXhzcE5QeW1xQjJ0c2JBTFhMSDR5azVvbTI2b1ZFcWNRejJ1cnV2bHNkZWRIcjZMREhqNkJVd2F0UjU; _ga_SQ24F7Q7YW=GS2.1.s1769671375$o3$g0$t1769671378$j57$l0$h0; _ga_K2ECMCJBFQ=GS2.1.s1769671375$o3$g0$t1769671378$j57$l0$h0; NID_SES=AAABqIFHW/4M7WoyOcYoo5vasiEJcitQltaVin/54+M84qNgMxaqrq9oq2ELeno+gI8leFV0zx98QkXfFJBp5VEnr6vJ4szqvhJSOHYm1Dm/RTLyZjQrqZ0cPahACT4YVOvdgJLrBuVs2y99IMiVhyYgboOH7EG+IhMlgmDlMIRd+DabGON6/Q6Vlw8BRCjtj3OGka9m+Bl00ZI22jUGImHQLsG4IJqX0b/lZgipQyYwJb1D41a0hDxP3DjvDVJEmfioxvxwscUVKbUivAESTmcr0lBy3+Shyb3//3Ff00XlVu8wdv95laDU5TfaBTm5MUw4pHQWi2vOMi66+MmAlKEDrjGVcaUhbYs8ZCoqgPmIc+ZgNwuWHlgYHLprw2nGDW9CO8OCKB58O2Z5RpyOTeduGnUEQgRHsdgmNexVSaPM//jSpq4KqRttzWh5dt2YCgTzGcleBlpVQIlM17XzJouhzgVotZs+fHV0w/20t1Rn/69jlIRlzBUcTvoqy0em8PHQuCEpLyEcUkNKIDQHM5SVAxDtatbghBxeow0zS3pSNITrLTz22nJQcUVdrFr3SGq4vg==; PLACE_LANGUAGE=ko; SRT30=1771812870; SRT5=1771812870; BUC=-JB76rybIPoOyEhii_X38e-wCQ9uj59KJWzuZnUs0Yc=';

type CliOptions = {
  businessId: string;
  outputPath: string;
  cookieFile: string | null;
  maxReviews: number | null;
  hospitalId: string;
  medicalSpecialtyId: string;
};

type NaverReviewItem = {
  id?: string;
  cursor?: string;
  rating?: number;
  body?: string;
  created?: string;
  thumbnail?: string;
  media?: Array<{
    type?: string;
    thumbnail?: string;
    videoUrl?: string;
  }>;
};

type VisitorReviewsResponse = {
  data?: {
    visitorReviews?: {
      items?: NaverReviewItem[];
      total?: number;
    };
  };
  errors?: unknown[];
};

type MappedReview = {
  hospitalId: string;
  medicalSpecialtyId: string;
  userId: string;
  rating: number;
  title_ko_KR: string;
  content_ko_KR: string;
  isRecommended: boolean;
  createdAt: string;
  concerns: string;
  imageUrls: string;
};

type MappedReviewImage = {
  reviewRowIndex: number;
  order: number;
  imageType: string;
  imageUrl: string;
};

const GET_VISITOR_REVIEWS_QUERY = `query getVisitorReviews($input: VisitorReviewsInput) {
  visitorReviews(input: $input) {
    items {
      id
      cursor
      rating
      body
      created
      thumbnail
      media {
        type
        thumbnail
        videoUrl
      }
    }
    total
  }
}`;

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatTimestampForFileName(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  let businessId = '';
  let outputPath = '';
  let cookieFile: string | null = null;
  let maxReviews: number | null = null;
  let hospitalId = '';
  let medicalSpecialtyId = '';

  function takeArg(argName: string, next: string | undefined): string | null {
    if (next !== undefined && next !== null && !next.startsWith('--')) return next;
    return null;
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    const eq = arg.indexOf('=');
    const argName = eq >= 0 ? arg.slice(0, eq) : arg;
    const argValue = eq >= 0 ? arg.slice(eq + 1) : takeArg(arg, next);

    if ((argName === '--business-id' || argName === '-b') && argValue) {
      businessId = argValue.trim();
      if (eq < 0) i += 1;
      continue;
    }

    if (argName === '--out' && argValue) {
      outputPath = path.resolve(process.cwd(), argValue);
      if (eq < 0) i += 1;
      continue;
    }

    if (argName === '--cookie-file' && argValue) {
      cookieFile = path.resolve(process.cwd(), argValue);
      if (eq < 0) i += 1;
      continue;
    }

    if (argName === '--max-reviews' && argValue) {
      const parsed = parsePositiveInt(argValue);
      if (parsed) maxReviews = parsed;
      if (eq < 0) i += 1;
      continue;
    }

    if (argName === '--hospital-id' && argValue) {
      hospitalId = argValue.trim();
      if (eq < 0) i += 1;
      continue;
    }

    if (argName === '--medical-specialty-id' && argValue) {
      medicalSpecialtyId = argValue.trim();
      if (eq < 0) i += 1;
      continue;
    }
  }

  if (!outputPath) {
    outputPath = path.resolve(
      __dirname,
      'output',
      `naver-reviews-${businessId || 'default'}-${formatTimestampForFileName()}.xlsx`,
    );
  }

  const defaultHospitalId = 'b7eb552c-0855-4aed-965d-f66bcb46b645';
  if (!hospitalId) {
    hospitalId = defaultHospitalId;
  }

  return {
    businessId,
    outputPath,
    cookieFile,
    maxReviews,
    hospitalId,
    medicalSpecialtyId,
  };
}

function loadCookies(options: CliOptions): string {
  if (options.cookieFile && fs.existsSync(options.cookieFile)) {
    return fs.readFileSync(options.cookieFile, 'utf8').trim();
  }
  const envCookies = process.env.NAVER_PLACE_COOKIES;
  if (envCookies && envCookies.trim()) {
    return envCookies.trim();
  }
  return DEFAULT_COOKIES;
}

function buildWtmGraphqlHeader(businessId: string): string {
  const payload = JSON.stringify({
    arg: businessId,
    type: 'hospital',
    source: 'place',
  });
  return Buffer.from(payload, 'utf8').toString('base64');
}

async function fetchVisitorReviews(params: {
  businessId: string;
  cursor: string | null;
  size: number;
  cookies: string;
}): Promise<VisitorReviewsResponse> {
  const input: Record<string, unknown> = {
    businessId: params.businessId,
    businessType: 'hospital',
    item: '0',
    size: params.size,
    isPhotoUsed: false,
    includeContent: true,
    getUserStats: true,
    includeReceiptPhotos: true,
    getReactions: true,
    getTrailer: true,
  };
  if (params.cursor) {
    input.after = params.cursor;
  }

  const body = [
    {
      operationName: 'getVisitorReviews',
      variables: { input },
      query: GET_VISITOR_REVIEWS_QUERY,
    },
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'accept-language': 'ko',
      'content-type': 'application/json',
      cookie: params.cookies,
      origin: 'https://pcmap.place.naver.com',
      referer: `https://pcmap.place.naver.com/hospital/${params.businessId}/review/visitor`,
      'x-wtm-graphql': buildWtmGraphqlHeader(params.businessId),
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as VisitorReviewsResponse[] | VisitorReviewsResponse;
  const first = Array.isArray(json) ? json[0] : json;
  if (first?.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(first.errors)}`);
  }
  return first;
}

function extractImageUrls(item: NaverReviewItem): string[] {
  const urls: string[] = [];
  if (item.thumbnail && item.thumbnail.trim()) {
    urls.push(item.thumbnail.trim());
  }
  if (Array.isArray(item.media)) {
    for (const m of item.media) {
      const url = m?.thumbnail ?? m?.videoUrl;
      if (url && typeof url === 'string' && url.trim() && !urls.includes(url.trim())) {
        urls.push(url.trim());
      }
    }
  }
  return urls;
}

function mapItemToReview(
  item: NaverReviewItem,
  options: { hospitalId: string; medicalSpecialtyId: string },
): { review: MappedReview; images: MappedReviewImage[]; reviewRowIndex: number } {
  const body = (item.body ?? '').trim();
  const title = body.length > 50 ? body.slice(0, 50) + '…' : body;
  const rating = typeof item.rating === 'number' ? item.rating : 0;
  const imageUrls = extractImageUrls(item);

  const review: MappedReview = {
    hospitalId: options.hospitalId,
    medicalSpecialtyId: options.medicalSpecialtyId,
    userId: '',
    rating,
    title_ko_KR: title,
    content_ko_KR: body,
    isRecommended: rating >= 4,
    createdAt: item.created ?? '',
    concerns: '',
    imageUrls: imageUrls.join(','),
  };

  const images: MappedReviewImage[] = imageUrls.map((url, idx) => ({
    reviewRowIndex: 0,
    order: idx,
    imageType: idx === 0 ? 'BEFORE' : 'AFTER',
    imageUrl: url,
  }));

  return { review, images, reviewRowIndex: 0 };
}

async function main(): Promise<void> {
  const options = parseCliOptions();

  if (!options.businessId) {
    console.error('--business-id (또는 -b) 가 필요합니다. 예: --business-id=1107984486');
    process.exit(1);
  }

  const cookies = loadCookies(options);

  const allReviews: MappedReview[] = [];
  const allImages: MappedReviewImage[] = [];
  let cursor: string | null = null;
  let totalFromApi: number | null = null;
  let reviewRowIndex = 0;

  console.log(`네이버 플레이스 리뷰 수집 중 (businessId=${options.businessId})...`);

  while (true) {
    const res = await fetchVisitorReviews({
      businessId: options.businessId,
      cursor,
      size: PAGE_SIZE,
      cookies,
    });

    const visitorReviews = res.data?.visitorReviews;
    const items = visitorReviews?.items ?? [];
    if (totalFromApi == null && visitorReviews?.total != null) {
      totalFromApi = visitorReviews.total;
      console.log(`전체 리뷰 수: ${totalFromApi}`);
    }

    for (const item of items) {
      const { review, images } = mapItemToReview(item, {
        hospitalId: options.hospitalId,
        medicalSpecialtyId: options.medicalSpecialtyId,
      });
      const rowIdx = reviewRowIndex;
      allReviews.push(review);
      for (const img of images) {
        allImages.push({ ...img, reviewRowIndex: rowIdx });
      }
      reviewRowIndex += 1;
    }

    if (options.maxReviews != null && allReviews.length >= options.maxReviews) {
      console.log(`--max-reviews=${options.maxReviews} 도달, 수집 중단`);
      break;
    }

    if (items.length === 0) break;

    const lastCursor = items[items.length - 1]?.cursor;
    if (!lastCursor) break;

    cursor = lastCursor;
    if (totalFromApi != null && allReviews.length >= totalFromApi) break;

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`수집 완료: 리뷰 ${allReviews.length}건, 이미지 ${allImages.length}건`);

  const reviewsHeaders = [
    'hospitalId',
    'medicalSpecialtyId',
    'userId',
    'rating',
    'title_ko_KR',
    'content_ko_KR',
    'isRecommended',
    'createdAt',
    'concerns',
    'imageUrls',
  ] as const;

  const reviewsRows = allReviews.map((r) => ({
    hospitalId: r.hospitalId,
    medicalSpecialtyId: r.medicalSpecialtyId,
    userId: r.userId,
    rating: r.rating,
    title_ko_KR: r.title_ko_KR,
    content_ko_KR: r.content_ko_KR,
    isRecommended: r.isRecommended,
    createdAt: r.createdAt,
    concerns: r.concerns,
    imageUrls: r.imageUrls,
  }));

  const imagesHeaders = ['reviewRowIndex', 'order', 'imageType', 'imageUrl'] as const;
  const imagesRows = allImages.map((img) => ({
    reviewRowIndex: img.reviewRowIndex,
    order: img.order,
    imageType: img.imageType,
    imageUrl: img.imageUrl,
  }));

  const wsReviews = XLSX.utils.json_to_sheet(reviewsRows, { header: [...reviewsHeaders] });
  const wsImages = XLSX.utils.json_to_sheet(imagesRows, { header: [...imagesHeaders] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsReviews, 'Reviews');
  XLSX.utils.book_append_sheet(workbook, wsImages, 'ReviewImages');

  ensureDirForFile(options.outputPath);
  XLSX.writeFile(workbook, options.outputPath);

  console.log('\n엑셀 파일 생성 완료.');
  console.log(
    JSON.stringify(
      {
        ok: true,
        reviewsCount: allReviews.length,
        imagesCount: allImages.length,
        outputPath: options.outputPath,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
