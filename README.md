# tofu1201.tw

Tofu Chen 的個人網站，使用 Node.js 與原生 HTML、CSS、JavaScript 建置。

[線上網站](https://tofu1201.tw)

## 開發

需要 Node.js 22 以上，無需安裝第三方套件。

```sh
npm run dev
npm test
npm run build
npm run preview -- --port 4322
```

開發網址為 `http://127.0.0.1:4321`，正式預覽為 `http://127.0.0.1:4322`。

個人資料位於 [`src/data/profile.mjs`](src/data/profile.mjs)，圖片放在 `public/images/`，樣式與互動程式放在 `public/assets/`。修改姓名、身分或形象照後，可用 `npm run assets` 重新產生分享圖。

## 部署

Cloudflare Pages 的建置指令為 `npm run build`，輸出目錄為 `dist`。Fork 後請修改 `contact.website` 與 `wrangler.jsonc` 的專案名稱。

## 授權

程式碼採用 [MIT License](LICENSE)。第三方 Logo 與頭像的權利歸原權利人所有。

形象照「[_KA98892](https://www.flickr.com/photos/coscup/55451327852/in/album-72177720335045157)」由 [COSCUP](https://www.flickr.com/photos/coscup/) 發布，採用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。照片經裁切、縮小及轉檔，相關照片衍生圖沿用相同授權。
