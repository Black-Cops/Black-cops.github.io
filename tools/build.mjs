import { readFile, writeFile, mkdir, cp, rm, access } from 'fs/promises';
import path from 'path';
import { constants as fsConstants } from 'fs';
import { minify as minifyHTML } from 'html-minifier-terser';
import { minify as minifyJS } from 'terser';
import { gzip } from 'zlib';
import { promisify } from 'util';

const DIST_DIR = path.resolve('dist');
const gzipAsync = promisify(gzip);

async function ensureCleanDist() {
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });
}

async function writeWithGzip(filePath, contents) {
  await writeFile(filePath, contents);
  const gzipped = await gzipAsync(typeof contents === 'string' ? contents : Buffer.from(contents));
  await writeFile(`${filePath}.gz`, gzipped);
}

async function copyIfExists(source, destination) {
  try {
    await access(source, fsConstants.F_OK);
    await cp(source, destination, { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function buildProject() {
  await ensureCleanDist();

  const htmlContent = await readFile('index.html', 'utf-8');
  const minifiedHTML = await minifyHTML(htmlContent, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: false,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeOptionalTags: false,
    sortAttributes: true,
    sortClassName: true
  });

  await writeWithGzip(path.join(DIST_DIR, 'index.html'), minifiedHTML);

  const jsContent = await readFile('scripts/main.js', 'utf-8');
  const minifiedJS = await minifyJS(jsContent, {
    compress: { passes: 2, pure_funcs: ['console.log'], drop_console: false },
    mangle: true,
    format: { comments: false }
  });

  await mkdir(path.join(DIST_DIR, 'scripts'), { recursive: true });
  await writeWithGzip(path.join(DIST_DIR, 'scripts/main.js'), minifiedJS.code);

  const swContent = await readFile('sw.js', 'utf-8');
  const minifiedSW = await minifyJS(swContent, {
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false }
  });

  await writeWithGzip(path.join(DIST_DIR, 'sw.js'), minifiedSW.code);

  await mkdir(path.join(DIST_DIR, 'assets'), { recursive: true });
  await copyIfExists('assets/images', path.join(DIST_DIR, 'assets/images'));

  await cp('manifest.webmanifest', path.join(DIST_DIR, 'manifest.webmanifest'));
  await cp('robots.txt', path.join(DIST_DIR, 'robots.txt'));
  await cp('sitemap.xml', path.join(DIST_DIR, 'sitemap.xml'));

  console.log('Build completed successfully.');
}

buildProject().catch((error) => {
  console.error('Build failed:', error);
  process.exitCode = 1;
});
