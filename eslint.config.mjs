import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

// __dirname 및 __filename 준비
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FlatCompat 사용(Next 공식 및 커뮤니티 추천)
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 최신 Next.js, TypeScript, Core Web Vitals, 접근성(A11y), Prettier 권장 설정 통합
  ...compat.config({
    extends: [
      'next',
      'next/core-web-vitals',
      'next/typescript',
      'plugin:jsx-a11y/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
    ],
    plugins: ['jsx-a11y', 'import'],
    rules: {
      // JSX 접근성 추가 권장 규칙(옵션)
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      // FSD 절대 경로 import 규칙 (Clean Architecture 구조 내에서는 상대 경로 허용)
      'import/no-relative-packages': 'error',
      'import/no-relative-parent-imports': 'off', // API 디렉토리에서는 상대 경로 허용
      // 프론트엔드에서만 상대 경로 import 전면 금지 (API 디렉토리는 Clean Architecture로 별도 관리)
      'no-restricted-imports': 'off', // 현재는 비활성화
      // 사용하지 않는 변수/함수 체크 완화 (warning으로 변경)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used', // 사용된 매개변수만 검사
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true, // rest siblings 무시
        },
      ],
      'no-unused-vars': 'off', // TypeScript 규칙과 충돌 방지
      // any 타입 사용 허용 (admin 프로젝트 특성상 유연성 필요)
      '@typescript-eslint/no-explicit-any': 'warn',
      // 필요에 따라 본인 코드 스타일에 맞춘 추가/변경 가능
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  }),
  // 스크립트 파일들 제외
  {
    ignores: [
      'script/**/*',
      'scripts/**/*',
      'prisma/seed-*.ts',
      'prisma/data-migration/**/*',
      '.next/**/*',
      'node_modules/**/*',
    ],
  },
];

export default eslintConfig;
