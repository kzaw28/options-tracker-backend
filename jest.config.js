module.exports = {
  preset: 'ts-jest', // Essential for TypeScript support
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      transpileOnly: true,
      diagnostics: false,
      isolatedModules: true,    }
  },
  testMatch: ['**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    "^aws-sdk$": "<rootDir>/node_modules/aws-sdk",
  }
};
