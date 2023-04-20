/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import type { Config } from 'jest';
import * as fs from 'fs-extra';

// jest-sonar will not create the fully qualified path to the results
fs.mkdirpSync('__tests__/__results__/jest-sonar');

// Jest 'projects' specifications do not inherit global properties by default, so use an object to track these.
const commonProperties: Config = {
  moduleFileExtensions: ['ts', 'js', 'tsx', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['.*?__tests__/__snapshots__/.*', '.*/dist/.*', '.*/node_modules/.*', '.*/lib/.*'],
  preset: 'ts-jest',
  testRegex: '__tests__.*\\.*?\\.(spec|test)\\.ts$',
};

const config: Config = {
  ...commonProperties,
  coverageDirectory: '<rootDir>/__tests__/__results__/unit/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['./__tests__/beforeTests.ts'],
  testEnvironment: 'node',
  testResultsProcessor: 'jest-sonar-reporter',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        disableSourceMapSupport: true,
      },
    ],
  },
};

export default config;
