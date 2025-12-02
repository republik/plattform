#!/usr/bin/env node

/**
 * Script to identify and remove unused translation keys from translations.json
 * 
 * This script handles:
 * - Basic usage: t('key')
 * - First match: t.first(['key1', 'key2'])
 * - Pluralization: t.pluralize('base', {count: n}) -> looks for base/n and base/other
 * - Elements versions: t.elements(), t.first.elements(), t.pluralize.elements()
 * 
 * Usage:
 *   node scripts/clean-translations.mjs              # Dry run - shows unused keys
 *   node scripts/clean-translations.mjs --remove     # Actually removes unused keys
 *   node scripts/clean-translations.mjs --verbose    # Shows detailed analysis
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  extractDynamicPattern,
  matchesPattern,
  extractKeysFromFile as extractKeysFromFileContent,
  isPluralizationKey as checkPluralizationKey,
} from './translation-utils.mjs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TRANSLATIONS_FILE = path.join(__dirname, '../lib/translations.json');
const SEARCH_DIR = path.join(__dirname, '..');
const EXCLUDED_DIRS = ['node_modules', '.next', 'out', 'scripts'];

// Parse command line arguments
const args = process.argv.slice(2);
const shouldRemove = args.includes('--remove');
const verbose = args.includes('--verbose');
const helpRequested = args.includes('--help') || args.includes('-h');

if (helpRequested) {
  console.log(`
Usage: node scripts/clean-translations.mjs [options]

Options:
  --remove    Actually remove unused translations (default: dry run)
  --verbose   Show detailed analysis including where keys are used
  --help, -h  Show this help message

Examples:
  node scripts/clean-translations.mjs              # Dry run
  node scripts/clean-translations.mjs --remove     # Remove unused keys
  node scripts/clean-translations.mjs --verbose    # Detailed output
`);
  process.exit(0);
}

console.log('🔍 Starting translation cleanup analysis...\n');

// Read translations
const translationsData = JSON.parse(fs.readFileSync(TRANSLATIONS_FILE, 'utf-8'));
const translations = translationsData.data;

console.log(`📚 Total translation keys: ${translations.length}`);

// Create a map of all translation keys
const allKeys = new Set(translations.map(t => t.key));

// Track which keys are used
const usedKeys = new Set();
const keyUsageDetails = new Map(); // For verbose output
const dynamicPatterns = new Set(); // Track dynamic key patterns
const dynamicPatternUsage = new Map(); // Track where patterns are used

/**
 * Search for translation key usage in the codebase
 */
function searchInCodebase(pattern, description) {
  if (verbose) {
    console.log(`\n🔎 Searching for: ${description}`);
  }
  
  try {
    // Use ripgrep (rg) if available, otherwise fall back to grep
    let cmd;
    try {
      execSync('which rg', { stdio: 'ignore' });
      cmd = `rg --type-add 'source:*.{js,jsx,ts,tsx,json}' -t source -l '${pattern}' ${SEARCH_DIR}`;
    } catch {
      cmd = `grep -r -l --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.json" '${pattern}' ${SEARCH_DIR}`;
    }
    
    // Add exclusions
    EXCLUDED_DIRS.forEach(dir => {
      cmd += ` | grep -v '/${dir}/'`;
    });
    
    const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    // No matches found
    return [];
  }
}

/**
 * Read file and extract translation keys from it
 */
function extractKeysFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractKeysFromFileContent(content, verbose);
  } catch (error) {
    if (verbose) {
      console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    }
    return { keys: new Set(), patterns: new Set() };
  }
}

/**
 * Get all source files recursively
 */
function getAllSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDED_DIRS.includes(file)) {
        getAllSourceFiles(filePath, fileList);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('🔎 Scanning codebase for translation usage...\n');

// Get all source files
const sourceFiles = getAllSourceFiles(SEARCH_DIR);
console.log(`📁 Found ${sourceFiles.length} source files to analyze`);

// Track pluralization base keys
const pluralizeBaseKeys = new Set();

// Analyze each file
let filesAnalyzed = 0;
sourceFiles.forEach(filePath => {
  const { keys, patterns } = extractKeysFromFile(filePath);
  const relativePath = path.relative(SEARCH_DIR, filePath);
  
  keys.forEach(key => {
    usedKeys.add(key);
    
    // Track pluralize base keys separately
    if (filePath.includes('t.pluralize')) {
      pluralizeBaseKeys.add(key);
    }
    
    if (verbose) {
      if (!keyUsageDetails.has(key)) {
        keyUsageDetails.set(key, new Set());
      }
      keyUsageDetails.get(key).add(relativePath);
    }
  });
  
  // Track dynamic patterns
  patterns.forEach(pattern => {
    dynamicPatterns.add(pattern);
    if (!dynamicPatternUsage.has(pattern)) {
      dynamicPatternUsage.set(pattern, new Set());
    }
    dynamicPatternUsage.get(pattern).add(relativePath);
  });
  
  filesAnalyzed++;
  if (filesAnalyzed % 50 === 0) {
    process.stdout.write(`\r📊 Analyzed ${filesAnalyzed}/${sourceFiles.length} files...`);
  }
});

console.log(`\r📊 Analyzed ${filesAnalyzed}/${sourceFiles.length} files    \n`);

// Apply dynamic patterns to mark matching keys as used
if (dynamicPatterns.size > 0) {
  console.log(`🔍 Found ${dynamicPatterns.size} dynamic key pattern(s), matching against translations...\n`);
  
  let dynamicMatchCount = 0;
  translations.forEach(({ key }) => {
    if (!usedKeys.has(key)) {
      // Check if this key matches any dynamic pattern
      for (const pattern of dynamicPatterns) {
        if (matchesPattern(key, pattern)) {
          usedKeys.add(key);
          dynamicMatchCount++;
          if (verbose) {
            console.log(`✅ ${key} (matched dynamic pattern: ${pattern})`);
          }
          break;
        }
      }
    }
  });
  
  if (dynamicMatchCount > 0) {
    console.log(`✅ Marked ${dynamicMatchCount} additional key(s) as used via dynamic patterns\n`);
  }
}

/**
 * Check if a pluralization key is used
 * Keys like "base/0", "base/1", "base/other" are used if "base" is found in t.pluralize
 */
function isPluralizationKeyUsed(key) {
  return checkPluralizationKey(key, usedKeys);
}

// Find unused keys
const unusedKeys = [];
translations.forEach(({ key, value }) => {
  if (!usedKeys.has(key)) {
    // Check if it's a pluralization key
    if (!isPluralizationKeyUsed(key)) {
      unusedKeys.push({ key, value });
    } else {
      // Mark as used because the base key is used in t.pluralize
      usedKeys.add(key);
      if (verbose) {
        console.log(`✅ ${key} (used via pluralization)`);
      }
    }
  }
});

// Report results
console.log('\n' + '='.repeat(80));
console.log('📊 RESULTS');
console.log('='.repeat(80));
console.log(`\n✅ Used keys: ${usedKeys.size}`);
console.log(`❌ Unused keys: ${unusedKeys.length}`);
console.log(`🔧 Dynamic patterns detected: ${dynamicPatterns.size}`);
console.log(`📈 Usage rate: ${((usedKeys.size / translations.length) * 100).toFixed(2)}%\n`);

if (unusedKeys.length > 0) {
  console.log('🗑️  UNUSED TRANSLATION KEYS:\n');
  console.log('Key'.padEnd(60) + ' Value');
  console.log('-'.repeat(120));
  
  unusedKeys.slice(0, 50).forEach(({ key, value }) => {
    const truncatedValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
    console.log(key.padEnd(60) + ' ' + truncatedValue);
  });
  
  if (unusedKeys.length > 50) {
    console.log(`\n... and ${unusedKeys.length - 50} more unused keys`);
  }
  
  if (shouldRemove) {
    console.log('\n🗑️  Removing unused translations...');
    
    // Filter out unused keys
    const usedTranslations = translations.filter(t => usedKeys.has(t.key));
    
    // Create backup
    const backupFile = TRANSLATIONS_FILE + '.backup';
    fs.copyFileSync(TRANSLATIONS_FILE, backupFile);
    console.log(`📦 Backup created: ${path.basename(backupFile)}`);
    
    // Write cleaned translations
    const cleanedData = {
      ...translationsData,
      data: usedTranslations
    };
    
    fs.writeFileSync(
      TRANSLATIONS_FILE,
      JSON.stringify(cleanedData, null, 2) + '\n',
      'utf-8'
    );
    
    console.log(`✅ Removed ${unusedKeys.length} unused translations`);
    console.log(`📚 Remaining translations: ${usedTranslations.length}`);
    console.log(`💾 File saved: ${path.basename(TRANSLATIONS_FILE)}`);
  } else {
    console.log('\n💡 TIP: Run with --remove flag to actually remove these keys');
    console.log('   Example: node scripts/clean-translations.mjs --remove');
  }
} else {
  console.log('🎉 No unused translations found! Your translations file is clean.\n');
}

// Report dynamic patterns
if (dynamicPatterns.size > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 DYNAMIC KEY PATTERNS DETECTED');
  console.log('='.repeat(80) + '\n');
  console.log('The following dynamic patterns were found (keys matching these are marked as used):\n');
  
  for (const pattern of dynamicPatterns) {
    const files = dynamicPatternUsage.get(pattern);
    console.log(`📌 Pattern: ${pattern}`);
    console.log(`   Found in ${files.size} file(s):`);
    Array.from(files).slice(0, 3).forEach(file => {
      console.log(`   - ${file}`);
    });
    if (files.size > 3) {
      console.log(`   ... and ${files.size - 3} more`);
    }
    
    // Show matching keys (sample)
    const matchingKeys = translations
      .map(t => t.key)
      .filter(key => matchesPattern(key, pattern))
      .slice(0, 5);
    
    if (matchingKeys.length > 0) {
      console.log(`   Matching keys (${matchingKeys.length} shown):`);
      matchingKeys.forEach(key => {
        console.log(`   ✓ ${key}`);
      });
    }
    console.log();
  }
  
  console.log('💡 These keys are kept because they match dynamic patterns.');
  console.log('   Review the files above to ensure the patterns are correct.\n');
}

if (verbose && keyUsageDetails.size > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('📝 DETAILED USAGE (sample)');
  console.log('='.repeat(80) + '\n');
  
  let count = 0;
  for (const [key, files] of keyUsageDetails.entries()) {
    if (count >= 10) break;
    console.log(`🔑 ${key}`);
    console.log(`   Used in ${files.size} file(s):`);
    Array.from(files).slice(0, 3).forEach(file => {
      console.log(`   - ${file}`);
    });
    if (files.size > 3) {
      console.log(`   ... and ${files.size - 3} more`);
    }
    console.log();
    count++;
  }
}

console.log('✨ Analysis complete!\n');

