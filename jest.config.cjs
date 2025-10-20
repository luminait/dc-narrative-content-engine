/** @type {import('jest').Config} */
const { pathsToModuleNameMapper } = require('ts-jest');
const tsconfig = require('./tsconfig.json');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },

    // Keep Jest in lockstep with tsconfig "paths"
    moduleNameMapper: pathsToModuleNameMapper(
        tsconfig.compilerOptions.paths,
        { prefix: '<rootDir>/' }
    ),

    clearMocks: true,
};
