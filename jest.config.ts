import type { Config } from 'jest';

enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
}

const MAX_WORKERS = process.env.MAX_WORKERS || 4;

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '@src/(.*)$': '<rootDir>/src/$1',
    '@test/(.*)$': '<rootDir>/test/$1',
  },
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coveragePathIgnorePatterns: ['src/config/', 'src/main.ts', 'src/app.module.ts', 'src/app.module-components.ts'],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>'],
};

function getConfigProjectBy(testType: TestType): Config {
  return {
    ...config,
    displayName: testType.toString(),
    testRegex: `test/${testType.toString()}/.*\\.spec\\.ts`,
  };
}

module.exports = {
  maxWorkers: MAX_WORKERS,
  projects: [getConfigProjectBy(TestType.UNIT), getConfigProjectBy(TestType.INTEGRATION)],
  verbose: false,
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
