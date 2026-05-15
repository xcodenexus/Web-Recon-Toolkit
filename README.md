# Web Recon Toolkit (WRT)

**Fast OSINT & reconnaissance for penetration testers**

A lightweight CLI tool that aggregates subdomain enumeration, DNS reconnaissance, technology detection, email enumeration, and port scanning into a single command.

## Features

- **Subdomain Enumeration** — Find subdomains via Certificate Transparency & public APIs
- **DNS Reconnaissance** — Retrieve A, MX, TXT, NS records
- **Tech Stack Detection** — Identify technologies & frameworks
- **Email Enumeration** — Extract email patterns & addresses
- **Port Scanning** — Detect open common ports
- **Multiple Output Formats** — JSON & pretty-printed tables
- **Zero Dependencies** — Uses free OSINT APIs (no API keys required)

## Installation

### From Source

```bash
git clone https://github.com/xcodenexus/Web-Recon-Toolkit.git
cd Web-Recon-Toolkit
npm install
node bin/wrt.js scan example.com
```

### Quick Start (Prebuilt Binary)

Download the latest release from the [Releases](https://github.com/xcodenexus/Web-Recon-Toolkit/releases) page.

```bash
# Windows
wrt-win.exe scan example.com

# Linux/macOS
chmod +x wrt-linux
./wrt-linux scan example.com
```

## Usage

### Basic Scan

```bash
node bin/wrt.js scan example.com
```

### Output to JSON

```bash
node bin/wrt.js scan example.com -o json
```

### Skip Port Scanning (Faster)

```bash
node bin/wrt.js scan example.com --no-ports
```

### Show Help

```bash
node bin/wrt.js --help
```

## Example Output

```
🔍 Web Recon Toolkit v1.0.0
Target: example.com

✓ Found 24 subdomains
✓ Retrieved DNS records
✓ Identified 8 technologies
✓ Found 12 email patterns
✓ Port scan complete

══════════════════════════════════════════════════

📊 Reconnaissance Report: example.com

🌐 Subdomains:
┌─────┬──────────────────────────┐
│ #   │ Subdomain                │
├─────┼──────────────────────────┤
│ 1   │ api.example.com          │
│ 2   │ blog.example.com         │
└─────┴──────────────────────────┘

📈 Summary:
┌────────────────┬───────┐
│ Metric         │ Count │
├────────────────┼───────┤
│ Subdomains     │ 24    │
│ Technologies   │ 8     │
│ Email Patterns │ 12    │
│ Open Ports     │ 2     │
└────────────────┴───────┘
```

## Architecture

### Modules

- **subdomain.js** — crt.sh, Trickest API, DNS.buffered
- **dns.js** — Node.js DNS module (native)
- **tech.js** — Technography.io & Wappalyzer APIs
- **emails.js** — Hunter.io, EmailFinder APIs
- **ports.js** — nmap (if available) or TCP port checking

## API Sources (All Free Tier)

| Source | Purpose | Key Required |
|--------|---------|--------------|
| crt.sh | Certificates/Subdomains | No |
| Trickest | Subdomains | No |
| DNS.buffered | DNS records | No |
| Technography.io | Tech detection | No |
| Hunter.io | Emails | No (limited) |
| Node.js DNS | DNS queries | No |

## Build Executable

```bash
npm install -g pkg
npm run build
```

Generates `wrt-win.exe`, `wrt-linux`, and `wrt-macos` binaries.

## Roadmap

- [ ] API key support (Hunter.io, Shodan, SecurityTrails)
- [ ] Parallel scanning with Promise.all()
- [ ] Screenshot capture of live services
- [ ] Vulnerability scanning integration
- [ ] Custom module plugins
- [ ] Web dashboard for results

## Legal Notice

This tool is for authorized security testing only. Ensure you have written permission before scanning any domains. Misuse of this tool may violate laws in your jurisdiction.

## License

MIT © 2024 Digitalowl

## Author

**Digitalowl** | [@thexcodenexus](https://x.com/thexcodenexus)

Built for penetration testers, by a penetration tester.
