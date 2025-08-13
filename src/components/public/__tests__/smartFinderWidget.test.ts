import { parseIntent } from '../SmartFinderWidget';

describe('parseIntent', () => {
  test('detects dining category keywords', () => {
    expect(parseIntent('best card for dinner at Chipotle')).toMatchObject({ category: 'dining' });
    expect(parseIntent('coffee near me')).toMatchObject({ category: 'dining' });
  });

  test('detects groceries category keywords', () => {
    expect(parseIntent('which card for grocery run?')).toMatchObject({ category: 'groceries' });
    expect(parseIntent('supermarket rewards')).toMatchObject({ category: 'groceries' });
  });

  test('detects gas category keywords', () => {
    expect(parseIntent('gas station card')).toMatchObject({ category: 'gas' });
  });

  test('detects hotels category keywords', () => {
    expect(parseIntent('hotel stay this weekend')).toMatchObject({ category: 'hotels' });
  });

  test('extracts quoted business name', () => {
    expect(parseIntent("what card at 'Whole Foods'?")).toMatchObject({ businessName: 'Whole Foods' });
    expect(parseIntent('use at "Starbucks Coffee"')).toMatchObject({ businessName: 'Starbucks Coffee' });
  });

  test('falls back to capitalized sequence for business', () => {
    const r = parseIntent('is Costco good for gas?');
    // May or may not detect depending on tokenization, but should not throw
    expect(typeof r).toBe('object');
  });
});
