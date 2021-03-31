module.exports = {
  extends: ['eslint:recommended', 'airbnb', 'prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    // Can I remove these now?
    ecmaFeatures: {
      impliedStrict: true,
      classes: true
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    'comma-dangle': ['error', 'never'],
    'comma-spacing': ['error', { before: false, after: true }],
    'eol-last': ['error', 'always'],
    indent: ['error', 2, { MemberExpression: 1 }],
    'no-multiple-empty-lines': ['error'],
    'no-new-symbol': 'error',
    'no-trailing-spaces': ['error'],
    'no-undef': ['error'],
    'no-unused-vars': ['error'],
    'object-curly-spacing': ['error', 'always'],
    'object-shorthand': 'error',

    'space-in-parens': ['error', 'never'],
    strict: [2, 'never'],
    'no-debugger': 0,
    'no-alert': 0,
    'no-await-in-loop': 0,
    'no-return-assign': ['error', 'except-parens'],
    'no-restricted-syntax': [
      2,
      'ForInStatement',
      'LabeledStatement',
      'WithStatement'
    ],
    'prefer-const': [
      'error',
      {
        destructuring: 'all'
      }
    ],
    'arrow-body-style': [0, 'as-needed'],
    'no-unused-expressions': [
      2,
      {
        allowTaggedTemplates: true
      }
    ],
    'no-param-reassign': [
      2,
      {
        props: false
      }
    ],
    'no-console': 0,
    'no-plusplus': 0,
    'import/prefer-default-export': 0,
    import: 0,
    'import/no-unresolved': 0,
    'import/order': 0,
    'import/no-extraneous-dependencies': 0,
    'func-names': 0,
    'space-before-function-paren': 0,
    'max-len': 0,
    'import/extensions': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    'react/display-name': 0,
    'react/no-array-index-key': 0,
    'react/react-in-jsx-scope': 0,
    'global-require': 0,
    'no-path-concat': 0,
    'prefer-template': 0,
    'react/prefer-stateless-function': 0,
    'react/forbid-prop-types': 0,
    'react/prop-types': 0,
    'react/no-unescaped-entities': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/accessible-emoji': 0,
    'react/require-default-props': 0,
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx']
      }
    ],
    radix: 0,
    'no-shadow': [
      2,
      {
        hoist: 'all',
        allow: ['resolve', 'reject', 'done', 'next', 'err', 'error']
      }
    ],
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    'jsx-a11y/href-no-hash': 'off',
    'jsx-a11y/anchor-is-valid': [
      'warn',
      {
        aspects: ['invalidHref']
      }
    ]
  },
  plugins: ['html', 'prettier', 'react-hooks']
};
