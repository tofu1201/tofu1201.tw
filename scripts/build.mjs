import { cp, mkdir, rm, writeFile, stat, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { renderPage } from '../src/page.mjs';
import { renderNotFound } from '../src/not-found.mjs';
import { metadataFiles } from '../src/metadata.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(root, 'dist');
for (const image of ['og-image.png', 'apple-touch-icon.png']) {
  await access(resolve(root, 'public', image));
}
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(resolve(root, 'public'), destination, { recursive: true });
const html = renderPage();
await writeFile(resolve(destination, 'index.html'), html);
await writeFile(resolve(destination, '404.html'), renderNotFound());
for (const [name, content] of metadataFiles()) await writeFile(resolve(destination, name), content);
const css = await stat(resolve(destination, 'assets/site.css'));
const js = await stat(resolve(destination, 'assets/main.js'));
console.log(`\n  Tofu Chen — Production build complete\n\n  HTML   ${(Buffer.byteLength(html) / 1024).toFixed(1)} kB (${(gzipSync(html).length / 1024).toFixed(1)} kB gzip)\n  CSS    ${(css.size / 1024).toFixed(1)} kB\n  JS     ${(js.size / 1024).toFixed(1)} kB\n\n  Output: dist/\n  Preview: npm run preview\n`);
