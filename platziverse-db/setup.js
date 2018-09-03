const debug = require('debug')('platziverse:db:setup');
const inquirer = require('inquirer');
const db = require('./');

const { config, handleFatalError } = require('platziverse-utils');

const prompt = inquirer.createPromptModule();

async function setup() {
  switch (process.argv[2]) {
    case 'yes': {
      configDatabase();
      break;
    }
    default: {
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
      configDatabase();
    }
  }

  async function configDatabase() {
    await db({ ...config.db, setup: true }).catch(handleFatalError);
    console.log('Success!');
    process.exit(0);
  }
}

setup();