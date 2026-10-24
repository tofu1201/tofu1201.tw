# Tofu Chen 個人網站

黑色、簡潔的一頁式個人網站。主視覺以左側圓形頭像、右側招呼與姓名呈現，自介整合在首屏，下方依序為任職團隊、11 項活動與社群聯繫。導覽提供首頁、團隊、活動與聯繫。使用原生 HTML、CSS、JavaScript 和 Node.js，無第三方執行期依賴與外部字型請求。

## 本機開發

需要 Node.js 22 以上，不需安裝套件。

```sh
npm run dev
```

開啟 `http://127.0.0.1:4321`。修改內容後重新整理瀏覽器即可看到更新。如需手機在同一個區域網路預覽：

```sh
npm run dev -- --host 0.0.0.0 --port 4321
```

## 修改個人內容

內容集中在 `src/data/profile.mjs`：

- `labels`：主視覺的兩個身分標籤。
- `greeting`：姓名上方的開場招呼。
- `summary`：搜尋與社群分享摘要。
- `introduction`：簡介；以 `\n\n` 分成多段。
- `portrait.src`：目前為 `/images/avatar.webp`。替換時將圖片放到 `public/images/`，再填入對應路徑；頭像顯示為圓形，留白時使用 TC 姓名縮寫。
- `portrait.alt`：照片替代文字。
- `portrait.position`：裁切焦點，例如 `50% 35%`，對應 CSS `object-position`。
- `portrait.credit`：照片名稱、作者、來源與授權；填寫時會在頁尾顯示署名。替換照片時，請同步更新或移除不適用的來源資訊。
- `skills`：技術資料，用於 SEO 結構化資料與公開個人資料。
- `teams`：團隊名稱、`role` 職稱、`logo` 路徑及選填的 `url`。Logo 放在 `public/images/`；尚未提供時顯示 `initials`。
- `activities`：活動名稱、`roleLabel` 參與身分、Logo 與官方網址。
- `socials`：Discord、Instagram、Mail 與 LinkedIn 連結。
- `contact.website`：正式網域，目前為 `https://tofu1201.tw`。

範例：

```js
portrait: {
  src: '/images/portrait.webp',
  alt: 'Tofu Chen 形象照',
  position: '50% 35%',
},
```

`logoTheme: 'dark'` 使用深色底，`'light'` 使用淺色底；可依原始 Logo 的顏色選擇。活動圖像來自官方網站，部分使用官方品牌圖示，詳細來源與年份核對記錄在 `public/images/activities/SOURCES.md`。

目前使用你提供的自介及 COSCUP Flickr 形象照，並已加入兩個團隊的 Logo 與連結。照片來源記錄在 `public/images/PORTRAIT-SOURCE.md`，團隊圖像來源記錄在 `public/images/teams/SOURCES.md`。網站沒有後台或資料庫，直接修改這份設定檔即可更新內容。

## 正式建置

```sh
npm run build
npm run preview -- --port 4322
```

正式檔案在 `dist/`，可部署至 Cloudflare Pages、Netlify 或其他靜態網站主機。建置指令為 `npm run build`，輸出目錄為 `dist`。預覽伺服器供本機驗證使用。

## SEO 與社群分享

頁面已設定繁體中文語系、標題、描述、canonical、Open Graph、Twitter Card，以及相互連結的 `Person`、`ProfilePage`、`WebSite` JSON-LD。姓名、身分、簡介、團隊、技能與活動內容直接輸出為 HTML，無須 JavaScript 才能讀取。

建置同時產生 `robots.txt`、`sitemap.xml`、`profile.json`、`llms.txt`。部署後可將 `https://tofu1201.tw/sitemap.xml` 提交至 Google Search Console。更換網域時，修改 `contact.website` 後重新建置。

黑色分享圖 `public/og-image.png`（1200 × 630）及 Apple 圖示已提供。修改姓名或身分標籤後，可在安裝 Chrome 的電腦執行下列指令重新產生；必要時以 `CHROME_PATH` 指定 Chrome/Chromium 執行檔：

```sh
npm run assets
npm run build
```

## 頁面與樣式

- `src/page.mjs`：頁面結構與結構化資料。
- `public/assets/site.css`：桌面、手機、列印與減少動態效果樣式。
- `public/assets/main.js`：手機選單、目前所在章節與圖片載入失敗備援。
- `scripts/generate-social.mjs`：分享預覽圖的版型。

支援鍵盤操作、跳至主要內容、手機選單 Escape 關閉、無 JavaScript 閱讀與導覽。
