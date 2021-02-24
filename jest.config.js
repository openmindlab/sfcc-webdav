module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.ts?(x)', '**/?(*.)+(test).ts?(x)'],
  verbose: true,
  collectCoverage: true
};
