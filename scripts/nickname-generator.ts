// nickname-generator.ts — TypeScript module for generating English nicknames
// Based on the provided nickname generation code

// ---------- Types ----------
export type Style = 'pascal' | 'camel' | 'kebab' | 'snake' | 'title' | 'plain';
export type Suffix =
  | 'none'
  | 'number2' // 2~3자리 숫자
  | 'tag2' // 2자리 base36
  | 'tag3'; // 3자리 base36

export interface Options {
  style?: Style;
  suffix?: Suffix;
  maxLength?: number; // 최종 표시 문자열 길이 상한(기본 24)
  seed?: string | number; // 주면 재현성 보장, 없으면 crypto 기반 난수
  avoidAmbiguous?: boolean; // 0/O, 1/l 같은 글자 제거
  templates?: Template[]; // 사용할 템플릿 제한
  extraWords?: Partial<WordPacks>; // 단어팩 확장/오버라이드
  // 고유성 확인(예: DB 검사). true면 사용 불가로 보고 재시도.
  // canon은 소문자+영숫자만. 구현 예시는 아래 주석 참고.
  isTaken?: (canon: string) => Promise<boolean> | boolean;
  maxAttempts?: number; // 충돌/금칙어로 재시도 횟수(기본 8)
}

export type Template =
  | 'adj_noun'
  | 'color_animal'
  | 'gerund_animal'
  | 'mythic_noun'
  | 'sci_token'
  | 'noun_token'
  | 'double_adj_noun';

// ---------- Word banks ----------
type WordPacks = {
  adjectives: string[];
  nouns: string[];
  animals: string[];
  colors: string[];
  gerunds: string[];
  mythics: string[];
  sci: string[];
  tokens: string[];
  containers: string[];
};

const BASE_WORDS: WordPacks = {
  adjectives: [
    'brisk',
    'calm',
    'clever',
    'crisp',
    'bold',
    'bright',
    'chill',
    'daring',
    'eager',
    'fair',
    'gentle',
    'glad',
    'grand',
    'humble',
    'jolly',
    'keen',
    'lively',
    'mellow',
    'neat',
    'noble',
    'plucky',
    'proud',
    'quick',
    'quiet',
    'rapid',
    'ready',
    'robust',
    'silky',
    'smart',
    'snug',
    'solid',
    'spry',
    'sturdy',
    'swift',
    'tidy',
    'vivid',
    'witty',
    'zesty',
    'radiant',
    'stellar',
    'lunar',
    'solar',
    'arctic',
    'cozy',
    'fiery',
    'frosty',
    'golden',
    'silver',
    'velvet',
    'ruby',
    'emerald',
    'sapphire',
    'crimson',
    'ivory',
    'amber',
    'indigo',
    'scarlet',
    'hazel',
    'shadow',
    'shiny',
  ],
  nouns: [
    'river',
    'harbor',
    'meadow',
    'summit',
    'valley',
    'canyon',
    'comet',
    'meteor',
    'nebula',
    'orbit',
    'echo',
    'ember',
    'glimmer',
    'breeze',
    'thunder',
    'quartz',
    'granite',
    'marble',
    'pebble',
    'willow',
    'maple',
    'oak',
    'cedar',
    'sprout',
    'vine',
    'lotus',
    'iris',
    'lily',
    'dawn',
    'dusk',
    'horizon',
    'harvest',
    'voyage',
    'voyager',
    'beacon',
    'anchor',
    'compass',
    'lantern',
    'forge',
    'foundry',
    'studio',
    'lab',
    'workshop',
    'arcade',
    'archive',
    'citadel',
    'bastion',
    'harvest',
    'festival',
    'solstice',
    'aurora',
    'mirage',
    'oasis',
    'delta',
    'zenith',
    'vertex',
    'apex',
    'spire',
    'pillar',
    'canvas',
    'quill',
    'scroll',
    'cipher',
    'matrix',
    'vector',
    'cipher',
    'signal',
    'relay',
    'pulse',
    'spark',
    'engine',
    'circuit',
    'module',
    'kernel',
    'socket',
    'packet',
    'bridge',
    'portal',
    'gateway',
    'haven',
    'nexus',
    'atlas',
    'ledger',
    'harrier',
    'falcon',
    'phoenix',
    'griffin',
    'pegasus',
    'cyclone',
    'monsoon',
  ],
  animals: [
    'otter',
    'fox',
    'wolf',
    'lynx',
    'panda',
    'tiger',
    'lion',
    'leopard',
    'jaguar',
    'cougar',
    'bear',
    'badger',
    'beaver',
    'bison',
    'eagle',
    'falcon',
    'hawk',
    'owl',
    'raven',
    'heron',
    'whale',
    'dolphin',
    'orca',
    'seal',
    'penguin',
    'sparrow',
    'swallow',
    'robin',
    'stork',
    'swan',
    'crane',
    'falcon',
    'gazelle',
    'antelope',
    'buffalo',
    'yak',
    'moose',
    'boar',
    'cougar',
    'koala',
    'gecko',
    'iguana',
    'python',
    'viper',
    'mamba',
    'manta',
    'shark',
    'marlin',
    'salmon',
    'trout',
  ],
  colors: [
    'silver',
    'gold',
    'amber',
    'ivory',
    'crimson',
    'scarlet',
    'ruby',
    'sapphire',
    'emerald',
    'jade',
    'indigo',
    'violet',
    'lilac',
    'pearl',
    'charcoal',
    'slate',
    'cobalt',
    'teal',
    'coral',
    'rose',
  ],
  gerunds: [
    'running',
    'flying',
    'drifting',
    'gliding',
    'shining',
    'rising',
    'soaring',
    'rolling',
    'sailing',
    'dancing',
    'humming',
    'blooming',
    'blazing',
    'whirling',
    'flowing',
    'echoing',
    'smiling',
    'growing',
    'charging',
    'purring',
  ],
  mythics: [
    'aurora',
    'zephyr',
    'phoenix',
    'griffin',
    'pegasus',
    'hydra',
    'leviathan',
    'echo',
    'atlas',
    'odyssey',
    'ragnar',
    'valkyrie',
    'gaia',
    'eclipse',
    'solstice',
    'ember',
    'nova',
    'vulcan',
    'mercury',
    'apollo',
  ],
  sci: [
    'quantum',
    'neon',
    'lunar',
    'stellar',
    'cosmic',
    'plasma',
    'ion',
    'nano',
    'micro',
    'macro',
    'hyper',
    'turbo',
    'ultra',
    'meta',
    'cyber',
    'chrono',
    'delta',
    'omega',
    'binary',
    'gamma',
  ],
  tokens: [
    'nova',
    'flux',
    'pulse',
    'spark',
    'shift',
    'drive',
    'byte',
    'bit',
    'wave',
    'field',
    'loop',
    'forge',
    'hub',
    'nest',
    'den',
    'lab',
    'works',
    'vault',
    'atlas',
    'harbor',
  ],
  containers: ['hub', 'den', 'forge', 'lab', 'works', 'nest', 'harbor', 'haven', 'vault', 'studio'],
};

