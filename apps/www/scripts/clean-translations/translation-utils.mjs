/**
 * ES Module wrapper for translation-utils.js
 * This allows importing CommonJS utilities in ES modules
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const utils = require('./translation-utils.js');

export const {
  extractQuotedStrings,
  extractDynamicPattern,
  matchesPattern,
  extractKeysFromFile,
  isPluralizationKey,
} = utils;

