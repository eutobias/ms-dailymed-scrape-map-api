import configuration from './configuration';

describe('Configuration', () => {
  let config: ReturnType<typeof configuration>;

  beforeEach(() => {
    config = configuration();
  });

  it('should be defined', () => {
    expect(config).toBeDefined();
  });

  it('should have passwordHash property', () => {
    expect(config.passwordHash).toBeDefined();
    expect(typeof config.passwordHash).toBe('string');
    expect(config.passwordHash.length).toBeGreaterThan(0);
  });

  it('should have jwtHash property', () => {
    expect(config.jwtHash).toBeDefined();
    expect(typeof config.jwtHash).toBe('string');
    expect(config.jwtHash.length).toBeGreaterThan(0);
  });

  describe('indications', () => {
    it('should have indications object', () => {
      expect(config.indications).toBeDefined();
      expect(typeof config.indications).toBe('object');
    });

    it('should have url property', () => {
      expect(config.indications.url).toBeDefined();
      expect(typeof config.indications.url).toBe('string');
      expect(config.indications.url).toContain('dailymed.nlm.nih.gov');
    });

    it('should have expiration property', () => {
      expect(config.indications.expiration).toBeDefined();
      expect(typeof config.indications.expiration).toBe('number');

      expect(config.indications.expiration).toBe(1000 * 60 * 60 * 24);
    });

    it('should have filename property', () => {
      expect(config.indications.filename).toBeDefined();
      expect(typeof config.indications.filename).toBe('string');
      expect(config.indications.filename).toContain(
        'tmp/dailymed-indications.json',
      );
    });
  });

  it('should have grokApiKey property', () => {
    expect(config.grokApiKey).toBeDefined();
    expect(typeof config.grokApiKey).toBe('string');
    expect(config.grokApiKey).toMatch(/^gsk_/);
  });
});
