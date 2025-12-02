/**
 * Utility functions for translation cleanup
 * Extracted for testing purposes
 */

/**
 * Extract quoted strings from a pattern match
 */
function extractQuotedStrings(text) {
  const strings = [];
  
  // Match single quotes
  const singleQuoteRegex = /'([^'\\]*(\\.[^'\\]*)*)'/g;
  let match;
  while ((match = singleQuoteRegex.exec(text)) !== null) {
    strings.push(match[1]);
  }
  
  // Match double quotes
  const doubleQuoteRegex = /"([^"\\]*(\\.[^"\\]*)*)"/g;
  while ((match = doubleQuoteRegex.exec(text)) !== null) {
    strings.push(match[1]);
  }
  
  // Match backticks (template literals)
  const backtickRegex = /`([^`\\]*(\\.[^`\\]*)*)`/g;
  while ((match = backtickRegex.exec(text)) !== null) {
    // Only include if it doesn't contain ${} interpolation
    if (!match[1].includes('${')) {
      strings.push(match[1]);
    }
  }
  
  return strings;
}

/**
 * Extract dynamic key patterns from template literals
 * E.g., `base/${variable}` -> 'base/*'
 */
function extractDynamicPattern(templateString) {
  // Replace ${...} with * to create a pattern
  return templateString.replace(/\$\{[^}]+\}/g, '*');
}

/**
 * Check if a key matches a dynamic pattern
 * E.g., 'base/value' matches 'base/*'
 */
function matchesPattern(key, pattern) {
  const regexPattern = pattern
    .split('*')
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]+');
  return new RegExp(`^${regexPattern}$`).test(key);
}

/**
 * Read file content and extract translation keys from it
 */
function extractKeysFromFile(content, verbose = false) {
  try {
    const keys = new Set();
    const patterns = new Set();
    
    // Pattern 1: Basic usage - t('key')
    const basicPattern = /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = basicPattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
    
    // Pattern 2: t.elements('key')
    const elementsPattern = /\bt\.elements\s*\(\s*['"`]([^'"`]+)['"`]/g;
    while ((match = elementsPattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
    
    // Pattern 3: t.first([...])
    const firstPattern = /\bt\.first\s*\(\s*\[([^\]]+)\]/g;
    while ((match = firstPattern.exec(content)) !== null) {
      const arrayContent = match[1];
      extractQuotedStrings(arrayContent).forEach(key => keys.add(key));
    }
    
    // Pattern 4: t.first.elements([...])
    const firstElementsPattern = /\bt\.first\.elements\s*\(\s*\[([^\]]+)\]/g;
    while ((match = firstElementsPattern.exec(content)) !== null) {
      const arrayContent = match[1];
      extractQuotedStrings(arrayContent).forEach(key => keys.add(key));
    }
    
    // Pattern 5: t.pluralize('base')
    const pluralizePattern = /\bt\.pluralize\s*\(\s*['"`]([^'"`]+)['"`]/g;
    while ((match = pluralizePattern.exec(content)) !== null) {
      keys.add(match[1]); // Add the base key
    }
    
    // Pattern 6: t.pluralize.elements('base')
    const pluralizeElementsPattern = /\bt\.pluralize\.elements\s*\(\s*['"`]([^'"`]+)['"`]/g;
    while ((match = pluralizeElementsPattern.exec(content)) !== null) {
      keys.add(match[1]); // Add the base key
    }
    
    // Pattern 7: Template literals with ${} - dynamic keys
    // Match: t(`base/${variable}`) or t.first([`base/${var}`])
    const templateLiteralPattern = /\bt[.\w]*\s*\(\s*[`]([^`]*\$\{[^`]+)[`]/g;
    while ((match = templateLiteralPattern.exec(content)) !== null) {
      const pattern = extractDynamicPattern(match[1]);
      patterns.add(pattern);
    }
    
    // Pattern 8: Template literals in arrays (for t.first, etc.)
    const templateInArrayPattern = /\bt\.[^\s(]*\s*\(\s*\[([^\]]*`[^`]*\$\{[^\]]+)\]/g;
    while ((match = templateInArrayPattern.exec(content)) !== null) {
      const arrayContent = match[1];
      // Extract all template literals from the array
      const templateRegex = /`([^`]*\$\{[^`]+)`/g;
      let templateMatch;
      while ((templateMatch = templateRegex.exec(arrayContent)) !== null) {
        const pattern = extractDynamicPattern(templateMatch[1]);
        patterns.add(pattern);
      }
    }
    
    // Pattern 9: Variable usage with t() - detect when variables are passed
    // This catches cases like: const keys = [...]; t.first(keys)
    const variablePattern = /\bt[.\w]*\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = variablePattern.exec(content)) !== null) {
      const varName = match[1];
      // Look backwards in the file to find where this variable is defined
      // and extract template literals from it
      const varDefPattern = new RegExp(`(?:const|let|var)\\s+${varName}\\s*=\\s*\\[([^\\]]+)\\]`, 's');
      const varDefMatch = varDefPattern.exec(content);
      if (varDefMatch) {
        const arrayContent = varDefMatch[1];
        // Check for template literals in the array definition
        const templateRegex = /`([^`]*\$\{[^`]+)`/g;
        let templateMatch;
        while ((templateMatch = templateRegex.exec(arrayContent)) !== null) {
          const pattern = extractDynamicPattern(templateMatch[1]);
          patterns.add(pattern);
        }
      }
    }
    
    return { keys, patterns };
  } catch (error) {
    if (verbose) {
      console.warn(`Warning: Could not process content: ${error.message}`);
    }
    return { keys: new Set(), patterns: new Set() };
  }
}

/**
 * Check if a pluralization key is used
 * Keys like "base/0", "base/1", "base/other" are used if "base" is found in t.pluralize
 */
function isPluralizationKey(key, baseKeys) {
  const match = key.match(/^(.+)\/([\d]+|other)$/);
  if (!match) {
    return false;
  }
  const baseKey = match[1];
  return baseKeys.has(baseKey);
}

module.exports = {
  extractQuotedStrings,
  extractDynamicPattern,
  matchesPattern,
  extractKeysFromFile,
  isPluralizationKey,
};

