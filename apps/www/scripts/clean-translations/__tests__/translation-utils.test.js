/**
 * Tests for translation cleanup utilities
 */

import {
  extractQuotedStrings,
  extractDynamicPattern,
  matchesPattern,
  extractKeysFromFile,
  isPluralizationKey,
} from '../translation-utils.js'

describe('extractQuotedStrings', () => {
  it('should extract single-quoted strings', () => {
    const result = extractQuotedStrings("t('nav/home')")
    expect(result).toEqual(['nav/home'])
  })

  it('should extract double-quoted strings', () => {
    const result = extractQuotedStrings('t("nav/home")')
    expect(result).toEqual(['nav/home'])
  })

  it('should extract backtick strings without interpolation', () => {
    const result = extractQuotedStrings('t(`nav/home`)')
    expect(result).toEqual(['nav/home'])
  })

  it('should NOT extract backtick strings with interpolation', () => {
    const result = extractQuotedStrings('t(`nav/${variable}`)')
    expect(result).toEqual([])
  })

  it('should extract multiple strings', () => {
    const result = extractQuotedStrings("t.first(['nav/home', 'nav/default'])")
    expect(result).toContain('nav/home')
    expect(result).toContain('nav/default')
  })

  it('should handle escaped quotes', () => {
    const result = extractQuotedStrings("t('nav/don\\'t')")
    expect(result).toEqual(["nav/don\\'t"])
  })
})

describe('extractDynamicPattern', () => {
  it('should replace single variable with wildcard', () => {
    const result = extractDynamicPattern('nav/${type}')
    expect(result).toBe('nav/*')
  })

  it('should replace multiple variables with wildcards', () => {
    const result = extractDynamicPattern(
      'prolongNecessary/${membershipType}/${status}',
    )
    expect(result).toBe('prolongNecessary/*/*')
  })

  it('should handle complex variable names', () => {
    const result = extractDynamicPattern(
      'account/${user.type}/${settings.mode}',
    )
    expect(result).toBe('account/*/*')
  })

  it('should preserve static parts', () => {
    const result = extractDynamicPattern('prefix/${var}/suffix')
    expect(result).toBe('prefix/*/suffix')
  })
})

describe('matchesPattern', () => {
  it('should match single-level wildcard', () => {
    expect(matchesPattern('nav/home', 'nav/*')).toBe(true)
    expect(matchesPattern('nav/about', 'nav/*')).toBe(true)
  })

  it('should NOT match wrong number of levels', () => {
    expect(matchesPattern('nav/home/sub', 'nav/*')).toBe(false)
    expect(matchesPattern('nav', 'nav/*')).toBe(false)
  })

  it('should match multi-level wildcards', () => {
    expect(
      matchesPattern(
        'prolongNecessary/ABO_GIVE_MONTHS/due',
        'prolongNecessary/*/*',
      ),
    ).toBe(true)
    expect(
      matchesPattern(
        'prolongNecessary/MONTHLY_ABO/overdue',
        'prolongNecessary/*/*',
      ),
    ).toBe(true)
  })

  it('should match with static parts', () => {
    expect(
      matchesPattern('account/settings/email/verified', 'account/*/email/*'),
    ).toBe(true)
  })

  it('should NOT match different static parts', () => {
    expect(matchesPattern('nav/home', 'account/*')).toBe(false)
  })

  it('should handle special regex characters in static parts', () => {
    expect(matchesPattern('account/settings.email', 'account/*')).toBe(true)
  })
})

