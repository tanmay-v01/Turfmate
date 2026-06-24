/**
 * Generate PWA raster icons from public/icon.svg
 * Usage: npm run generate:pwa-icons
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = path.join(root, 'public', 'icon.svg');
const outDir = path.join(root, 'public');

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

for (const { name, size } of sizes) {
  const dest = path.join(outDir, name);
  await sharp(svg).resize(size, size).png().toFile(dest);
  console.log(`wrote ${name} (${size}×${size})`);
}

console.log('PWA icons ready in public/');
