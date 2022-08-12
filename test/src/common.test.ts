import { getOriginRegExp, isValidOrigin } from '../../src/common';

describe('test valid origin', () => {
  const testCases: [string, string, boolean][] = [
    ['https://taptap.com/', 'https://taptap.com/', true],
    ['https://taptap.com/1', 'https://taptap.com/', false],
    ['https://*.taptap.com:8080/', 'https://local.taptap.com:8080/', true],
    ['https://taptap.com/*', 'https://taptap.com/', true],
    ['https://*.taptap.com/1', 'https://local.taptap.com/', false],
    ['*.taptap.com/', 'https://local.taptap.com/', true],
    ['*.taptap.com:*/', 'https://local.taptap.com/', false],
    ['*.taptap.com:*/', 'https://local.taptap.com:3333/', true],
    ['*', 'http://11.com', true],
  ];

  for (let testCase of testCases) {
    const currentRegexp = getOriginRegExp(testCase[0]);
    test(`TdsOrigin: '${testCase[0]}' Origin: '${testCase[1]}' should be '${testCase[2]}' regexp: ${currentRegexp}`, () => {
      expect(isValidOrigin(testCase[1], testCase[0])).toBe(testCase[2]);
    });
  }
});
