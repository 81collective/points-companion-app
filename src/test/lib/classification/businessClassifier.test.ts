import { classifyBusiness } from '@/lib/classification/businessClassifier';

describe('classifyBusiness', () => {
  it('identifies well-known coffee brand with high confidence', () => {
    const res = classifyBusiness({ name: 'Starbucks Coffee' });
    expect(res.taxonomy).toBe('coffee');
    expect(res.brandId).toBe('starbucks');
    expect(res.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('maps google restaurant types to dining with strong confidence', () => {
    const res = classifyBusiness({ name: 'Local Kitchen', googleTypes: ['restaurant'] });
    expect(res.taxonomy).toBe('dining');
    expect(res.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('maps department_store to shopping', () => {
    const res = classifyBusiness({ name: 'Generic Department', googleTypes: ['department_store'] });
    expect(res.taxonomy).toBe('shopping');
    expect(res.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it('infers home improvement from mapbox place name keywords', () => {
    const res = classifyBusiness({ name: "Joe's", mapboxPlaceName: 'Joe\'s Hardware Home Improvement, Springfield' });
    expect(res.taxonomy).toBe('home_improvement');
    expect(res.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it('defaults to shopping with low confidence when ambiguous', () => {
    const res = classifyBusiness({ name: 'The Store' });
    expect(res.taxonomy).toBe('shopping');
    expect(res.confidence).toBeLessThanOrEqual(0.4);
  });
});
