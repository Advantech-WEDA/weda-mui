export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier-scss'],
  ignoreFiles: ['dist/**', 'node_modules/**'],
  rules: {
    'no-duplicate-selectors': true,

    'custom-property-pattern': null,

    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': null,

    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'comment-empty-line-before': null,
    'comment-whitespace-inside': null,
    'scss/double-slash-comment-empty-line-before': null,
    'scss/double-slash-comment-whitespace-inside': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-property-value-keyword-no-deprecated': null,
    'media-feature-range-notation': null,

    'property-no-vendor-prefix': null,

    'selector-class-pattern': null,

    'color-no-hex': null,
  },
};
