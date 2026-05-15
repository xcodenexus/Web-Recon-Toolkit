const axios = require('axios');

async function getTechStack(domain) {
  const technologies = [];

  try {
    const response = await axios.get(
      `https://api.technography.io/?url=https://${domain}`,
      { timeout: 8000 }
    );

    if (response.data && response.data.technologies) {
      response.data.technologies.forEach((tech) => {
        technologies.push({
          name: tech.name,
          category: tech.category || 'Unknown',
          version: tech.version || 'Unknown',
        });
      });
    }
  } catch (error) {
    // Fallback: Try Wappalyzer community data
    try {
      const response = await axios.get(
        `https://www.wappalyzer.com/api/v2/lookup/?url=https://${domain}`,
        { timeout: 8000 }
      );

      if (response.data && response.data.technologies) {
        response.data.technologies.forEach((tech) => {
          technologies.push({
            name: tech.name || 'Unknown',
            category: tech.category || 'Unknown',
            version: tech.version || 'Unknown',
          });
        });
      }
    } catch (fallbackError) {
      // Silent fallback
    }
  }

  return technologies;
}

module.exports = { getTechStack };
