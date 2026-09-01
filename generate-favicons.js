import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Clean SVG specifically optimized for small and high-res icon rendering
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brand_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D90429" />
      <stop offset="100%" stop-color="#8D0018" />
    </linearGradient>
    <filter id="drop_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Background with subtle corner radius (standard for app icon & search snippet) -->
  <rect width="512" height="512" rx="104" fill="url(#brand_grad)" />
  
  <!-- Speed Arc -->
  <path d="M 80 215 C 80 140 140 80 215 80" stroke="#FFB703" stroke-width="24" stroke-linecap="round" />
  
  <!-- TAXI Roof Sign -->
  <rect x="216" y="125" width="80" height="46" rx="14" fill="#FFB703" filter="url(#drop_shadow)" />
  <rect x="226" y="135" width="60" height="26" rx="8" fill="#111827" />

  <!-- Cab Top / Roof Structure -->
  <path d="M155 280 L190 195 C196 180 210 170 228 170 H284 C302 170 316 180 322 195 L357 280 Z" fill="#FFC837" />

  <!-- Cab Windshield Glass -->
  <path d="M174 265 L202 205 C206 197 214 192 223 192 H289 C298 192 306 197 310 205 L338 265 Z" fill="#111827" />

  <!-- Cab Lower Body -->
  <path d="M112 315 C112 295 128 280 148 280 H364 C384 280 400 295 400 315 V348 C400 358 392 368 382 368 H130 C120 368 112 358 112 348 Z" fill="#FFB703" filter="url(#drop_shadow)" />

  <!-- Headlights -->
  <circle cx="145" cy="324" r="18" fill="#FFFFFF" />
  <circle cx="367" cy="324" r="18" fill="#FFFFFF" />

  <!-- Grill / Bumper Accent -->
  <rect x="196" y="318" width="120" height="22" rx="10" fill="#111827" />
  <rect x="210" y="324" width="92" height="10" rx="5" fill="#FFC837" />
</svg>`;

async function generate() {
  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');
  
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.resolve('favicon.svg'), svgContent);

  const svgBuffer = Buffer.from(svgContent);

  // Generate PNGs at all key sizes required by Google and Web Standards
  // Note: Google Search explicitly requires a multiple of 48px (48x48, 96x96, 144x144, 192x192, 512x512)
  const sizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-144x144.png', size: 144 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 }
  ];

  for (const { name, size } of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    
    fs.writeFileSync(path.join(publicDir, name), pngBuffer);
    fs.writeFileSync(path.resolve(name), pngBuffer);
    fs.writeFileSync(path.join(distDir, name), pngBuffer);
  }

  // Generate multi-resolution ICO file (contains 16x16, 32x32, 48x48)
  // We can write 48x48 PNG directly as modern ICO or wrap PNG
  const ico48Buffer = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico48Buffer);
  fs.writeFileSync(path.resolve('favicon.ico'), ico48Buffer);
  fs.writeFileSync(path.join(distDir, 'favicon.ico'), ico48Buffer);

  // Create valid Web App Manifest
  const manifest = {
    name: "Get Cabs Coimbatore",
    short_name: "Get Cabs",
    description: "24/7 Call Taxi Service in Coimbatore - Local, Airport & Outstation Cabs",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d90429",
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(path.join(publicDir, 'manifest.json'), manifestJson);
  fs.writeFileSync(path.resolve('manifest.json'), manifestJson);
  fs.writeFileSync(path.join(distDir, 'manifest.json'), manifestJson);

  // Also fix robots.txt to explicitly allow Googlebot-Image and favicons
  const robotsTxt = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /
Allow: /favicon*
Allow: /*.png$
Allow: /*.svg$
Allow: /*.ico$

Sitemap: https://www.getcabs.in/sitemap.xml
`;
  fs.writeFileSync(path.resolve('robots.txt'), robotsTxt);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt);

  console.log("All Favicons, Manifest & Robots.txt generated successfully!");
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
