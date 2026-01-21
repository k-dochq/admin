import * as fs from 'fs';
import * as path from 'path';
import {
  GOOGLE_TRANSLATE_API_KEY as DEFAULT_GOOGLE_TRANSLATE_API_KEY,
  GOOGLE_TRANSLATE_API_URL,
} from '../add-language/constants';

type ReviewSheetRow = Record<string, unknown> & {
  문맥변경?: unknown;
  reviewId?: unknown;
  병원?: unknown;
  '기존 아이디'?: unknown;
};

type TargetSpec = {
  /** JSON에 추가될 컬럼명 */
  fieldKey:
    | '문맥변경_en_US'
    | '문맥변경_th_TH'
    | '문맥변경_zh_TW'
    | '문맥변경_ja_JP'
    | '문맥변경_hi_IN';
  /** Google Translate target language code */
  targetLang: 'en' | 'th' | 'zh-TW' | 'ja' | 'hi';
  label: 'en_US' | 'th_TH' | 'zh_TW' | 'ja_JP' | 'hi_IN';
};

type ProgressState = {
  startedAt: string;
  updatedAt: string;
  inputPath: string;
  outputPath: string;
  backupPath?: string;
  dryRun: boolean;
  force: boolean;
  planOnly: boolean;
  concurrency: number;
  batchSize: number;
  totalRows: number;
  totalTexts: number; // unique texts
  totalRequestsPlanned: number; // unique texts * languages needed
  completedRequests: number;
  succeededRequests: number;
  failedRequests: number;
  updatedCells: number; // how many row fields set
  skippedEmptyContextRows: number;
  skippedAlreadyTranslatedCells: number;
  failures: Array<{
    target: string;
    textKeyHash: string;
    message: string;
  }>;
};

type CliOptions = {
  inputPath: string;
  outputPath: string;
  progressPath: string;
  reportPath: string;
  dryRun: boolean;
  planOnly: boolean;
  force: boolean;
  concurrency: number;
  batchSize: number;
  debugLimit?: number;
  checkpointEveryBatches: number;
};

type TranslateResponse = {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
};

type TranslateTaskItem = {
  textKey: string;
  text: string;
  target: TargetSpec;
};

const DEFAULT_INPUT_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.filtered.with-review-ids.json',
);

const TARGETS: TargetSpec[] = [
  { fieldKey: '문맥변경_en_US', targetLang: 'en', label: 'en_US' },
  { fieldKey: '문맥변경_th_TH', targetLang: 'th', label: 'th_TH' },
  { fieldKey: '문맥변경_zh_TW', targetLang: 'zh-TW', label: 'zh_TW' },
  { fieldKey: '문맥변경_ja_JP', targetLang: 'ja', label: 'ja_JP' },
  { fieldKey: '문맥변경_hi_IN', targetLang: 'hi', label: 'hi_IN' },
];

function nowIso(): string {
  return new Date().toISOString();
}

function timestampForFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function atomicWriteJson(filePath: string, data: unknown): void {
  ensureDirForFile(filePath);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tmpPath = path.join(dir, `.${base}.tmp`);
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

function safeString(v: unknown): string {
  return String(v ?? '').trim();
}

function normalizeLineEndings(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

function normalizeForKey(s: string): string {
  return normalizeLineEndings(s).trim();
}

function simpleHash(input: string): string {
  // 암호학적 해시가 아닌 “키 안정성”용 간단 해시 (로그/리포트용)
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function buildProgressPath(outputPath: string): string {
  const { dir, name } = path.parse(outputPath);
  return path.join(dir, `${name}.context-translate-progress.json`);
}

function buildReportPath(outputPath: string): string {
  const { dir, name } = path.parse(outputPath);
  return path.join(dir, `${name}.context-translate-report.json`);
}

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  let inputPath = DEFAULT_INPUT_PATH;
  let outputPath = DEFAULT_INPUT_PATH; // 기본은 덮어쓰기
  let dryRun = false;
  let planOnly = false;
  let force = false;
  let concurrency = 3;
  let batchSize = 5;
  let debugLimit: number | undefined;
  let checkpointEveryBatches = 1;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--in' && next) {
      inputPath = path.resolve(process.cwd(), next);
      outputPath = inputPath;
      i += 1;
      continue;
    }

    if (arg === '--out' && next) {
      outputPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (arg === '--dryRun' || arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg === '--planOnly' || arg === '--plan-only') {
      planOnly = true;
      continue;
    }

    if (arg === '--force') {
      force = true;
      continue;
    }

    if (arg === '--concurrency' && next) {
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new Error(`--concurrency 값이 올바르지 않습니다: ${next}`);
      }
      concurrency = Math.floor(parsed);
      i += 1;
      continue;
    }

    if (arg === '--batchSize' && next) {
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new Error(`--batchSize 값이 올바르지 않습니다: ${next}`);
      }
      batchSize = Math.floor(parsed);
      i += 1;
      continue;
    }

    if (arg === '--debugLimit' && next) {
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new Error(`--debugLimit 값이 올바르지 않습니다: ${next}`);
      }
      debugLimit = Math.floor(parsed);
      i += 1;
      continue;
    }

    if (arg === '--checkpointEveryBatches' && next) {
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new Error(`--checkpointEveryBatches 값이 올바르지 않습니다: ${next}`);
      }
      checkpointEveryBatches = Math.floor(parsed);
      i += 1;
      continue;
    }
  }

  const progressPath = buildProgressPath(outputPath);
  const reportPath = buildReportPath(outputPath);

  return {
    inputPath,
    outputPath,
    progressPath,
    reportPath,
    dryRun,
    planOnly,
    force,
    concurrency,
    batchSize,
    debugLimit,
    checkpointEveryBatches,
  };
}

