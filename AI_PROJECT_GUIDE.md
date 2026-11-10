# 開發與維護指南

本專案以 Node.js 將個人資料、頁面範本及靜態素材組合為可直接部署的網站。建置與伺服器使用 Node.js 標準模組，瀏覽器端使用原生 JavaScript。

## 專案結構

| 路徑 | 職責 |
| --- | --- |
| `src/data/profile.mjs` | 個人簡介、團隊、活動、友站與聯繫資料 |
| `src/page.mjs` | 主站 HTML 與卡片呈現 |
| `src/seo.mjs` | 網址、搜尋標籤、社群分享與 JSON-LD |
| `src/metadata.mjs` | sitemap、robots、Markdown、JSON 與資料回應標頭 |
| `src/learning.mjs` | 學習計畫頁的搜尋資料整合 |
| `src/not-found.mjs` | 404 頁面 |
| `src/components/icons.mjs` | SVG 介面圖示 |
| `public/assets/` | 樣式、導覽與背景動畫 |
| `public/images/` | 圖像及來源文件 |
| `public/self.html` | 資訊課自主學習計畫範本 |
| `scripts/build.mjs` | 重建 `dist/` |
| `scripts/serve.mjs` | 開發與正式建置預覽伺服器 |
| `scripts/dev.mjs` | 監看來源變動並重新載入伺服器 |
| `scripts/content-dates.mjs` | 從完整 Git 歷史取得內容修改時間 |
| `scripts/generate-social.mjs` | 透過 Chrome／Chromium 產生分享圖及 Apple 圖示 |
| `tests/` | 搜尋資料與輸出內容的回歸測試 |

## 內容與呈現

個人資料以 `profile.mjs` 為共同來源。更新資料後，主站、JSON-LD、`profile.json`、`profile.md` 與 `llms.txt` 會在建置時同步更新。頁面內容直接存在於 HTML，JavaScript 負責選單與背景互動。

姓名、描述及卡片內容以文字轉義後輸出。JSON-LD 透過獨立序列化處理，避免資料中的 HTML 字元中斷 script 元素。`public/self.html` 的 `search:start` 與 `search:end` 標記保留給搜尋資料產生器，其餘內容可獨立編輯。

背景動畫由 `public/assets/background.js` 控制，包含粒子連線與指標互動。動畫會依減少動態效果偏好及頁面可見性調整，也可透過頁面按鈕暫停。

## 本機工作流程

```sh
npm run dev
npm test
npm run build
npm run preview -- --port 4322
```

開發預設網址為 `http://127.0.0.1:4321`，上述正式預覽網址為 `http://127.0.0.1:4322`。編輯 `src/` 或 `public/`，避免直接修改建置輸出。

介面修改應確認窄螢幕、平板、桌面與手機橫向的排版，並檢查鍵盤導覽、選單展開及頁尾內容。搜尋相關修改應檢查兩個頁面的 canonical、結構化資料與 sitemap 是否一致。

## 圖像維護

圖像隨靜態網站保存，來源與授權分別記錄於 `public/images/` 的 Markdown 文件。新增或替換素材時，應記錄公開來源網址、作者或權利人、授權及必要的格式調整。

形象照使用 CC BY-SA 4.0；替換時應同步檢查頁尾署名、分享圖與結構化資料中的圖像授權。第三方 Logo 與頭像的權利依各自來源處理。

## 提交修改

Pull Request 應聚焦於明確的問題，附上相關測試結果；畫面修改可提供桌面與手機截圖。個人經歷、任職身分與活動名稱應有對應的公開內容，結構化資料也應維持相同表述。

延伸閱讀：[專案首頁](README.md)、[SEO 與 AEO](docs/SEARCH.md)、[MIT 授權](LICENSE)。
