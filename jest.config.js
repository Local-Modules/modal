module.exports = {
  verbose: true,
  bail: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '/*.test.(js|ts|tsx)$',
  roots: [
    '<rootDir>/src',
  ],
  moduleDirectories: [
    'node_modules',
    'src',
  ],
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
  ],
}