// ---------- Profanity filter ----------
const FORBIDDEN = [
  'admin',
  'support',
  'mod',
  'staff',
  'owner',
  'fuck',
  'shit',
  'bitch',
  'ass',
  'nazi',
  'hitler',
  'rape',
  'sex',
  'slut',
  'cock',
  'dick',
  'piss',
  'cum',
  'porn',
  'kkk',
  'fag',
  'retard',
  'suicide',
];

// ---------- Public API ----------
export async function generateNickname(
  opts: Options = {},
): Promise<{ display: string; canon: string; template: Template }> {
  const {
    style = 'pascal',
    suffix = 'tag2',
    maxLength = 24,
    seed,
    avoidAmbiguous = true,
    templates,
    extraWords,
    isTaken,
    maxAttempts = 8,
  } = opts;

  const words = mergeWordPacks(BASE_WORDS, extraWords);
  const useTemplates: Template[] = templates?.length ? templates : DEFAULT_TEMPLATES;

  const rng = seed != null ? makeSeededRng(seed) : makeCryptoRng();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tpl = pick(useTemplates, rng);
    const parts = buildByTemplate(tpl, words, rng);

    let core = applyStyle(parts, style);
    if (avoidAmbiguous) core = stripAmbiguous(core);

    const tagged = addSuffix(core, suffix, rng);
    const trimmed = trimToMax(tagged, maxLength);

    const canon = canonicalize(trimmed);

    if (isForbidden(canon)) continue;

    if (isTaken) {
      const taken = await isTaken(canon);
      if (taken) continue;
    }
    return { display: trimmed, canon, template: tpl };
  }

  // 최후의 안전망
  const fallback = 'user-' + toBase36(randBytes(rng, 3)).slice(0, 4);
  return { display: fallback, canon: canonicalize(fallback), template: 'adj_noun' };
}

// ---------- Builders ----------
const DEFAULT_TEMPLATES: Template[] = [
  'adj_noun',
  'color_animal',
  'gerund_animal',
  'mythic_noun',
  'sci_token',
  'noun_token',
  'double_adj_noun',
];

function buildByTemplate(tpl: Template, w: WordPacks, rng: Rng): string[] {
  switch (tpl) {
    case 'adj_noun':
      return [pick(w.adjectives, rng), pick(w.nouns, rng)];
    case 'color_animal':
      return [pick(w.colors, rng), pick(w.animals, rng)];
    case 'gerund_animal':
      return [pick(w.gerunds, rng), pick(w.animals, rng)];
    case 'mythic_noun':
      return [pick(w.mythics, rng), pick(w.nouns, rng)];
    case 'sci_token':
      return [pick(w.sci, rng), pick(w.tokens, rng)];
    case 'noun_token':
      return [pick(w.nouns, rng), pick(w.tokens, rng)];
    case 'double_adj_noun':
      return [pick(w.adjectives, rng), pickDistinct(w.adjectives, rng), pick(w.nouns, rng)];
  }
}

