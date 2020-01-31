// ESM dependencies:
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// CommonJS dependencies:
import chalk from 'chalk';

// CommonJS 'globals':
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Use `fs.readFileSync` and `JSON.parse`
const require = createRequire(import.meta.url);

/**
 * @typedef {import('../../types').Identifier} Identifier
 */

/**
 * @param {Identifier} data
 * @param {string} category
 * @param {string[]} errors
 * @param {string} prefix
 * @param {string} [path]
 */
function checkPrefix(data, category, errors, prefix, path = '') {
  for (const key in data) {
    if (key === 'prefix' && typeof data[key] === 'string') {
      if (data[key].includes(prefix)) {
        const error = chalk`{red → {bold ${prefix}} prefix is wrong for key: {bold ${path}}}`;
        const rules = [
          category == 'api' && !data[key].startsWith(prefix),
          category == 'css' && !data[key].startsWith(`-${prefix}`),
        ];
        if (rules.some(x => x === true)) {
          errors.push(error);
        }
      }
    } else {
      if (typeof data[key] === 'object') {
        const curr_path = path.length > 0 ? `${path}.${key}` : key;
        checkPrefix(data[key], category, errors, prefix, curr_path);
      }
    }
  }
  return errors;
}

/**
 * @param {Identifier} data
 * @param {string} category
 * @return {string[]}
 */
function processData(data, category) {
  let errors = [];
  let prefixes = [];

  if (category === 'api') {
    prefixes = ['moz', 'Moz', 'webkit', 'WebKit', 'webKit', 'ms', 'MS'];
  }
  if (category === 'css') {
    prefixes = ['webkit', 'moz', 'ms'];
  }

  for (const prefix of prefixes) {
    checkPrefix(data, category, errors, prefix);
  }
  return errors;
}

/**
 * @param {string} filename
 */
export default function testPrefix(filename) {
  const relativePath = path.relative(
    path.resolve(__dirname, '..', '..'),
    filename,
  );
  const category =
    relativePath.includes(path.sep) && relativePath.split(path.sep)[0];
  const data = require(filename);
  const errors = processData(data, category);

  if (errors.length) {
    console.error(
      chalk`{red   Prefix – {bold ${errors.length}} ${
        errors.length === 1 ? 'error' : 'errors'
      }:}`,
    );
    for (const error of errors) {
      console.error(`  ${error}`);
    }
    return true;
  }
  return false;
}
