const axios = require('axios');

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// Signatures checked against HTTP response headers
const HEADER_SIGNATURES = [
  { name: 'Nginx',         category: 'Web Server',           header: 'server',       pattern: /nginx/i },
  { name: 'Apache',        category: 'Web Server',           header: 'server',       pattern: /apache/i },
  { name: 'Microsoft IIS', category: 'Web Server',           header: 'server',       pattern: /iis/i },
  { name: 'LiteSpeed',     category: 'Web Server',           header: 'server',       pattern: /litespeed/i },
  { name: 'Cloudflare',    category: 'CDN',                  header: 'server',       pattern: /cloudflare/i },
  { name: 'Cloudflare',    category: 'CDN',                  header: 'cf-ray',       pattern: /.+/ },
  { name: 'PHP',           category: 'Programming Language', header: 'x-powered-by', pattern: /php/i },
  { name: 'Express',       category: 'Web Framework',        header: 'x-powered-by', pattern: /express/i },
  { name: 'ASP.NET',       category: 'Web Framework',        header: 'x-powered-by', pattern: /asp\.net/i },
  { name: 'WordPress',     category: 'CMS',                  header: 'x-powered-by', pattern: /wordpress/i },
  { name: 'Drupal',        category: 'CMS',                  header: 'x-generator',  pattern: /drupal/i },
  { name: 'Joomla',        category: 'CMS',                  header: 'x-generator',  pattern: /joomla/i },
  { name: 'Shopify',       category: 'E-commerce',           header: 'x-shopid',     pattern: /.+/ },
];

// Signatures checked against the HTML body
const HTML_SIGNATURES = [
  { name: 'WordPress',          category: 'CMS',                  pattern: /wp-content\/|wp-includes\//i },
  { name: 'Joomla',             category: 'CMS',                  pattern: /\/components\/com_/i },
  { name: 'Drupal',             category: 'CMS',                  pattern: /Drupal\.settings|drupal\.js/i },
  { name: 'Shopify',            category: 'E-commerce',           pattern: /cdn\.shopify\.com/i },
  { name: 'WooCommerce',        category: 'E-commerce',           pattern: /woocommerce/i },
  { name: 'Magento',            category: 'E-commerce',           pattern: /Mage\.Cookies|magento/i },
  { name: 'OpenCart',           category: 'E-commerce',           pattern: /catalog\/view\/theme/i },
  { name: 'PrestaShop',         category: 'E-commerce',           pattern: /prestashop/i },
  { name: 'React',              category: 'JavaScript Framework', pattern: /data-reactroot|react-dom\.production/i },
  { name: 'Vue.js',             category: 'JavaScript Framework', pattern: /vue\.runtime\.min\.js|__vue__/i },
  { name: 'Angular',            category: 'JavaScript Framework', pattern: /ng-version=|angular\.min\.js/i },
  { name: 'Next.js',            category: 'JavaScript Framework', pattern: /__NEXT_DATA__|_next\/static/i },
  { name: 'Nuxt.js',            category: 'JavaScript Framework', pattern: /__nuxt|_nuxt\//i },
  { name: 'Gatsby',             category: 'JavaScript Framework', pattern: /___gatsby|gatsby-/i },
  { name: 'Svelte',             category: 'JavaScript Framework', pattern: /svelte-/i },
  { name: 'jQuery',             category: 'JavaScript Library',   pattern: /jquery\.min\.js|jquery-\d/i },
  { name: 'Bootstrap',          category: 'UI Framework',         pattern: /bootstrap\.min\.css|bootstrap\.css/i },
  { name: 'Tailwind CSS',       category: 'UI Framework',         pattern: /tailwind/i },
  { name: 'Bulma',              category: 'UI Framework',         pattern: /bulma\.min\.css/i },
  { name: 'Google Analytics',   category: 'Analytics',            pattern: /google-analytics\.com\/analytics\.js|gtag\('config'/i },
  { name: 'Google Tag Manager', category: 'Analytics',            pattern: /googletagmanager\.com\/gtm\.js/i },
  { name: 'Hotjar',             category: 'Analytics',            pattern: /hotjar\.com/i },
  { name: 'Mixpanel',           category: 'Analytics',            pattern: /mixpanel/i },
  { name: 'HubSpot',            category: 'Marketing',            pattern: /js\.hs-scripts\.com|hubspot/i },
  { name: 'Intercom',           category: 'Customer Support',     pattern: /intercomcdn\.com|Intercom\(/i },
  { name: 'Zendesk',            category: 'Customer Support',     pattern: /zdassets\.com|zendesk/i },
  { name: 'Stripe',             category: 'Payment',              pattern: /js\.stripe\.com\/v3/i },
  { name: 'PayPal',             category: 'Payment',              pattern: /paypal\.com\/sdk/i },
  { name: 'reCAPTCHA',          category: 'Security',             pattern: /google\.com\/recaptcha/i },
  { name: 'hCaptcha',           category: 'Security',             pattern: /hcaptcha\.com/i },
  { name: 'Font Awesome',       category: 'UI Library',           pattern: /font-awesome|fontawesome/i },
  { name: 'Cloudflare',         category: 'CDN',                  pattern: /cloudflare/i },
  { name: 'AWS CloudFront',     category: 'CDN',                  pattern: /cloudfront\.net/i },
  { name: 'Fastly',             category: 'CDN',                  pattern: /fastly\.net/i },
];

// Extract version string from a header value for known servers/languages
const VERSION_PATTERNS = {
  'PHP':           /php\/([\d.]+)/i,
  'Nginx':         /nginx\/([\d.]+)/i,
  'Apache':        /apache\/([\d.]+)/i,
  'Microsoft IIS': /iis\/([\d.]+)/i,
};

async function fetchSite(domain) {
  try {
    return await axios.get(`https://${domain}`, {
      timeout: 10000,
      headers: REQUEST_HEADERS,
      maxRedirects: 5,
    });
  } catch (httpsError) {
    return await axios.get(`http://${domain}`, {
      timeout: 10000,
      headers: REQUEST_HEADERS,
      maxRedirects: 5,
    });
  }
}

async function getTechStack(domain) {
  const found = new Map();

  try {
    const response = await fetchSite(domain);
    const headers = response.headers;
    const html = typeof response.data === 'string' ? response.data : '';

    // Check response headers
    for (const sig of HEADER_SIGNATURES) {
      const value = headers[sig.header];
      if (value && sig.pattern.test(value)) {
        if (!found.has(sig.name)) {
          const versionPattern = VERSION_PATTERNS[sig.name];
          const versionMatch = versionPattern ? value.match(versionPattern) : null;
          found.set(sig.name, {
            name: sig.name,
            category: sig.category,
            version: versionMatch ? versionMatch[1] : 'Detected',
          });
        }
      }
    }

    // Check HTML body
    for (const sig of HTML_SIGNATURES) {
      if (sig.pattern.test(html)) {
        if (!found.has(sig.name)) {
          found.set(sig.name, {
            name: sig.name,
            category: sig.category,
            version: 'Detected',
          });
        }
      }
    }

    // Extract <meta name="generator"> for CMS version strings
    const metaMatch = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i);
    if (metaMatch) {
      const content = metaMatch[1].trim();
      const parts = content.split(/\s+/);
      const name = parts[0];
      const version = parts[1] || 'Detected';
      if (!found.has(name)) {
        found.set(name, { name, category: 'CMS', version });
      }
    }
  } catch (error) {
    // Domain unreachable — return empty
  }

  return Array.from(found.values());
}

module.exports = { getTechStack };
