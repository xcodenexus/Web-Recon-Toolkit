#!/usr/bin/env node

const { hideBin } = require('yargs/helpers');
const scan = require('../src/commands/scan');

require('yargs')(hideBin(process.argv))
  .command(
    'scan <domain>',
    'Scan a domain for subdomains, emails, tech stack, and open ports',
    (yargs) => {
      return yargs
        .positional('domain', {
          describe: 'Target domain to scan (e.g., example.com)',
          type: 'string',
        })
        .option('output', {
          alias: 'o',
          describe: 'Output format: json or table',
          default: 'table',
          type: 'string',
        })
        .option('ports', {
          describe: 'Enable port scanning (use --no-ports to skip)',
          type: 'boolean',
          default: true,
        });
    },
    async (argv) => {
      try {
        await scan(argv.domain, {
          format: argv.output,
          skipPorts: !argv.ports,
        });
      } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
      }
    }
  )
  .alias('h', 'help')
  .alias('v', 'version')
  .version('1.0.0')
  .strict()
  .demandCommand()
  .showHelpOnFail(true)
  .parse();