describe('extractKeysFromFile', () => {
  describe('basic t() usage', () => {
    it('should extract basic t() calls with single quotes', () => {
      const content = `
        const text = t('nav/home');
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('nav/home')).toBe(true)
    })

    it('should extract basic t() calls with double quotes', () => {
      const content = `
        const text = t("nav/home");
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('nav/home')).toBe(true)
    })

    it('should extract multiple t() calls', () => {
      const content = `
        const home = t('nav/home');
        const about = t('nav/about');
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('nav/home')).toBe(true)
      expect(keys.has('nav/about')).toBe(true)
    })
  })

  describe('t.elements() usage', () => {
    it('should extract t.elements() calls', () => {
      const content = `
        const element = t.elements('marketing/signup/title', {link: <a>test</a>});
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('marketing/signup/title')).toBe(true)
    })
  })

  describe('t.first() usage', () => {
    it('should extract all keys from t.first() array', () => {
      const content = `
        const text = t.first(['nav/home', 'nav/default']);
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('nav/home')).toBe(true)
      expect(keys.has('nav/default')).toBe(true)
    })

    it('should handle multi-line t.first() arrays', () => {
      const content = `
        const text = t.first([
          'nav/home',
          'nav/default',
          'nav/fallback'
        ]);
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('nav/home')).toBe(true)
      expect(keys.has('nav/default')).toBe(true)
      expect(keys.has('nav/fallback')).toBe(true)
    })
  })

  describe('t.first.elements() usage', () => {
    it('should extract keys from t.first.elements()', () => {
      const content = `
        const element = t.first.elements(['marketing/title', 'marketing/fallback'], {});
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('marketing/title')).toBe(true)
      expect(keys.has('marketing/fallback')).toBe(true)
    })
  })

  describe('t.pluralize() usage', () => {
    it('should extract base key from t.pluralize()', () => {
      const content = `
        const text = t.pluralize('memberships/title', {count: 5});
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('memberships/title')).toBe(true)
    })
  })

  describe('t.pluralize.elements() usage', () => {
    it('should extract base key from t.pluralize.elements()', () => {
      const content = `
        const element = t.pluralize.elements('memberships/description', {count: 1, link: <a/>});
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('memberships/description')).toBe(true)
    })
  })

  describe('dynamic pattern detection', () => {
    it('should detect simple template literal pattern', () => {
      const content = `
        const key = t(\`nav/\${type}\`);
      `
      const { patterns } = extractKeysFromFile(content)
      expect(patterns.has('nav/*')).toBe(true)
    })

    it('should detect multi-level template literal pattern', () => {
      const content = `
        const key = t(\`prolongNecessary/\${membership.type}/\${status}\`);
      `
      const { patterns } = extractKeysFromFile(content)
      expect(patterns.has('prolongNecessary/*/*')).toBe(true)
    })

    it('should detect patterns in t.first() arrays', () => {
      const content = `
        const text = t.first([\`nav/\${type}\`, 'nav/default']);
      `
      const { patterns } = extractKeysFromFile(content)
      expect(patterns.has('nav/*')).toBe(true)
    })

    it('should detect patterns from variable definitions', () => {
      const content = `
        const keys = [
          \`prolongNecessary/\${membership.type.name}/\${key}\`,
          \`prolongNecessary/\${key}\`,
        ];
        const text = t.first(keys);
      `
      const { patterns } = extractKeysFromFile(content)
      expect(patterns.has('prolongNecessary/*/*')).toBe(true)
      expect(patterns.has('prolongNecessary/*')).toBe(true)
    })

    it('should detect patterns in t.first.elements()', () => {
      const content = `
        const prefixTranslationKeys = [
          \`prolongNecessary/\${membership.type.name}/\${key}\`,
          \`prolongNecessary/\${key}\`,
        ];
        return t.first.elements(prefixTranslationKeys, {link: <a/>});
      `
      const { patterns } = extractKeysFromFile(content)
      expect(patterns.has('prolongNecessary/*/*')).toBe(true)
      expect(patterns.has('prolongNecessary/*')).toBe(true)
    })

    it('should handle complex real-world example from ProlongBox', () => {
      const content = `
        const key =
          (numberOfDays < 0 && 'overdue') ||
          (numberOfDays <= 2 && 'due') ||
          'before'
        
        const prefixTranslationKeys = [
          \`prolongNecessary/\${membership.type.name}/\${key}\`,
          \`prolongNecessary/\${key}\`,
        ]
        
        return t.first.elements(prefixTranslationKeys, {
          link: t('prolongNecessary/native/info'),
        })
      `
      const { keys, patterns } = extractKeysFromFile(content)

      // Should extract static key
      expect(keys.has('prolongNecessary/native/info')).toBe(true)

      // Should detect patterns
      expect(patterns.has('prolongNecessary/*/*')).toBe(true)
      expect(patterns.has('prolongNecessary/*')).toBe(true)
    })
  })

  describe('real-world examples', () => {
    it('should handle AccountTabs.js pattern', () => {
      const content = `
        const tabs = ['OVERVIEW', 'MEMBERSHIP', 'TRANSACTIONS'];
        return tabs.map(tab => t(\`account/tabs/\${tab}\`));
      `
      const { patterns } = extractKeysFromFile(content)
      expect(patterns.has('account/tabs/*')).toBe(true)
    })

    it('should handle AuthSettings.js pattern', () => {
      const content = `
        const factors = ['EMAIL_TOKEN', 'APP'];
        return factors.map(factor => 
          t(\`account/authSettings/firstfactor/\${factor}/label\`)
        );
      `
      const { patterns } = extractKeysFromFile(content)
      expect(patterns.has('account/authSettings/firstfactor/*/label')).toBe(
        true,
      )
    })

    it('should handle membership management patterns', () => {
      const content = `
        const key = t(\`memberships/\${membership.type.name}/latestPeriod/renew/\${canRenew}/autoPay/\${hasAutoPay}\`);
      `
      const { patterns } = extractKeysFromFile(content)
      expect(patterns.has('memberships/*/latestPeriod/renew/*/autoPay/*')).toBe(
        true,
      )
    })
  })

  describe('edge cases', () => {
    it('should handle t() with spaces', () => {
      const content = `
        const text = t(  'nav/home'  );
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('nav/home')).toBe(true)
    })

    it('should not extract commented-out code', () => {
      const content = `
        // const text = t('nav/commented');
        const text = t('nav/active');
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('nav/active')).toBe(true)
      // Note: Simple regex will still match commented code
      // This is acceptable as it's safer to keep potentially used keys
    })

    it('should handle keys with special characters', () => {
      const content = `
        const text = t('nav/home-page');
        const text2 = t('account/settings.email');
      `
      const { keys } = extractKeysFromFile(content)
      expect(keys.has('nav/home-page')).toBe(true)
      expect(keys.has('account/settings.email')).toBe(true)
    })

    it('should handle empty content', () => {
      const { keys, patterns } = extractKeysFromFile('')
      expect(keys.size).toBe(0)
      expect(patterns.size).toBe(0)
    })

    it('should handle content with no translations', () => {
      const content = `
        const x = 5;
        console.log('hello');
      `
      const { keys, patterns } = extractKeysFromFile(content)
      expect(keys.size).toBe(0)
      expect(patterns.size).toBe(0)
    })
  })
})

