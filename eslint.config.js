import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import i18next from "eslint-plugin-i18next";

export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Untranslated text is a lint error. Any words written straight into JSX - text, or
    // a user-facing attribute such as a placeholder or aria-label - fail here, so a new
    // component cannot ship English-only by accident; the fix is a key in
    // src/i18n/locales/en.ts and `t('...')`. The file list is opt-out: a new file is
    // covered the day it is created.
    files: ["src/**/*.tsx"],
    ignores: [
      "src/**/*.test.tsx",
      "src/test/**",
      "src/components/ui/**",
      // English-only on purpose, for now: SEO copy aimed at English queries, and legal
      // text that must not be machine-paraphrased. Translating these needs per-language
      // URLs and hreflang, not just strings - see "Languages" in CLAUDE.md.
      "src/components/MarketingPage.tsx",
      "src/components/QuestionAnswer.tsx",
      "src/components/SiteFooter.tsx",
      "src/pages/About.tsx",
      "src/pages/Contact.tsx",
      "src/pages/DoodleAlternative.tsx",
      "src/pages/Faq.tsx",
      "src/pages/PrivacyPolicy.tsx",
      "src/pages/TermsOfService.tsx",
      "src/pages/When2meetAlternative.tsx",
    ],
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            include: ["alt", "title", "placeholder", "label", "aria-label", "aria-description"],
          },
          // Date style names and patterns are identifiers, not copy.
          callees: { exclude: ["t", "i18n(ext)?", "f\\.date(Range)?", "format"] },
          // The brand is the same word in every language.
          words: { exclude: ["WeGoWhen", "[0-9!-/:-@[-`{-~\\s—–]+"] },
        },
      ],
    },
  },
  {
    // Vendored shadcn/ui components. react-refresh/only-export-components fires because
    // these files export a component alongside its variants - buttonVariants,
    // badgeVariants, useFormField - which is shadcn's own shape, and app code imports
    // those exports. It cannot be satisfied without rewriting third-party code, and six
    // permanent warnings train people to ignore the whole lint output.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
);
