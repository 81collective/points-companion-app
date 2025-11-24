describe('VirtualBusinessGrid export inspection', () => {
  it('logs module exports', () => {
    const mod = require('../../components/common/VirtualBusinessGrid');
    console.log('DEBUG VirtualBusinessGrid keys:', Object.keys(mod));
    console.log('DEBUG VirtualBusinessGrid default:', (mod as any).default);
    expect(Object.keys(mod)).toBeDefined();
  });
});
