#!/usr/bin/env node

const args = require('args');

args
  .option('port', 'The port on which the app will be running', 3000)
  .option('reload', 'Enable/disable livereloading')
  .command('serve', 'Serve your static site', ['s'])
  .command('otro', 'Otra opcion');

const flags = args.parse(process.argv);