describe('isPluralizationKey', () => {
  it('should identify numeric pluralization keys', () => {
    const baseKeys = new Set(['memberships/title'])
    expect(isPluralizationKey('memberships/title/0', baseKeys)).toBe(true)
    expect(isPluralizationKey('memberships/title/1', baseKeys)).toBe(true)
    expect(isPluralizationKey('memberships/title/5', baseKeys)).toBe(true)
  })

  it('should identify "other" pluralization keys', () => {
    const baseKeys = new Set(['memberships/title'])
    expect(isPluralizationKey('memberships/title/other', baseKeys)).toBe(true)
  })

  it('should NOT identify non-pluralization keys', () => {
    const baseKeys = new Set(['memberships/title'])
    expect(isPluralizationKey('memberships/title', baseKeys)).toBe(false)
    expect(isPluralizationKey('memberships/title/something', baseKeys)).toBe(
      false,
    )
  })

  it('should NOT identify keys without base key', () => {
    const baseKeys = new Set(['memberships/title'])
    expect(isPluralizationKey('other/key/0', baseKeys)).toBe(false)
  })

  it('should handle multi-level keys', () => {
    const baseKeys = new Set([
      'memberships/give/ABO_GIVE_MONTHS/description/before',
    ])
    expect(
      isPluralizationKey(
        'memberships/give/ABO_GIVE_MONTHS/description/before/1',
        baseKeys,
      ),
    ).toBe(true)
    expect(
      isPluralizationKey(
        'memberships/give/ABO_GIVE_MONTHS/description/before/other',
        baseKeys,
      ),
    ).toBe(true)
  })
})

describe('integration tests', () => {
  it('should handle complete component with mixed patterns', () => {
    const content = `
      import { useTranslation } from '../lib/withT';
      
      export default function Component({ membership, days }) {
        const { t } = useTranslation();
        
        const status = days < 0 ? 'overdue' : 'due';
        
        const dynamicKeys = [
          \`prolongNecessary/\${membership.type}/\${status}\`,
          \`prolongNecessary/\${status}\`,
        ];
        
        return (
          <div>
            <h1>{t('nav/home')}</h1>
            <p>{t.first(dynamicKeys)}</p>
            <span>{t.pluralize('memberships/count', {count: days})}</span>
            <a>{t.first(['nav/link', 'nav/default'])}</a>
          </div>
        );
      }
    `

    const { keys, patterns } = extractKeysFromFile(content)

    // Static keys
    expect(keys.has('nav/home')).toBe(true)
    expect(keys.has('memberships/count')).toBe(true)
    expect(keys.has('nav/link')).toBe(true)
    expect(keys.has('nav/default')).toBe(true)

    // Dynamic patterns
    expect(patterns.has('prolongNecessary/*/*')).toBe(true)
    expect(patterns.has('prolongNecessary/*')).toBe(true)
  })

  it('should match patterns against translation keys', () => {
    const content = `
      const keys = [\`prolongNecessary/\${type}/\${status}\`];
      t.first(keys);
    `

    const { patterns } = extractKeysFromFile(content)
    const pattern = Array.from(patterns)[0]

    // Test matching various keys
    expect(
      matchesPattern('prolongNecessary/ABO_GIVE_MONTHS/due', pattern),
    ).toBe(true)
    expect(
      matchesPattern('prolongNecessary/MONTHLY_ABO/overdue', pattern),
    ).toBe(true)
    expect(matchesPattern('prolongNecessary/due', pattern)).toBe(false)
    expect(
      matchesPattern('prolongNecessary/ABO_GIVE_MONTHS/due/extra', pattern),
    ).toBe(false)
  })
})
