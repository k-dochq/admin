/**
 * 지역명 관련 스크립트 유틸리티 함수
 */

import * as fs from 'fs';
import * as path from 'path';
import type { UpdateProgress, LocalizedText, Locale } from './types';

/**
 * 디렉토리가 없으면 생성
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 파일 경로의 디렉토리가 없으면 생성
 */
export function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  ensureDirectory(dir);
}

/**
 * 타임스탬프를 파일명 형식으로 포맷
 */
export function formatTimestampForFileName(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
}

/**
 * 진행 상황을 파일에 저장
 */
export function saveUpdateProgress(progress: UpdateProgress, filePath: string): void {
  ensureDirForFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(progress, null, 2));
}

/**
 * 진행 상황을 파일에서 로드
 */
export function loadUpdateProgress(filePath: string): UpdateProgress | null {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as UpdateProgress;
    }
  } catch (error) {
    console.error('Error loading update progress:', error);
  }
  return null;
}

/**
 * LocalizedText에서 특정 언어의 텍스트 추출
 */
export function getLocalizedText(text: LocalizedText | unknown, locale: Locale): string {
  if (!text || typeof text !== 'object' || Array.isArray(text)) {
    return '';
  }

  const localizedText = text as LocalizedText;
  return localizedText[locale] || '';
}

/**
 * LocalizedText에서 한국어 텍스트 추출 (fallback)
 */
export function getKoreanText(text: LocalizedText | unknown): string {
  if (typeof text === 'string') {
    return text;
  }

  return getLocalizedText(text, 'ko_KR');
}

/**
 * LocalizedText 병합 (기존 데이터 유지하면서 특정 언어만 업데이트)
 */
export function mergeLocalizedText(
  existing: unknown,
  locale: Locale,
  newText: string,
): LocalizedText {
  let currentText: LocalizedText = {};

  // 기존 데이터 파싱
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    currentText = existing as LocalizedText;
  } else if (typeof existing === 'string') {
    // 문자열인 경우 ko_KR로 처리
    currentText = { ko_KR: existing };
  }

  // 기존 데이터 유지하고 특정 언어만 추가/업데이트
  return {
    ...currentText,
    [locale]: newText,
  };
}

/**
 * 양수 정수 파싱
 */
export function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}
