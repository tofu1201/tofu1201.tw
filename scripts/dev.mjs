import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// 使用輕量輪詢，避免部分環境的原生檔案監聽數量限制。
const root = fileURLToPath(new URL('../', import.meta.url));
const snapshot = async () => {
  const files = await readdir(resolve(root, 'src'), { recursive: true });
  const entries = await Promise.all(files.filter((file) => file.endsWith('.mjs')).sort().map(async (file) => `${file}:${(await stat(resolve(root, 'src', file))).mtimeMs}`));
  entries.push(`serve:${(await stat(resolve(root, 'scripts/serve.mjs'))).mtimeMs}`);
  return entries.join('|');
};
const start = () => spawn(process.execPath, [resolve(root, 'scripts/serve.mjs'), ...process.argv.slice(2)], { stdio: 'inherit', cwd: root });
let previous = await snapshot();
let child = start();
let restarting = false;
let stopping = false;
const bindExit = (processChild) => processChild.on('exit', (code) => {
  if (!restarting && !stopping && code) console.error('  伺服器已停止，修正檔案後會自動重新啟動。');
});
const timer = setInterval(async () => {
  if (restarting || stopping) return;
  try {
    const next = await snapshot();
    if (next === previous) return;
    previous = next;
    restarting = true;
    console.log('  內容已更新，重新載入伺服器…');
    if (child.exitCode === null && child.signalCode === null) {
      await new Promise((done) => { child.once('exit', done); child.kill('SIGTERM'); });
    }
    child = start();
    bindExit(child);
  } catch (error) { console.error(error.message); }
  finally { restarting = false; }
}, 1000);
bindExit(child);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  stopping = true;
  clearInterval(timer);
  if (child.exitCode !== null || child.signalCode !== null) process.exit(0);
  child.kill(signal);
  child.once('exit', () => process.exit(0));
});
