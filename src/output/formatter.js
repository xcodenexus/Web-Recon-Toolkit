const chalk = require('chalk');
const { table } = require('table');

function formatOutput(results, format = 'table') {
  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const { domain, modules } = results;

  console.log(chalk.bold.cyan(`\n📊 Reconnaissance Report: ${domain}\n`));

  // Subdomains
  if (modules.subdomains && modules.subdomains.length > 0) {
    console.log(chalk.bold.yellow('🌐 Subdomains:'));
    const subdomainTable = [['#', 'Subdomain']];
    modules.subdomains.slice(0, 15).forEach((sub, idx) => {
      subdomainTable.push([idx + 1, sub]);
    });
    if (modules.subdomains.length > 15) {
      subdomainTable.push(['...', `+${modules.subdomains.length - 15} more`]);
    }
    console.log(table(subdomainTable) + '\n');
  }

  // DNS Records
  if (modules.dns && Object.keys(modules.dns).length > 0) {
    console.log(chalk.bold.yellow('📋 DNS Records:'));
    const dnsTable = [['Type', 'Value']];

    Object.entries(modules.dns).forEach(([type, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        values.slice(0, 3).forEach((val, idx) => {
          dnsTable.push([idx === 0 ? type : '', Array.isArray(val) ? val.join('') : val]);
        });
        if (values.length > 3) {
          dnsTable.push(['', `+${values.length - 3} more`]);
        }
      }
    });

    console.log(table(dnsTable) + '\n');
  }

  // Tech Stack
  if (modules.tech && modules.tech.length > 0) {
    console.log(chalk.bold.yellow('🔧 Technology Stack:'));
    const techTable = [['Name', 'Category', 'Version']];
    modules.tech.forEach((tech) => {
      techTable.push([
        tech.name || 'Unknown',
        tech.category || 'Unknown',
        tech.version || 'Unknown',
      ]);
    });
    console.log(table(techTable) + '\n');
  }

  // Emails
  if (modules.emails && modules.emails.length > 0) {
    console.log(chalk.bold.yellow('📧 Email Patterns & Addresses:'));
    const emailTable = [['Email/Pattern', 'Name', 'Position']];
    modules.emails.slice(0, 10).forEach((email) => {
      if (typeof email === 'object') {
        emailTable.push([
          email.email || email.pattern || 'N/A',
          `${email.firstName || ''} ${email.lastName || ''}`.trim() || 'N/A',
          email.position || email.confidence || 'N/A',
        ]);
      }
    });
    if (modules.emails.length > 10) {
      emailTable.push(['...', `+${modules.emails.length - 10} more`, '']);
    }
    console.log(table(emailTable) + '\n');
  }

  // Open Ports
  if (modules.ports && modules.ports.length > 0) {
    console.log(chalk.bold.yellow('🔓 Open Ports:'));
    const portsTable = [['Port', 'Service', 'Status']];
    modules.ports.forEach((port) => {
      portsTable.push([
        port.port.toString(),
        port.service || 'Unknown',
        port.status || 'open',
      ]);
    });
    console.log(table(portsTable) + '\n');
  }

  // Summary
  console.log(chalk.bold.blue('📈 Summary:'));
  const summaryTable = [
    ['Metric', 'Count'],
    ['Subdomains', modules.subdomains ? modules.subdomains.length : 0],
    ['Technologies', modules.tech ? modules.tech.length : 0],
    ['Email Patterns', modules.emails ? modules.emails.length : 0],
    ['Open Ports', modules.ports ? modules.ports.length : 0],
  ];
  console.log(table(summaryTable) + '\n');
}

module.exports = { formatOutput };
