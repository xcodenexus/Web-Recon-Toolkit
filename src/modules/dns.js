const dns = require('dns').promises;

async function getDNSRecords(domain) {
  const records = {
    A: [],
    MX: [],
    TXT: [],
    NS: [],
  };

  try {
    try {
      records.A = await dns.resolve4(domain);
    } catch (e) {
      // Not found
    }

    try {
      const mxRecords = await dns.resolveMx(domain);
      records.MX = mxRecords.map((mx) => `${mx.priority} ${mx.exchange}`);
    } catch (e) {
      // Not found
    }

    try {
      records.TXT = await dns.resolveTxt(domain);
      records.TXT = records.TXT.map((txt) => txt.join(''));
    } catch (e) {
      // Not found
    }

    try {
      records.NS = await dns.resolveNs(domain);
    } catch (e) {
      // Not found
    }
  } catch (error) {
    // DNS lookup error
  }

  return records;
}

module.exports = { getDNSRecords };
