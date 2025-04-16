export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: 'tsconfig.json',
      useESM: true
    }],
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/tests/**/*.test.ts?(x)'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(@octokit)/)', // Don't ignore @octokit modules
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/server/services/collection/__tests__/collection.test.ts' // Skip this specific test
  ],
}; 