function applyStyle(parts: string[], style: Style): string {
  const clean = parts.map((s) => s.replace(/[^a-z0-9]/gi, ''));
  switch (style) {
    case 'pascal':
      return clean.map(cap).join('');
    case 'camel':
      return clean.map((s, i) => (i ? cap(s) : s.toLowerCase())).join('');
    case 'kebab':
      return clean.map((s) => s.toLowerCase()).join('-');
    case 'snake':
      return clean.map((s) => s.toLowerCase()).join('_');
    case 'title':
      return clean.map(cap).join(' ');
    case 'plain':
      return clean.join('');
  }
}

function addSuffix(base: string, type: Suffix, rng: Rng): string {
  if (type === 'none') return base;
  if (type === 'number2') return base + randomNumberSuffix(rng);
  const tagLen = type === 'tag3' ? 3 : 2;
  const tag = toBase36(randBytes(rng, 3)).slice(0, tagLen);
  const joiner = /\s/.test(base) ? ' ' : /-/.test(base) ? '-' : '_';
  return `${base}${joiner}${tag}`;
}

function randomNumberSuffix(rng: Rng): string {
  // 2~3자리 숫자, 10~999
  const n = 10 + Math.floor(rng() * 990);
  const joiner = rng() < 0.5 ? '-' : rng() < 0.5 ? '_' : '';
  return joiner + String(n);
}

function trimToMax(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  // 너무 길면 서픽스/구분자 유지하며 앞부분만 잘라냄
  const parts = s.split(/([_\-\s])/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > maxLen) break;
    out += p;
  }
  if (!out) return s.slice(0, maxLen);
  return out;
}

// ---------- Normalization & Filters ----------
function canonicalize(s: string): string {
  // NFKD → 결합문자 제거 → 소문자 → 영숫자만
  const stripped = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return stripped.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isForbidden(canon: string): boolean {
  if (canon.length < 3) return true;
  const normalized = normalizeLeet(canon);
  return FORBIDDEN.some((bad) => normalized.includes(normalizeLeet(bad)));
}

function normalizeLeet(s: string): string {
  return s
    .replace(/0/g, 'o')
    .replace(/[1l]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/\$/g, 's')
    .replace(/@/g, 'a');
}

function stripAmbiguous(s: string): string {
  // 0/O, 1/l 같은 혼동문자 제거
  return s.replace(/[0O]/g, 'o').replace(/[1lI]/g, 'i');
}

// ---------- RNG Utilities ----------
type Rng = () => number; // [0,1)

function makeSeededRng(seed: string | number): Rng {
  // Mulberry32 (간단/빠름/재현성)
  let t = typeof seed === 'number' ? seed >>> 0 : hash32(String(seed));
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCryptoRng(): Rng {
  if (typeof globalThis !== 'undefined' && (globalThis.crypto as any)?.getRandomValues) {
    return () => {
      const a = new Uint32Array(1);
      (globalThis.crypto as any).getRandomValues(a);
      return a[0] / 2 ** 32;
    };
  }
  // Fallback: Math.random (환경상 crypto 미지원)
  return Math.random;
}

function randBytes(rng: Rng, n: number): Uint8Array {
  const b = new Uint8Array(n);
  for (let i = 0; i < n; i++) b[i] = Math.floor(rng() * 256);
  return b;
}

function toBase36(bytes: Uint8Array): string {
  let n = 0n;
  for (const x of bytes) n = (n << 8n) + BigInt(x);
  return n.toString(36);
}

function hash32(s: string): number {
  let h = 2166136261 >>> 0; // FNV-1a-ish
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;
}
function pick<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickDistinct<T>(arr: T[], rng: Rng): T {
  let a = pick(arr, rng),
    b = pick(arr, rng),
    guard = 0;
  while (b === a && guard++ < 5) b = pick(arr, rng);
  return b;
}

function mergeWordPacks(base: WordPacks, extra?: Partial<WordPacks>): WordPacks {
  if (!extra) return base;
  const merge = (k: keyof WordPacks) => (extra[k] ? dedup([...base[k], ...extra[k]!]) : base[k]);
  return {
    adjectives: merge('adjectives'),
    nouns: merge('nouns'),
    animals: merge('animals'),
    colors: merge('colors'),
    gerunds: merge('gerunds'),
    mythics: merge('mythics'),
    sci: merge('sci'),
    tokens: merge('tokens'),
    containers: merge('containers'),
  };
}
function dedup<T>(a: T[]): T[] {
  return Array.from(new Set(a));
}
