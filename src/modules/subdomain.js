const axios = require('axios');

async function getSubdomains(domain) {
  const subdomains = new Set();

  // Source 1: crt.sh (Certificate Transparency)
  try {
    const response = await axios.get(`https://crt.sh/?q=${domain}&output=json`, {
      timeout: 5000,
    });

    if (Array.isArray(response.data)) {
      response.data.forEach((cert) => {
        const names = cert.name_value.split('\n');
        names.forEach((name) => {
          const clean = name.trim().replace(/\*\./, '');
          if (clean && clean.includes(domain)) {
            subdomains.add(clean);
          }
        });
      });
    }
  } catch (error) {
    // Silently continue
  }

  // Source 2: Trickest free API (no key required)
  try {
    const response = await axios.get(
      `https://api.trickest.com/api/v1/public/subdomains/${domain}`,
      { timeout: 5000 }
    );

    if (response.data && Array.isArray(response.data.subdomains)) {
      response.data.subdomains.forEach((sub) => subdomains.add(sub));
    }
  } catch (error) {
    // Silently continue
  }

  // Source 3: DNS.buffered (free tier)
  try {
    const response = await axios.get(
      `https://dns.bufferover.run/api/v1/query?query=.${domain}`,
      { timeout: 5000 }
    );

    if (response.data && response.data.FDNS_A) {
      response.data.FDNS_A.forEach((record) => {
        const sub = record.split(',')[0];
        if (sub && sub.includes(domain)) {
          subdomains.add(sub);
        }
      });
    }
  } catch (error) {
    // Silently continue
  }

  return Array.from(subdomains).sort();
}

module.exports = { getSubdomains };
