import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'docs']),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      indent: ['off'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'linebreak-style': ['off', 'unix'],
      'no-undef': ['off'],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'sort-imports': ['off'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CatchClause > BlockStatement[body.length=1] > ExpressionStatement > CallExpression[callee.object.name=console]',
          message:
            'A catch block with only a console.* call swallows the error — the user never sees the console. Call showError / set an hasError state so the screen reflects the failure (for a cancelled request, check axios.isCancel(error) first and skip it).',
        },
        {
          selector:
            'CallExpression[callee.name=useEffect] > ArrowFunctionExpression[body.type=BlockStatement]:has(NewExpression[callee.name=AbortController]):not(:has(ReturnStatement))',
          message:
            'This effect creates an AbortController but never returns a cleanup that calls controller.abort() — the in-flight request will not be cancelled when the deps change or the component unmounts, and a stale response can still land in state.',
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/assets/scss/**', '@/assets/scss'],
              message:
                'Styles belong beside the component/feature that owns them, not back in the global assets/scss/ folder (removed during the CSS architecture cleanup).',
            },
            {
              group: ['@shared/ui/*', '@shared/ui/**'],
              message:
                'shared/ui may only be entered through its barrel: import { X } from `@shared/ui`, not a deep import like @shared/ui/X.',
            },
            {
              group: ['@/shared/**', '@/shared'],
              message:
                'Always use the @shared/* alias under shared/, never @/shared/* — one path should only be spelled one way.',
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      'src/hooks/**',
      'src/stores/**',
      'src/utils/**',
      'src/features/*/hooks/**',
      'src/features/*/store/**',
      'src/features/*/api/**',
      'src/features/*/domain/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mui/*'],
              message: 'Logic layers may not depend on a UI library',
            },
            {
              group: ['@/components/**'],
              message:
                'Logic layers may not import the view layer (including its types)',
            },
            {
              group: ['@shared/ui/*', '@shared/ui/**'],
              message:
                'shared/ui may only be entered through its barrel: import { X } from `@shared/ui`, not a deep import like @shared/ui/X.',
            },
            {
              group: ['@/shared/**', '@/shared'],
              message:
                'Always use the @shared/* alias under shared/, never @/shared/* — one path should only be spelled one way.',
            },
            {
              group: ['@/assets/scss/**', '@/assets/scss'],
              message:
                'Styles belong beside the component/feature that owns them, not back in the global assets/scss/ folder (removed during the CSS architecture cleanup).',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/features/*/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message:
                'domain/ holds pure business rules and must not depend on React. A ReactNode-shaped view model belongs beside the component that renders it.',
            },
          ],
          patterns: [
            {
              group: ['@mui/*'],
              message: 'Logic layers may not depend on a UI library',
            },
            {
              group: ['@shared/ui', '@shared/ui/*', '@shared/ui/**'],
              message:
                'domain/ may not import @shared/ui (including its types). Colour tables and table-column definitions are presentation and belong beside the components/ that use them.',
            },
            {
              group: ['@/components/**'],
              message:
                'Logic layers may not import the view layer (including its types)',
            },
            {
              group: ['@/shared/**', '@/shared'],
              message:
                'Always use the @shared/* alias under shared/, never @/shared/* — one path should only be spelled one way.',
            },
            {
              group: ['@/assets/scss/**', '@/assets/scss'],
              message:
                'Styles belong beside the component/feature that owns them, not back in the global assets/scss/ folder (removed during the CSS architecture cleanup).',
            },
            {
              group: [
                '@/features/*/store/**',
                '@features/*/store/**',
                '../store/*',
                '../store/**',
                '@shared/session',
                '@shared/session/**',
              ],
              message:
                'domain/ may not import store (including the session store). domain/ is called by store, not the other way around; a reverse dependency would make business rules depend on the current screen state and make them untestable in isolation. Pass a token or user info in as a parameter instead.',
            },
            {
              group: [
                '@/features/*/api/**',
                '@features/*/api/**',
                '../api/*',
                '../api/**',
                '@shared/api',
                '@shared/api/**',
              ],
              message:
                'domain/ may not import api (including DTO types and the HTTP client). A DTO is the shape the backend sends, not our vocabulary. A DTO→domain mapping function belongs in api/ even when its output is a domain type.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/features/*/components/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@features/ai-models',
              importNames: ['useAIModelsStore'],
              message:
                'components/ is a pure view: a store owned by another feature is no exception — read it in hooks/ and pass it down via props.',
            },
            {
              name: '@/features/ai-models',
              importNames: ['useAIModelsStore'],
              message:
                'components/ is a pure view: a store owned by another feature is no exception — read it in hooks/ and pass it down via props.',
            },
            {
              name: '@features/devices',
              importNames: ['useDeviceStore'],
              message:
                'components/ is a pure view: a store owned by another feature is no exception — read it in hooks/ and pass it down via props.',
            },
            {
              name: '@/features/devices',
              importNames: ['useDeviceStore'],
              message:
                'components/ is a pure view: a store owned by another feature is no exception — read it in hooks/ and pass it down via props.',
            },
            {
              name: '@features/members',
              importNames: ['useMemberStore'],
              message:
                'components/ is a pure view: a store owned by another feature is no exception — read it in hooks/ and pass it down via props.',
            },
            {
              name: '@/features/members',
              importNames: ['useMemberStore'],
              message:
                'components/ is a pure view: a store owned by another feature is no exception — read it in hooks/ and pass it down via props.',
            },
            {
              name: '@features/container-stacks',
              importNames: ['useDeploymentsStore'],
              message:
                'components/ is a pure view: a store owned by another feature is no exception — read it in hooks/ and pass it down via props.',
            },
            {
              name: '@/features/container-stacks',
              importNames: ['useDeploymentsStore'],
              message:
                'components/ is a pure view: a store owned by another feature is no exception — read it in hooks/ and pass it down via props.',
            },
          ],
          patterns: [
            {
              group: ['**/store/*', '**/store/**'],
              message:
                'components/ is a pure view: read a store in hooks/ and pass it down via props. A tab component should call its matching use<X>Tab() instead.',
            },
            {
              group: [
                '@shared/session/useIAmStore',
                '@shared/session/useMainStore',
                '@shared/session/useOrgContentStore',
                '@shared/session/useProfileStore',
                '@shared/session/useTenantStore',
              ],
              message:
                'components/ must not read the session store directly (currentOrgId, userProfile, etc.) — read it in a route hook and pass it down via props. useManagementPermission is exempt from this rule.',
            },
            {
              group: ['**/api/*.api', '@shared/api/*'],
              message:
                'components/ must not call an API directly. Import types from *.api.types as usual.',
            },
            {
              group: ['@/assets/scss/**', '@/assets/scss'],
              message:
                'Styles belong beside the component/feature that owns them, not back in the global assets/scss/ folder (removed during the CSS architecture cleanup).',
            },
            {
              group: ['@shared/ui/*', '@shared/ui/**'],
              message:
                'shared/ui may only be entered through its barrel: import { X } from `@shared/ui`, not a deep import like @shared/ui/X.',
            },
            {
              group: ['@/shared/**', '@/shared'],
              message:
                'Always use the @shared/* alias under shared/, never @/shared/* — one path should only be spelled one way.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/app/**', 'src/features/**', 'src/shared/**'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/*' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feat'] },
        { type: 'shared', pattern: 'src/shared/*' },
      ],

      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: {
                to: {
                  element: { types: { anyOf: ['app', 'feature', 'shared'] } },
                },
              },
            },

            {
              from: { element: { type: 'feature' } },
              allow: {
                to: { element: { types: { anyOf: ['shared', 'feature'] } } },
              },
            },

            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },

            {
              from: { element: { type: 'feature' } },
              disallow: {
                to: {
                  element: { type: 'feature', fileInternalPath: '!index.ts' },
                },
              },
            },
          ],
        },
      ],
    },
  },
]);
