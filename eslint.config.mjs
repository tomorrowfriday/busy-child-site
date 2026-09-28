import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * eslint-config-next 16 ships native flat config, so it is spread directly.
 * The @eslint/eslintrc FlatCompat shim is not used — it throws on this config.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'coverage/**',
      'node_modules/**',
      '_legacy-static/**',
      // Imported from Claude Design: the .dc.html source and its generated
      // runtime. Reference material, not source — see src/app/[locale]/page.tsx.
      'Design/**',
      'next-env.d.ts',
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;
