'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { platform } = require('os');
const chalk = require('chalk');

/**
 * @typedef {object} Logger
 * @property {(...message: unknown[]) => void} error
 *
 * @typedef {[number, number] | [null, null]} Pos
 */

/** @type {{readonly [char: string]: string}} */
const INVISIBLES_MAP = Object.freeze(
  Object.assign(Object.create(null), {
    '\0': '\\0', // ␀ (0x00)
    '\b': '\\b', // ␈ (0x08)
    '\t': '\\t', // ␉ (0x09)
    '\n': '\\n', // ␊ (0x0A)
    '\v': '\\v', // ␋ (0x0B)
    '\f': '\\f', // ␌ (0x0C)
    '\r': '\\r', // ␍ (0x0D)
  }),
);
exports.INVISIBLES_MAP = INVISIBLES_MAP;

const INVISIBLES_REGEXP = /[\0\x08-\x0D]/g;
exports.INVISIBLES_REGEXP = INVISIBLES_REGEXP;

/** Used to check if the process is running in a CI environment. */
const IS_CI = process.env.CI && String(process.env.CI).toLowerCase() === 'true';
exports.IS_CI = IS_CI;

/** Determines if the OS is Windows */
const IS_WINDOWS = platform() === 'win32';
exports.IS_WINDOWS = IS_WINDOWS;

/**
 * Escapes common invisible characters.
 *
 * @param {string} str
 */
function escapeInvisibles(str) {
  // This should now be O(n) instead of O(n*m),
  // where n = string length; m = invisible characters
  return INVISIBLES_REGEXP[Symbol.replace](str, char => {
    return INVISIBLES_MAP[char] || char;
  });
}
exports.escapeInvisibles = escapeInvisibles;

/**
 * Gets the row and column matching the index in a string.
 *
 * @param {string} str
 * @param {number} index
 * @return {Pos}
 */
function indexToPosRaw(str, index) {
  let line = 1,
    col = 1;
  let prevChar = null;

  if (
    typeof str !== 'string' ||
    typeof index !== 'number' ||
    index > str.length
  ) {
    return [null, null];
  }

  for (let i = 0; i < index; i++) {
    const char = str[i];
    switch (char) {
      case '\n':
        if (prevChar === '\r') break;
      case '\r':
        line++;
        col = 1;
        break;
      case '\t':
        // Use JSON `tab_size` value from `.editorconfig`
        col += 2;
        break;
      default:
        col++;
        break;
    }
    prevChar = char;
  }

  return [line, col];
}
exports.indexToPosRaw = indexToPosRaw;

/**
 * Gets the row and column matching the index in a string and formats it.
 *
 * @param {string} str
 * @param {number} index
 * @return {string} The line and column in the form of: `"(Ln <ln>, Col <col>)"`
 */
function indexToPos(str, index) {
  return formatPos(indexToPosRaw(str, index));
}
exports.indexToPos = indexToPos;

/**
 * Applies default formatting to the position tuple.
 *
 * @param {Readonly<[any, any]>} pos
 * @return {string} The line and column in the form of: `"(Ln <ln>, Col <col>)"`
 */
function formatPos(pos) {
  if (!pos || pos.length !== 2) {
    throw new TypeError('pos must be a tuple with a length of 2');
  }
  return `(Ln ${pos[0]}, Col ${pos[1]})`;
}
exports.formatPos = formatPos;

/**
 * @param {string} actual
 * @param {string} expected
 * @return {string}
 */
function jsonDiff(actual, expected) {
  const actualLines = actual.split(/\n/);
  const expectedLines = expected.split(/\n/);

  for (let i = 0; i < actualLines.length; i++) {
    if (actualLines[i] !== expectedLines[i]) {
      return chalk`{bold line #${i + 1}}
    {yellow Actual:   {bold ${escapeInvisibles(actualLines[i])}}}
    {green Expected: {bold ${escapeInvisibles(expectedLines[i])}}}`;
    }
  }
}
exports.jsonDiff = jsonDiff;
