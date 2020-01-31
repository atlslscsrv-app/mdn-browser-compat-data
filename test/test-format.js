// ESM dependencies:
import { execSync } from 'child_process';

// CommonJS dependencies:
import chalk from 'chalk';

export default () => {
  try {
    execSync('npx prettier --check "**/*.js" "**/*.ts" "**/*.md"', {
      stdio: 'inherit',
    });
  } catch (err) {
    let errorText = err.stdout.toString();
    console.error(chalk`{red   Prettier – formatting errors:}`);
    console.error(chalk`{red.bold ${errorText}}`);
    console.error(
      chalk`{blue Tip: Run {bold npm run fix} to fix formatting automatically}`,
    );

    return true;
  }

  return false;
};
