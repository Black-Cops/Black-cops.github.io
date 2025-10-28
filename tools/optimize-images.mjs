import { mkdir, readdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const SOURCE_DIR = path.resolve('assets/source');
const OUTPUT_DIR = path.resolve('assets/images');

const IMAGE_CONFIG = {
  hero: {
    widths: [1920, 1280, 768, 480],
    format: 'webp',
    options: { quality: 82, effort: 6 }
  },
  dashboard: {
    widths: [1400, 1024, 768, 480],
    format: 'webp',
    options: { quality: 80, effort: 6 }
  },
  'video-poster': {
    widths: [1280, 854, 640],
    format: 'webp',
    options: { quality: 78, effort: 6 }
  },
  logo: {
    widths: [512, 256, 192, 180, 167, 152, 128, 96, 64, 32],
    format: 'png',
    options: { compressionLevel: 9 }
  }
};

async function ensureDirectories() {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(fileName) {
  const basename = path.parse(fileName).name;
  const config = IMAGE_CONFIG[basename];

  if (!config) {
    return;
  }

  const sourcePath = path.join(SOURCE_DIR, fileName);

  await Promise.all(
    config.widths.map(async (width) => {
      const pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true });
      const outputExtension = config.format;
      const outputFile = path.join(OUTPUT_DIR, `${basename}-${width}.${outputExtension}`);

      if (config.format === 'webp') {
        await pipeline.webp(config.options).toFile(outputFile);
      } else if (config.format === 'png') {
        await pipeline.png(config.options).toFile(outputFile);
      }
    })
  );
}

async function run() {
  await ensureDirectories();
  const files = await readdir(SOURCE_DIR);

  await Promise.all(
    files.filter((file) => IMAGE_CONFIG[path.parse(file).name]).map((file) => optimizeImage(file))
  );

  console.log('Images optimized successfully.');
}

run().catch((error) => {
  console.error('Image optimization failed:', error);
  process.exitCode = 1;
});
