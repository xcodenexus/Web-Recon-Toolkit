const chalk = require('chalk');

const CONSTANTS = {
  VERSION: '1.0.0',
  TIMEOUT: 5000,
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

function log(type, message) {
  const types = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✓'),
    error: chalk.red('✗'),
    warn: chalk.yellow('⚠'),
  };

  console.log(`${types[type] || type} ${message}`);
}

function sanitizeDomain(domain) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .split('/')[0];
}

function isValidDomain(domain) {
  const domainRegex =
    /^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$/i;
  return domainRegex.test(domain);
}

module.exports = {
  CONSTANTS,
  log,
  sanitizeDomain,
  isValidDomain,
};
