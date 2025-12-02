# Translation Cleanup Script

This directory contains maintenance scripts for the www application.

## clean-translations.mjs

A script to identify and remove unused translation keys from `lib/translations.json`.

### Features

The script intelligently detects translation usage including:

- **Basic usage**: `t('some/key')`
- **Elements with replacements**: `t.elements('key', {var: value})`
- **First match**: `t.first(['key1', 'key2'])` - marks all keys in the array as used
- **Pluralization**: `t.pluralize('base/key', {count: 5})` - automatically detects keys like `base/key/5`, `base/key/other`
- **Combined methods**: `t.first.elements()`, `t.pluralize.elements()`
- **Dynamic patterns**: Template literals like `` t(`base/${variable}`) `` - creates patterns and matches all keys with that structure

### Usage

```bash
# Dry run - see what would be removed (recommended first step)
node scripts/clean-translations.mjs

# Show detailed analysis
node scripts/clean-translations.mjs --verbose

# Actually remove unused translations
node scripts/clean-translations.mjs --remove

# Show help
node scripts/clean-translations.mjs --help
```

### How It Works

1. **Reads all translation keys** from `lib/translations.json`
2. **Scans all source files** (`.js`, `.jsx`, `.ts`, `.tsx`) in the www directory
3. **Extracts translation key usage** using regex patterns that understand the translation API
4. **Handles special cases**:
   - For `t.pluralize('membership/type', {count: n})`, marks both `membership/type/n` and `membership/type/other` as used
   - For `t.first(['key1', 'key2'])`, marks all keys in the array as used
5. **Detects dynamic patterns**:
   - Finds template literals like `` t(`base/${variable}`) ``
   - Converts them to patterns like `base/*`
   - Marks all matching keys as used (e.g., `base/value1`, `base/value2`, etc.)
6. **Reports unused keys** and optionally removes them

### Safety Features

- **Dry run by default**: Shows what would be removed without making changes
- **Automatic backup**: Creates a `.backup` file before making any changes
- **Progress indicators**: Shows real-time progress during analysis
- **Detailed reporting**: Lists all unused keys before removal

### Output Example

```
🔍 Starting translation cleanup analysis...

📚 Total translation keys: 2014
🔎 Scanning codebase for translation usage...

📁 Found 865 source files to analyze
📊 Analyzed 865/865 files    

🔍 Found 227 dynamic key pattern(s), matching against translations...

✅ Marked 445 additional key(s) as used via dynamic patterns

================================================================================
📊 RESULTS
================================================================================

✅ Used keys: 1446
❌ Unused keys: 717
🔧 Dynamic patterns detected: 227
📈 Usage rate: 71.80%

🗑️  UNUSED TRANSLATION KEYS:

Key                                                          Value
------------------------------------------------------------------------------------------------------------------------
nav/searchLink                                               Spickzettel
nav/invite-friends                                           Verstärkung holen
...

💡 TIP: Run with --remove flag to actually remove these keys

================================================================================
🔧 DYNAMIC KEY PATTERNS DETECTED
================================================================================

The following dynamic patterns were found (keys matching these are marked as used):

📌 Pattern: prolongNecessary/*/*
   Found in 1 file(s):
   - components/Frame/ProlongBox.js
   Matching keys (5 shown):
   ✓ prolongNecessary/ABO_GIVE_MONTHS/due
   ✓ prolongNecessary/ABO_GIVE_MONTHS/overdue
   ...
```

### Best Practices

1. **Always run a dry run first** to review what will be removed
2. **Use version control**: Commit your changes before running with `--remove`
3. **Review the output**: Some keys might be used dynamically (constructed strings) - these will appear as "unused"
4. **Run periodically**: As part of regular maintenance to keep translations clean
5. **Test after removal**: Make sure your app still works correctly after removing translations

### Dynamic Pattern Detection

The script now handles dynamic key construction! When it encounters code like:

```javascript
const keys = [
  `prolongNecessary/${membership.type.name}/${key}`,
  `prolongNecessary/${key}`,
]
t.first(keys)
```

It will:
1. Extract the pattern: `prolongNecessary/*/*` and `prolongNecessary/*`
2. Match all translation keys against these patterns
3. Mark matching keys as used
4. Show you which patterns were detected and what files they're in

This works for:
- Template literals in `t()` calls
- Template literals in arrays passed to `t.first()` or similar
- Variables that are defined with template literals and then passed to translation functions

### Limitations

The script has minimal limitations:
- **Complex dynamic construction**: Keys built through complex logic (e.g., concatenation across multiple functions) may not be detected
- **Keys used in other apps**: Only scans the www directory (as intended)
- **Keys in comments**: Commented-out code that uses translations won't be marked as used

The dynamic pattern detection catches most real-world cases, but you should always review the unused list before removing keys.

### Technical Details

**Excluded directories**: `node_modules`, `.next`, `out`, `scripts`

**File types scanned**: `.js`, `.jsx`, `.ts`, `.tsx`

**Pattern matching**: Uses regex to find all variations of the translation API usage

### Examples

#### Check for unused translations (safe)
```bash
node scripts/clean-translations.mjs
```

#### See detailed information about key usage
```bash
node scripts/clean-translations.mjs --verbose
```

#### Clean up translations (makes changes)
```bash
# Review first
node scripts/clean-translations.mjs

# Then remove if satisfied
node scripts/clean-translations.mjs --remove
```

#### Example: How Dynamic Patterns Work

Given this code in `ProlongBox.js`:

```javascript
const key = numberOfDays < 0 ? 'overdue' : 'due'
const prefixTranslationKeys = [
  `prolongNecessary/${membership.type.name}/${key}`,
  `prolongNecessary/${key}`,
]
t.first.elements(prefixTranslationKeys, {...})
```

The script will:
1. Detect patterns: `prolongNecessary/*/*` and `prolongNecessary/*`
2. Match all keys like:
   - `prolongNecessary/ABO_GIVE_MONTHS/due` ✓
   - `prolongNecessary/ABO_GIVE_MONTHS/overdue` ✓
   - `prolongNecessary/due` ✓
   - `prolongNecessary/before` ✓
3. Mark them all as used, even though the exact keys aren't in the code

### Testing

Comprehensive Jest tests are included to verify all pattern detection functionality:

```bash
# Make sure you're using Node 20
nvm use 20

# Run the tests
yarn test scripts/__tests__/translation-utils.test.js
```

The test suite includes:
- **46 test cases** covering all extraction patterns
- Basic `t()` usage
- `t.first()`, `t.elements()`, `t.pluralize()` variations
- Dynamic template literal detection
- Real-world examples from your codebase
- Edge cases and integration tests

All tests should pass before using the cleanup script in production.

### Maintenance

This script should be run periodically (e.g., before major releases) to keep the translation file clean and manageable.

**Recommended workflow:**
1. Run tests to ensure detection works: `yarn test scripts/__tests__/translation-utils.test.js`
2. Run dry run to preview changes: `node scripts/clean-translations.mjs`
3. Review the output carefully
4. Commit current state to git
5. Run with `--remove` flag
6. Test your application
7. Commit the cleaned translations

