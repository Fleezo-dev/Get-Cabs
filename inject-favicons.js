import fs from 'fs';
import path from 'path';

const faviconTags = `  <!-- Favicon & Brand Icons (Google Search & Mobile Compliant) -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#D90429" />`;

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('rel="icon"')) {
    // Insert right after canonical link or after <meta name="robots" ...> or before </head>
    if (content.includes('<link rel="canonical"')) {
      content = content.replace(/(<link rel="canonical"[^>]*>)/, `$1\n\n${faviconTags}`);
    } else if (content.includes('<meta name="robots"')) {
      content = content.replace(/(<meta name="robots"[^>]*>)/, `$1\n\n${faviconTags}`);
    } else if (content.includes('</head>')) {
      content = content.replace('</head>', `${faviconTags}\n</head>`);
    }
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
