// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json', // Make sure tsconfig is pointed correctly
    }],
  },
  globals: {
    // 'ts-jest': { // produced a warnign so commented out
    //   isolatedModules: true, // Move this to tsconfig.json
    // },
  },
};
  