import neostandard from 'neostandard'

const config = neostandard({
  env: ['node', 'vitest'],
  ignores: [...neostandard.resolveIgnoresFromGitignore(), 'compose/**'],
  noJsx: true,
  noStyle: true
})

config.push({
  files: ['**/*.test.js'],
  languageOptions: {
    globals: {
      fetchMock: 'readonly'
    }
  }
})

export default config
