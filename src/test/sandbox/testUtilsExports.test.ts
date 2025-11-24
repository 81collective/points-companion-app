import * as testUtils from '../testUtils';

describe('testUtils exports', () => {
  it('should export named functions and values', () => {
    console.log('DEBUG testUtils keys:', Object.keys(testUtils));
    expect(Object.keys(testUtils).length).toBeGreaterThan(0);
  });
});
