const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function getPorts(domain) {
  const openPorts = [];
  const commonPorts = [80, 443, 8080, 8443, 3306, 5432, 22, 21, 25, 110, 143, 3389];

  try {
    try {
      const { stdout } = await execAsync(
        `nmap -p ${commonPorts.join(',')} --open -T4 ${domain}`,
        { timeout: 15000 }
      );

      const lines = stdout.split('\n');
      lines.forEach((line) => {
        const match = line.match(/(\d+)\/tcp\s+open\s+(\w+)/);
        if (match) {
          openPorts.push({
            port: parseInt(match[1]),
            service: match[2],
          });
        }
      });
    } catch (nmapError) {
      await basicPortCheck(domain, commonPorts, openPorts);
    }
  } catch (error) {
    await basicPortCheck(domain, commonPorts, openPorts);
  }

  return openPorts;
}

async function basicPortCheck(domain, ports, results) {
  const net = require('net');

  for (const port of ports) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection(
          { host: domain, port, timeout: 2000 },
          () => {
            results.push({
              port,
              service: getServiceName(port),
              status: 'open',
            });
            socket.destroy();
            resolve();
          }
        );

        socket.on('error', () => {
          reject(new Error('Connection refused'));
        });

        socket.on('timeout', () => {
          reject(new Error('Timeout'));
        });
      });
    } catch (error) {
      // Port closed or unreachable, continue
    }
  }
}

function getServiceName(port) {
  const services = {
    21: 'FTP',
    22: 'SSH',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    8080: 'HTTP-Proxy',
    8443: 'HTTPS-Alt',
  };

  return services[port] || 'Unknown';
}

module.exports = { getPorts };
