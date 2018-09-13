const debug = require('debug')('platziverse:db:setup');
const inquirer = require('inquirer');
const minimist = require('minimist');
const db = require('./');

const { config, handleFatalError } = require('platziverse-utils');
const args = minimist(process.argv);
const prompt = inquirer.createPromptModule();

async function setup() {
  if (!args.yes) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ]);

    if (!answer.setup) {
      return console.log('Nothing happend :)');
    }
  }

  await db({ ...config.db, setup: true }).catch(handleFatalError);
  console.log('Success!');
  process.exit(0);

}

setup();