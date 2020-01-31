// ESM dependencies:
import { createRequire } from 'module';

// CommonJS dependencies:
import Ajv from 'ajv';
import betterAjvErrors from 'better-ajv-errors';
import chalk from 'chalk';

// TODO: Use `fs.readFileSync` and `JSON.parse`
const require = createRequire(import.meta.url);

const ajv = new Ajv({ jsonPointers: true, allErrors: true });

/**
 * @param {string} dataFilename
 * @param {string} [schemaFilename]
 */
export default function testSchema(
  dataFilename,
  schemaFilename = './../../schemas/compat-data.schema.json',
) {
  const schema = require(schemaFilename);
  const data = require(dataFilename);

  const valid = ajv.validate(schema, data);

  if (!valid) {
    console.error(
      chalk`{red   JSON Schema – {bold ${ajv.errors.length}} ${
        ajv.errors.length === 1 ? 'error' : 'errors'
      }:}`,
    );
    // Output messages by one since better-ajv-errors wrongly joins messages
    // (see https://github.com/atlassian/better-ajv-errors/pull/21)
    ajv.errors.forEach(e => {
      console.error(betterAjvErrors(schema, data, [e], { indent: 2 }));
    });
    return true;
  }
  return false;
}
