import { profile } from './data/profile.mjs';
import { escapeHtml, siteUrl } from './seo.mjs';

const markdown = (value) => String(value)
  .replace(/([\\`*_\[\]<>])/g, '\\$1')
  .replace(/^(\s*)(#{1,6}|[-+])(?=\s)/gm, '$1\\$2')
  .replace(/^(\s*\d+)([.)])(?=\s)/gm, '$1\\$2');
const link = (name, url) => `[${markdown(name)}](${String(url).replace(/\(/g, '%28').replace(/\)/g, '%29')})`;
const listSection = (title, lines) => lines.length ? `## ${title}\n\n${lines.map((line) => `- ${line}`).join('\n')}\n\n` : '';

export function profileMarkdown({ modified } = {}) {
  const portrait = profile.portrait.src && profile.portrait.credit;
  return `# ${markdown(profile.name)}（${markdown(profile.nickname)}）\n\n` +
    `> ${markdown(profile.summary)}\n\n` +
    `網站：${link(profile.contact.website, siteUrl())}\n\n` +
    (modified ? `更新日期：${modified.slice(0, 10)}\n\n` : '') +
    `## 個人簡介\n\n${markdown(profile.introduction)}\n\n` +
    listSection('身分', profile.labels.map(markdown)) +
    listSection('技術與興趣', [
      `程式語言：${profile.skills.programming_languages.map(markdown).join('、')}`,
      `網頁技術：${profile.skills.web_development.map(markdown).join('、')}`,
      `技術興趣：${profile.skills.technical_interests.map(markdown).join('、')}`,
    ]) +
    listSection('團隊與職稱', profile.teams.map((team) => `${team.url ? link(team.name, team.url) : markdown(team.name)}：${markdown(team.role)}`)) +
    listSection('活動參與', profile.activities.map((activity) => `${activity.url ? link(activity.name, activity.url) : markdown(activity.name)}：${markdown(activity.roleLabel || activity.role)}`)) +
    listSection('聯繫', profile.socials.filter((social) => social.url).map((social) => link(social.name === 'Mail' ? profile.email : social.name, social.url))) +
    listSection('友站', profile.friends.map((friend) => `${link(friend.name, friend.url)}${friend.role ? `：${markdown(friend.role)}` : ''}`)) +
    (portrait ? `## 形象照授權\n\n${link(profile.portrait.credit.title || profile.portrait.alt, profile.portrait.credit.url)}，${markdown(profile.portrait.credit.name)}，${link(profile.portrait.credit.licenseName, profile.portrait.credit.licenseUrl)}。\n` : '');
}

export function metadataHeaders() {
  const canonical = `<${siteUrl()}>; rel="canonical"`;
  return {
    '/profile.md': { 'Content-Type': 'text/markdown; charset=utf-8', Link: canonical },
    '/profile.json': { 'Content-Type': 'application/json; charset=utf-8', Link: canonical },
    '/llms.txt': { 'Content-Type': 'text/plain; charset=utf-8' },
  };
}

export function metadataFiles({ home, learning } = {}) {
  const e = escapeHtml;
  const sitemapEntry = (url, modified, image) => `  <url>\n    <loc>${e(url)}</loc>${modified ? `\n    <lastmod>${e(modified)}</lastmod>` : ''}${image ? `\n    <image:image><image:loc>${e(image)}</image:loc></image:image>` : ''}\n  </url>`;
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    sitemapEntry(siteUrl(), home, profile.portrait.src ? siteUrl(profile.portrait.src) : null) + '\n' +
    sitemapEntry(siteUrl('self'), learning) + '\n</urlset>\n';
  const discovery = `# ${markdown(profile.name)}（${markdown(profile.nickname)}）\n\n> ${markdown(profile.summary)}\n\n` +
    `## 個人資料\n\n` +
    `- ${link('個人網站', siteUrl())}：個人簡介、團隊、活動、友站與聯繫。\n` +
    `- ${link('完整個人資料（Markdown）', siteUrl('profile.md'))}：簡介、技術興趣、職稱與活動參與身分。\n` +
    `- ${link('個人資料（JSON）', siteUrl('profile.json'))}：與網站內容共用的公開資料。\n\n` +
    `## 學習計畫\n\n- ${link('資訊課自主學習計畫', siteUrl('self'))}：網站開發、Python 實作、專案規劃與成果驗收。\n\n` +
    `## 聯繫\n\n${profile.socials.filter((social) => social.url).map((social) => `- ${link(social.name === 'Mail' ? profile.email : social.name, social.url)}`).join('\n')}\n`;
  const headers = Object.entries(metadataHeaders()).map(([path, values]) => `${path}\n${Object.entries(values).map(([name, value]) => `  ${name}: ${value}`).join('\n')}`).join('\n\n') + '\n';
  return new Map([
    ['robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl('sitemap.xml')}\n`],
    ['sitemap.xml', sitemap],
    ['profile.json', `${JSON.stringify(profile, null, 2)}\n`],
    ['profile.md', profileMarkdown({ modified: home })],
    ['llms.txt', discovery],
    ['_headers', headers],
  ]);
}
