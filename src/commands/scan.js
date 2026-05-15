const chalk = require('chalk');
const ora = require('ora');
const { formatOutput } = require('../output/formatter');

const { getSubdomains } = require('../modules/subdomain');
const { getDNSRecords } = require('../modules/dns');
const { getTechStack } = require('../modules/tech');
const { getEmails } = require('../modules/emails');
const { getPorts } = require('../modules/ports');

async function scan(domain, options = {}) {
  const { format = 'table', skipPorts = false } = options;

  console.log(chalk.blue.bold('\n🔍 Web Recon Toolkit v1.0.0'));
  console.log(chalk.gray(`Target: ${domain}\n`));

  const results = {
    domain,
    timestamp: new Date().toISOString(),
    modules: {},
  };

  // Module 1: Subdomains
  let spinner = ora('Scanning subdomains...').start();
  try {
    results.modules.subdomains = await getSubdomains(domain);
    spinner.succeed(`Found ${results.modules.subdomains.length} subdomains`);
  } catch (error) {
    spinner.warn(`Subdomains: ${error.message}`);
    results.modules.subdomains = [];
  }

  // Module 2: DNS Records
  spinner = ora('Fetching DNS records...').start();
  try {
    results.modules.dns = await getDNSRecords(domain);
    spinner.succeed(`Retrieved DNS records`);
  } catch (error) {
    spinner.warn(`DNS: ${error.message}`);
    results.modules.dns = {};
  }

  // Module 3: Tech Stack
  spinner = ora('Detecting tech stack...').start();
  try {
    results.modules.tech = await getTechStack(domain);
    spinner.succeed(`Identified ${results.modules.tech.length} technologies`);
  } catch (error) {
    spinner.warn(`Tech stack: ${error.message}`);
    results.modules.tech = [];
  }

  // Module 4: Emails
  spinner = ora('Enumerating emails...').start();
  try {
    results.modules.emails = await getEmails(domain);
    spinner.succeed(`Found ${results.modules.emails.length} email patterns`);
  } catch (error) {
    spinner.warn(`Emails: ${error.message}`);
    results.modules.emails = [];
  }

  // Module 5: Ports (optional)
  if (!skipPorts) {
    spinner = ora('Scanning common ports...').start();
    try {
      results.modules.ports = await getPorts(domain);
      spinner.succeed(`Port scan complete`);
    } catch (error) {
      spinner.warn(`Ports: ${error.message}`);
      results.modules.ports = [];
    }
  } else {
    results.modules.ports = [];
  }

  // Format and output results
  console.log('\n' + chalk.blue.bold('═'.repeat(50)));
  formatOutput(results, format);
  console.log(chalk.blue.bold('═'.repeat(50)) + '\n');

  // Save JSON output
  const fs = require('fs');
  const filename = `wrt-${domain}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(chalk.gray(`📄 Full results saved to: ${filename}\n`));

  return results;
}

module.exports = scan;
