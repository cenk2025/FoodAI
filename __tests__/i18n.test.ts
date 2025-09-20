import { describe, it, expect } from 'vitest';

// Helper function to check nested properties
function hasNestedProperty(obj: any, path: string): boolean {
  return path.split('.').reduce((current, key) => current && current[key], obj) !== undefined;
}

describe('Internationalization', () => {
  it('should have Finnish translations', async () => {
    const fiTranslations = await import('../i18n/messages/fi.json');
    expect(hasNestedProperty(fiTranslations.default, 'site.title')).toBe(true);
    expect(hasNestedProperty(fiTranslations.default, 'home.headline')).toBe(true);
    expect(hasNestedProperty(fiTranslations.default, 'home.tagline')).toBe(true);
    expect(hasNestedProperty(fiTranslations.default, 'home.search')).toBe(true);
    expect(hasNestedProperty(fiTranslations.default, 'offers.cta')).toBe(true);
  });

  it('should have English translations', async () => {
    const enTranslations = await import('../i18n/messages/en.json');
    expect(hasNestedProperty(enTranslations.default, 'site.title')).toBe(true);
    expect(hasNestedProperty(enTranslations.default, 'home.headline')).toBe(true);
    expect(hasNestedProperty(enTranslations.default, 'home.tagline')).toBe(true);
    expect(hasNestedProperty(enTranslations.default, 'home.search')).toBe(true);
    expect(hasNestedProperty(enTranslations.default, 'offers.cta')).toBe(true);
  });
});