function readJsonArray(filePath: string): ReviewSheetRow[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`입력 JSON 형식이 올바르지 않습니다(배열 아님): ${filePath}`);
  }
  return parsed as ReviewSheetRow[];
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateBatch({
  apiKey,
  texts,
  sourceLang,
  targetLang,
}: {
  apiKey: string;
  texts: string[];
  sourceLang: 'ko';
  targetLang: TargetSpec['targetLang'];
}): Promise<string[]> {
  const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: texts,
      source: sourceLang,
      target: targetLang,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  const result = (await response.json()) as TranslateResponse;
  if (!result.data.translations || result.data.translations.length === 0) {
    throw new Error('No translations found in response');
  }

  const translated = result.data.translations.map((t) => t.translatedText);
  if (translated.length !== texts.length) {
    // API가 일부만 돌려주는 경우가 있어 안전하게 방어
    throw new Error(`Translation count mismatch: in=${texts.length} out=${translated.length}`);
  }

  return translated;
}

async function translateBatchWithRetries(params: {
  apiKey: string;
  texts: string[];
  sourceLang: 'ko';
  targetLang: TargetSpec['targetLang'];
  maxRetries?: number;
}): Promise<string[]> {
  const { maxRetries = 4 } = params;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await translateBatch(params);
    } catch (error) {
      lastError = error;
      const backoffMs = Math.min(30_000, 250 * 2 ** (attempt - 1));
      console.error(`❌ 번역 배치 실패 (attempt ${attempt}/${maxRetries})`, error);
      if (attempt < maxRetries) await sleep(backoffMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Batch translation failed');
}

function shouldTranslateCell({
  row,
  target,
  force,
}: {
  row: ReviewSheetRow;
  target: TargetSpec;
  force: boolean;
}): boolean {
  if (force) return true;
  const existing = safeString(row[target.fieldKey]);
  return !existing;
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= tasks.length) return;
      results[current] = await tasks[current]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function loadProgress(progressPath: string): ProgressState | null {
  if (!fs.existsSync(progressPath)) return null;
  try {
    const raw = fs.readFileSync(progressPath, 'utf-8');
    return JSON.parse(raw) as ProgressState;
  } catch {
    return null;
  }
}

async function translateContextToLanguages(): Promise<void> {
  const {
    inputPath,
    outputPath,
    progressPath,
    reportPath,
    dryRun,
    planOnly,
    force,
    concurrency,
    batchSize,
    debugLimit,
    checkpointEveryBatches,
  } = parseCliOptions();

  // add-language 스크립트들과 동일하게: 프로젝트 내 하드코딩된 키를 그대로 사용
  const apiKey = DEFAULT_GOOGLE_TRANSLATE_API_KEY;

  const isOverwrite = path.resolve(inputPath) === path.resolve(outputPath);
  const rowsAll = readJsonArray(inputPath);
  const rows = typeof debugLimit === 'number' ? rowsAll.slice(0, debugLimit) : rowsAll;

  // 텍스트(문맥변경) 기준으로 dedupe
  const textGroups = new Map<
    string,
    {
      text: string;
      rowIndexes: number[];
      neededTargets: Set<TargetSpec['fieldKey']>;
    }
  >();

  let skippedEmptyContextRows = 0;
  let skippedAlreadyTranslatedCells = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const ctx = normalizeForKey(safeString(row['문맥변경']));
    if (!ctx) {
      skippedEmptyContextRows += 1;
      continue;
    }

    const neededTargets = TARGETS.filter((t) => shouldTranslateCell({ row, target: t, force }));
    if (neededTargets.length === 0) {
      skippedAlreadyTranslatedCells += TARGETS.length;
      continue;
    }

    const key = ctx; // normalizeForKey 적용됨
    const g = textGroups.get(key);
    if (!g) {
      textGroups.set(key, {
        text: ctx,
        rowIndexes: [i],
        neededTargets: new Set(neededTargets.map((t) => t.fieldKey)),
      });
    } else {
      g.rowIndexes.push(i);
      for (const t of neededTargets) g.neededTargets.add(t.fieldKey);
    }
  }

  const uniqueTexts = Array.from(textGroups.entries()).map(([textKey, g]) => ({
    textKey,
    text: g.text,
    rowIndexes: g.rowIndexes,
    neededTargets: g.neededTargets,
    hash: simpleHash(textKey),
  }));

  const tasksToTranslate: TranslateTaskItem[] = [];
  for (const item of uniqueTexts) {
    for (const target of TARGETS) {
      if (item.neededTargets.has(target.fieldKey)) {
        tasksToTranslate.push({ textKey: item.textKey, text: item.text, target });
      }
    }
  }

  const totalRequestsPlanned = tasksToTranslate.length;
  const existingProgress = loadProgress(progressPath);
  const progress: ProgressState =
    existingProgress ??
    ({
      startedAt: nowIso(),
      updatedAt: nowIso(),
      inputPath,
      outputPath,
      dryRun,
      force,
      planOnly,
      concurrency,
      batchSize,
      totalRows: rows.length,
      totalTexts: uniqueTexts.length,
      totalRequestsPlanned,
      completedRequests: 0,
      succeededRequests: 0,
      failedRequests: 0,
      updatedCells: 0,
      skippedEmptyContextRows,
      skippedAlreadyTranslatedCells,
      failures: [],
    } satisfies ProgressState);

  // 시작 로그
  console.log(
    JSON.stringify(
      {
        ok: true,
        phase: 'start',
        inputPath,
        outputPath,
        isOverwrite,
        dryRun,
        planOnly,
        force,
        concurrency,
        batchSize,
        debugLimit: debugLimit ?? null,
        progressPath,
        reportPath,
        totalRows: rows.length,
        uniqueTexts: uniqueTexts.length,
        totalRequestsPlanned,
        skippedEmptyContextRows,
      },
      null,
      2,
    ),
  );

  if (totalRequestsPlanned === 0) {
    const report = {
      ok: true,
      phase: 'done',
      message: '번역이 필요한 문맥변경이 없습니다.',
      inputPath,
      outputPath,
      dryRun,
      planOnly,
      totalRows: rows.length,
      uniqueTexts: uniqueTexts.length,
      totalRequestsPlanned,
    };
    atomicWriteJson(reportPath, report);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (planOnly) {
    const sample = uniqueTexts.slice(0, 3).map((t) => ({
      hash: t.hash,
      length: t.text.length,
      neededTargets: Array.from(t.neededTargets),
      example: t.text.slice(0, 80),
    }));
    const report = {
      ok: true,
      phase: 'plan',
      inputPath,
      outputPath,
      dryRun,
      planOnly,
      totalRows: rows.length,
      uniqueTexts: uniqueTexts.length,
      totalRequestsPlanned,
      targets: TARGETS,
      sample,
    };
    atomicWriteJson(reportPath, report);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // 덮어쓰기면 백업 생성
  if (!dryRun && isOverwrite && !progress.backupPath) {
    const { dir, name, ext } = path.parse(inputPath);
    const backupPath = path.join(dir, `${name}.bak-${timestampForFilename()}${ext || '.json'}`);
    fs.copyFileSync(inputPath, backupPath);
    progress.backupPath = backupPath;
  }

  // (targetLang, fieldKey) 단위로 배치 묶기
  const tasksByTarget = new Map<TargetSpec['fieldKey'], TranslateTaskItem[]>();
  for (const task of tasksToTranslate) {
    const key = task.target.fieldKey;
    const arr = tasksByTarget.get(key) ?? [];
    arr.push(task);
    tasksByTarget.set(key, arr);
  }

  // 요청 단위(배치)로 잘라서 글로벌 동시성으로 실행
  type BatchJob = {
    target: TargetSpec;
    items: TranslateTaskItem[];
    batchIndex: number;
    batchCount: number;
  };

  const batchJobs: BatchJob[] = [];
  for (const target of TARGETS) {
    const items = tasksByTarget.get(target.fieldKey) ?? [];
    if (items.length === 0) continue;
    const batchCount = Math.ceil(items.length / batchSize);
    for (let i = 0; i < items.length; i += batchSize) {
      batchJobs.push({
        target,
        items: items.slice(i, i + batchSize),
        batchIndex: Math.floor(i / batchSize) + 1,
        batchCount,
      });
    }
  }

  let sinceLastCheckpoint = 0;

  const batchTaskFns = batchJobs.map((job) => async () => {
    const { target, items, batchIndex, batchCount } = job;
    const hashes = items.map((it) => simpleHash(it.textKey));
    const label = target.label;

    console.log(
      `🔄 번역 요청 시작: ${label} (ko → ${target.targetLang}) batch ${batchIndex}/${batchCount} items=${items.length} [${hashes.join(
        ',',
      )}]`,
    );

    try {
      const texts = items.map((it) => it.text);
      const translated = await translateBatchWithRetries({
        apiKey,
        texts,
        sourceLang: 'ko',
        targetLang: target.targetLang,
      });

      // 결과 적용
      let localUpdatedCells = 0;
      items.forEach((it, idx) => {
        const t = translated[idx] ?? '';
        const group = textGroups.get(it.textKey);
        if (!group) return;

        for (const rowIndex of group.rowIndexes) {
          const row = rows[rowIndex];
          if (!shouldTranslateCell({ row, target, force })) continue;
          row[target.fieldKey] = t;
          localUpdatedCells += 1;
        }
      });

      progress.completedRequests += items.length;
      progress.succeededRequests += items.length;
      progress.updatedCells += localUpdatedCells;
      progress.updatedAt = nowIso();

      console.log(
        `✅ 번역 완료: ${label} batch ${batchIndex}/${batchCount} (+cells=${localUpdatedCells}) doneRequests=${progress.completedRequests}/${progress.totalRequestsPlanned}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      progress.completedRequests += items.length;
      progress.failedRequests += items.length;
      progress.updatedAt = nowIso();
      for (const it of items) {
        progress.failures.push({
          target: target.label,
          textKeyHash: simpleHash(it.textKey),
          message,
        });
      }
      console.error(`❌ 번역 실패: ${label} batch ${batchIndex}/${batchCount} error=${message}`);
    }

    // Rate Limit 방지용 미세 딜레이 (병렬 실행 시에도 약간의 숨고르기)
    await sleep(100);

    sinceLastCheckpoint += 1;
    if (sinceLastCheckpoint >= checkpointEveryBatches) {
      if (!dryRun) atomicWriteJson(outputPath, rows);
      atomicWriteJson(progressPath, progress);
      console.log(
        JSON.stringify(
          {
            phase: 'checkpoint',
            completedRequests: progress.completedRequests,
            succeededRequests: progress.succeededRequests,
            failedRequests: progress.failedRequests,
            updatedCells: progress.updatedCells,
          },
          null,
          2,
        ),
      );
      sinceLastCheckpoint = 0;
    }
  });

  await runWithConcurrency(batchTaskFns, concurrency);

  // 마지막 저장
  if (!dryRun) atomicWriteJson(outputPath, rows);
  atomicWriteJson(progressPath, progress);

  const report = {
    ok: true,
    phase: 'done',
    inputPath,
    outputPath,
    backupPath: progress.backupPath ?? null,
    dryRun,
    planOnly,
    force,
    concurrency,
    batchSize,
    totalRows: rows.length,
    uniqueTexts: uniqueTexts.length,
    totalRequestsPlanned,
    completedRequests: progress.completedRequests,
    succeededRequests: progress.succeededRequests,
    failedRequests: progress.failedRequests,
    updatedCells: progress.updatedCells,
    failuresCount: progress.failures.length,
    failuresSample: progress.failures.slice(0, 20),
  };

  atomicWriteJson(reportPath, report);
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  translateContextToLanguages()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

export { translateContextToLanguages };

