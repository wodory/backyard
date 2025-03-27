/**
 * 파일명: jest.config.js
 * 목적: Jest 테스트 프레임워크 구성
 * 역할: 테스트 환경 및 옵션 설정
 * 작성일: 2024-03-30
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/__mocks__/'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json'
      }
    ]
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}; 