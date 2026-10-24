// PNG 已隨專案提供；僅在修改品牌視覺後，才需要用本機 Chrome 重新產生。
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { profile } from '../src/data/profile.mjs';
import { escapeHtml as e } from '../src/page.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cachedBrowsers = [];
for (const cache of [join(homedir(), 'Library/Caches/ms-playwright'), join(homedir(), '.cache/ms-playwright')]) {
  try {
    const versions = (await readdir(cache)).filter((name) => name.startsWith('chromium_headless_shell-')).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const version of versions) {
      for (const folder of ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell-linux64', 'chrome-linux']) {
        cachedBrowsers.push(join(cache, version, folder, folder === 'chrome-linux' ? 'headless_shell' : 'chrome-headless-shell'));
      }
    }
  } catch { /* Playwright 並非必要依賴。 */ }
}
const candidates = [process.env.CHROME_PATH, ...cachedBrowsers, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].filter(Boolean);
let executable;
for (const candidate of candidates) {
  try { await access(candidate); executable = candidate; break; } catch { /* 嘗試下一個位置 */ }
}
if (!executable) throw new Error('請安裝 Chrome，或以 CHROME_PATH 指定 Chrome/Chromium 執行檔位置。');

const temporary = await mkdtemp(join(tmpdir(), 'tofu-social-'));
const host = new URL(profile.contact.website).hostname;
let portraitMarkup = '<span class="monogram">TC<span class="dot">.</span></span>';
if (profile.portrait.src) {
  const imagePath = resolve(root, 'public', `.${profile.portrait.src}`);
  const image = await readFile(imagePath);
  const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif' }[extname(imagePath).toLowerCase()];
  if (!mime) throw new Error('分享圖的形象照請使用 WebP、PNG、JPEG 或 AVIF 格式。');
  portraitMarkup = `<img src="data:${mime};base64,${image.toString('base64')}" style="object-position:${e(profile.portrait.position)}" alt="">`;
}
const social = `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0a0a0a;color:#f4f4f4;font-family:"Helvetica Neue",Arial,"PingFang TC","Noto Sans TC",sans-serif}body:before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 26% 46%,#ffffff07,transparent 55%)}.greeting{position:absolute;left:480px;top:184px;margin:0;color:#aaa;font-size:18px;letter-spacing:1px}h1{position:absolute;left:476px;top:224px;margin:0;font-size:92px;font-weight:500;line-height:1.1;letter-spacing:-6px}.labels{position:absolute;left:480px;top:350px;display:flex;gap:13px}.labels span{padding:10px 17px;border:1px solid #383838;border-radius:40px;background:#111;color:#c6c6c6;font-size:15px;letter-spacing:.5px}.portrait{position:absolute;left:88px;top:135px;width:320px;height:320px;display:flex;align-items:center;justify-content:center;border:1px solid #383838;border-radius:50%;background:#161616;box-shadow:0 0 0 11px #0a0a0a,0 0 0 12px #2b2b2b;overflow:hidden}.portrait img{display:block;width:100%;height:100%;object-fit:cover}.monogram{font-family:"Times New Roman",serif;font-size:156px;font-weight:400;letter-spacing:-15px;color:#ccc}.dot{color:#eee}.credit{position:absolute;right:72px;bottom:36px;color:#888;font-size:10px}.bottom{position:absolute;left:72px;right:72px;bottom:33px;padding-top:20px;border-top:1px solid #292929;color:#a0a0a0;font-size:16px;letter-spacing:.3px}
</style></head><body><div class="portrait">${portraitMarkup}</div><p class="greeting">${e(profile.greeting)}</p><h1>${e(profile.name)}</h1><div class="labels">${profile.labels.map((label) => `<span>${e(label)}</span>`).join('')}</div><div class="bottom">${e(host)}</div>${profile.portrait.src && profile.portrait.credit ? `<div class="credit">Photo: ${e(profile.portrait.credit.name)} / Flickr · ${e(profile.portrait.credit.licenseName)} · Cropped</div>` : ''}</body></html>`;
const favicon = await readFile(resolve(root, 'public/favicon.svg'), 'utf8');
const iconPage = `<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;width:180px;height:180px}svg{display:block;width:180px;height:180px}</style></head><body>${favicon}</body></html>`;

try {
  await mkdir(resolve(root, 'public'), { recursive: true });
  for (const [name, html, width, height] of [['og-image', social, 1200, 630], ['apple-touch-icon', iconPage, 180, 180]]) {
    const input = join(temporary, `${name}.html`);
    const output = resolve(root, 'public', `${name}.png`);
    await writeFile(input, html);
    await new Promise((resolveRun, reject) => {
      const child = spawn(executable, ['--headless', '--disable-gpu', '--no-sandbox', '--single-process', '--no-zygote', '--in-process-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--user-data-dir=${join(temporary, name)}`, `--window-size=${width},${height}`, `--screenshot=${output}`, pathToFileURL(input).href], { stdio: ['ignore', 'ignore', 'pipe'] });
      let errorOutput = '';
      child.stderr.on('data', (chunk) => { errorOutput += chunk; });
      child.on('error', reject);
      child.on('close', (code, signal) => code === 0 ? resolveRun() : reject(new Error(`Chrome 結束：${signal || code}. ${errorOutput}`)));
    });
    console.log(`Generated public/${name}.png (${width} × ${height})`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
