/**
 * CLI 옵션 파싱 유틸리티
 */

import * as path from 'path';
import type { CliOptions, Locale } from './types';
import { parsePositiveInt, formatTimestampForFileName } from './utils';

const DEFAULT_BATCH_SIZE = 20;
const SUPPORTED_LOCALES: Locale[] = ['ko_KR', 'en_US', 'th_TH', 'ja_JP', 'zh_TW', 'hi_IN', 'tl_PH', 'ar_SA'];

/**
 * CLI 옵션 파싱
 */
export function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  const defaultOut = path.resolve(
    __dirname,
    '..',
    '..',
    'output',
    `district-name-update-${formatTimestampForFileName()}.json`,
  );

  let locale: Locale | undefined;
  let batchSize = DEFAULT_BATCH_SIZE;
  let limit: number | null = null;
  let testMode = false;
  let outputPath = defaultOut;
  let dryRun = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--locale' && next) {
      if (SUPPORTED_LOCALES.includes(next as Locale)) {
        locale = next as Locale;
      } else {
        console.warn(`⚠️  지원하지 않는 언어 코드: ${next}`);
        console.warn(`   지원 언어: ${SUPPORTED_LOCALES.join(', ')}`);
      }
      i += 1;
      continue;
    }

    if (arg === '--batch' && next) {
      const parsed = parsePositiveInt(next);
      if (parsed) batchSize = parsed;
      i += 1;
      continue;
    }

    if (arg === '--limit' && next) {
      const parsed = parsePositiveInt(next);
      limit = parsed ?? null;
      i += 1;
      continue;
    }

    if (arg === '--test') {
      testMode = true;
      continue;
    }

    if (arg === '--out' && next) {
      outputPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
  }

  return {
    locale,
    batchSize,
    limit,
    testMode,
    outputPath,
    dryRun,
  };
}

/**
 * CLI 옵션 검증 및 출력
 */
export function validateAndLogOptions(options: CliOptions): void {
  console.log('📋 실행 옵션:');
  console.log(JSON.stringify(options, null, 2));

  if (options.dryRun) {
    console.log('⚠️  DRY RUN 모드: 실제 데이터베이스 업데이트를 수행하지 않습니다.');
  }

  if (options.testMode) {
    console.log('🧪 테스트 모드: 제한된 수의 항목만 처리합니다.');
  }

  if (!options.locale) {
    console.warn('⚠️  언어 코드가 지정되지 않았습니다. --locale 옵션을 사용하세요.');
  }
}
