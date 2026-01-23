/**
 * 지역명 관련 스크립트 타입 정의
 */

// 지원하는 언어 코드
export type Locale = 'ko_KR' | 'en_US' | 'th_TH' | 'ja_JP' | 'zh_TW' | 'hi_IN';

// 다국어 텍스트 타입
export type LocalizedText = Partial<Record<Locale, string>>;

// 지역 데이터 타입
export interface DistrictData {
  id: string;
  name: LocalizedText;
  displayName?: LocalizedText;
  countryCode: 'KR' | 'TH';
  level: number;
  order?: number | null;
  parentId?: string | null;
}

// 업데이트 진행 상황 타입
export interface UpdateProgress {
  processedCount: number;
  totalCount: number;
  successCount: number;
  failureCount: number;
  lastProcessedId: string | null;
  startTime: string;
  lastUpdateTime: string;
}

// CLI 옵션 타입
export interface CliOptions {
  locale?: Locale;
  batchSize?: number;
  limit?: number | null;
  testMode?: boolean;
  outputPath?: string;
  dryRun?: boolean;
}

// 업데이트 결과 타입
export interface UpdateResult {
  success: boolean;
  id: string;
  error?: string;
}

// 병원 지역명 데이터 타입
export interface HospitalLocationData {
  id: string;
  name: unknown; // 병원 이름 (다국어)
  displayLocationName: unknown; // 표시 지역명 (다국어)
}

// 언어별 비교 결과 타입
export interface LanguageComparison {
  locale: Locale;
  current: string;
  expected: string;
  needsUpdate: boolean;
}
