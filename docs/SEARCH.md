# SEO 與 AEO

網站以完整靜態 HTML、明確的人物資料及一致的內容來源支援搜尋引擎與答案服務。SEO 著重頁面探索、索引與搜尋呈現；AEO 著重讓內容能被正確理解、摘要及引用。

## 頁面與標準網址

| 頁面 | 標準路徑 | 結構化類型 |
| --- | --- | --- |
| 個人首頁 | `/` | `ProfilePage`、`Person` |
| 資訊課自主學習計畫 | `/self` | `WebPage`、`CreativeWork` |

兩頁共用 `src/seo.mjs` 的標題、描述、canonical、Open Graph 與 Twitter Card 產生器。姓名與網域取自 `src/data/profile.mjs`，分享圖使用絕對網址與尺寸資訊。

Cloudflare Pages 將 `/self.html` 導向 `/self`，本機伺服器採相同處理。Sitemap 使用 `/` 與 `/self`；404 頁面使用 `noindex, follow`，排除於 sitemap。

## 結構化資料

人物以 `#person` 識別，`ProfilePage.mainEntity` 指向此人物；網站、圖像及團隊也使用固定的識別網址互相連結。

- `Person`：姓名、暱稱、公開簡介、身分、技術興趣、聯繫與所屬團隊。
- `Organization` 與 `OrganizationRole`：團隊名稱、網址、圖像及頁面上呈現的職稱。
- `ItemList`：團隊、活動與友站清單；活動保留參與身分，方便區別會眾、學員與工作人員。
- `ImageObject`：形象照與分享圖，含照片作者、`copyrightNotice`、授權及原始作品連結。

個人社群帳號使用 `sameAs` 連結 Instagram 與 LinkedIn。Discord 邀請連結列為聯繫方式。活動清單以名稱、網址與參與身分表達，沒有補入未公開的日期、場地或主辦資訊。

頁面中的卡片名稱使用標題元素，與所在區塊形成閱讀層級。個人介紹與清單可在未執行 JavaScript 時直接取得。

## 公開資料格式

| 路徑 | 內容 |
| --- | --- |
| `/profile.md` | 可直接閱讀的 Markdown 個人簡介、團隊、活動與聯繫資料 |
| `/profile.json` | 完整公開個人資料 |
| `/llms.txt` | 指向主站、學習計畫與個人資料格式的精簡索引 |
| `/robots.txt` | 爬取設定及 sitemap 位置 |
| `/sitemap.xml` | 標準頁面網址、可確認的更新時間及形象照位置 |

HTML 的 alternate 連結提供 Markdown 與 JSON 的探索入口。這兩個資料端點另透過 HTTP `Link: ...; rel="canonical"` 指回首頁；`_headers` 同時設定 Markdown 的 `Content-Type`。

Google 的 AI 搜尋功能沿用既有搜尋技術與內容原則，沒有另外要求 AI 專用檔案或特定結構化標記。`llms.txt` 與 Markdown 在本專案中用於資料存取與探索；索引、排名或引用由各搜尋與答案服務決定。

## 內容修改時間

完整 Git 歷史可用時，建置從相關內容檔案的最後提交取得 `dateModified` 與 sitemap 的 `lastmod`。沒有 Git 歷史、使用淺層複製或建置來源封存檔時，省略無法確認的日期。重新建置或修改無關文件不會製造新的內容更新時間。

## 維護與驗證

```sh
npm test
npm run build
npm run preview -- --port 4322
```

本機確認首頁與 `/self` 有各自的標題、描述及 canonical；JSON-LD 應與頁面上的人名、職稱、活動名稱與參與身分一致。替換照片後，同步檢查分享圖及圖像授權。

部署後，可在 Google Search Console 提交 `https://tofu1201.tw/sitemap.xml`，並以網址檢查功能確認索引狀態。結構化資料可用 [Rich Results Test](https://search.google.com/test/rich-results) 及 [Schema Markup Validator](https://validator.schema.org/) 檢查。

## 參考資料

- [Google Search：AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google Search：ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google Search：Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Schema.org：OrganizationRole](https://schema.org/OrganizationRole)
