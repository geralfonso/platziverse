const chalk = require('chalk');

function handleFatalError(err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

function handleError(err) {
  console.error(`${chalk.red('[error]')} ${err.message}`);
  console.error(err.stack);
}

module.exports = {
  handleFatalError,
  handleError
};
