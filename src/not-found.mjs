import { icon } from './components/icons.mjs';

export function renderNotFound() {
  return `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>找不到頁面｜Tofu Chen</title><meta name="robots" content="noindex, follow"><meta name="color-scheme" content="dark"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"></head><body><main class="not-found container"><a class="brand" href="/">Tofu Chen</a><p>404</p><h1>找不到這個頁面。</h1><a class="back-link" href="/">回到首頁 ${icon('arrow')}</a></main></body></html>`;
}
