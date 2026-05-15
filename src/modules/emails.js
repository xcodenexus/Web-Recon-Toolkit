const axios = require('axios');

async function getEmails(domain) {
  const emails = new Set();

  // Source 1: Hunter.io free tier
  try {
    const response = await axios.get(
      `https://api.hunter.io/v2/domain-search?domain=${domain}&limit=100`,
      { timeout: 5000 }
    );

    if (response.data && response.data.data && response.data.data.emails) {
      response.data.data.emails.forEach((email) => {
        emails.add({
          email: email.value,
          firstName: email.first_name || 'N/A',
          lastName: email.last_name || 'N/A',
          position: email.position || 'N/A',
        });
      });
    }
  } catch (error) {
    // Hunter.io requires key in production
  }

  // Source 2: Email pattern extraction
  try {
    const patterns = await axios.get(
      `https://api.emailfinder.io/?domain=${domain}`,
      { timeout: 5000 }
    );

    if (patterns.data && patterns.data.pattern) {
      emails.add({
        pattern: patterns.data.pattern,
        confidence: patterns.data.confidence || 'Unknown',
      });
    }
  } catch (error) {
    // Silently continue
  }

  return Array.from(emails);
}

module.exports = { getEmails };
