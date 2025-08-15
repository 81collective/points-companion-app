#!/usr/bin/env node
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, '..');
const publicDir = resolve(projectRoot, 'public');
const srcSvg = resolve(publicDir, 'branding/monogram.svg');
const outDir = resolve(publicDir, 'icons');

const sizes = [
  48, 72, 96, 120, 128, 144, 152, 167, 180, 192, 256, 384, 512,
];

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function generate() {
  if (!fs.existsSync(srcSvg)) {
    console.error(`Source SVG not found at ${srcSvg}`);
    process.exit(1);
  }
  await ensureDir(outDir);

  const tasks = [];
  for (const size of sizes) {
    const outPath = resolve(outDir, `icon-${size}x${size}.png`);
    tasks.push(
      sharp(srcSvg)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(outPath)
    );
  }

  // Apple touch icon recommended size 180x180
  const appleOut = resolve(outDir, 'apple-touch-icon-180x180.png');
  tasks.push(
    sharp(srcSvg)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(appleOut)
  );

  await Promise.all(tasks);
  console.log(`Generated ${sizes.length + 1} icons in ${outDir}`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
