import { profile, site } from './data/profile.mjs';
import { icon } from './components/icons.mjs';
import { escapeHtml as e, renderSearchHead } from './seo.mjs';

export { escapeHtml } from './seo.mjs';
const navigation = [['home', '首頁'], ['teams', '團隊'], ['activities', '活動'], ['friends', '友站'], ['contact', '聯繫']];

function identityCard(item, kind) {
  const logo = `<span class="identity-logo logo-${e(item.logoTheme)}">${item.logo
    ? `<img src="${e(item.logo)}" alt="" width="64" height="64" loading="lazy" decoding="async">`
    : `<span class="logo-fallback" aria-hidden="true">${e(item.initials)}</span>`}</span>`;
  const content = `${logo}<div class="identity-copy"><h3 class="identity-name">${e(item.name)}</h3>${item.role || item.roleLabel ? `<p class="identity-role">${e(item.roleLabel || item.role)}</p>` : ''}</div>`;
  return item.url
    ? `<a class="identity-card ${kind}-card" href="${e(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="${e(item.name)}${item.roleLabel || item.role ? `，${e(item.roleLabel || item.role)}` : ''}，另開視窗">${content}${icon('arrow', 'card-arrow')}</a>`
    : `<div class="identity-card ${kind}-card">${content}</div>`;
}

export function renderPage({ modified } = {}) {
  const introduction = profile.introduction.split(/\n\s*\n/).filter(Boolean).map((paragraph) => `<p>${e(paragraph)}</p>`).join('');

  return `<!doctype html>
<html lang="${e(site.language)}" id="top">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderSearchHead({ modified })}
  <meta name="theme-color" content="${e(site.color)}">
  <meta name="color-scheme" content="dark">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/assets/site.css">
  <script src="/assets/main.js" defer></script>
  <script src="/assets/background.js" defer></script>
</head>
<body>
  <div class="site-background" aria-hidden="true">
    <div class="ambient-glow ambient-glow-one"></div>
    <div class="ambient-glow ambient-glow-two"></div>
    <div class="background-grid"></div>
    <canvas class="background-particles"></canvas>
  </div>
  <a class="skip-link" href="#main">跳至主要內容</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#home">${e(profile.name)}</a>
      <button class="menu-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" aria-label="開啟導覽選單"><span></span><span></span></button>
      <nav id="primary-nav" class="site-nav" aria-label="主要導覽">${navigation.map(([id, name]) => `<a class="nav-link${id === 'home' ? ' is-active' : ''}" href="#${id}"${id === 'home' ? ' aria-current="location"' : ''}>${name}</a>`).join('')}</nav>
    </div>
  </header>

  <main id="main">
    <section id="home" class="hero" aria-labelledby="hero-title">
      <div class="container hero-inner">
        <div class="hero-portrait"><div class="portrait" style="--portrait-position: ${e(profile.portrait.position)}">${profile.portrait.src
          ? `<img src="${e(profile.portrait.src)}" alt="${e(profile.portrait.alt)}" width="960" height="960" fetchpriority="high" decoding="async">`
          : `<div class="portrait-fallback" aria-hidden="true"><span>TC<span class="portrait-dot">.</span></span></div>`}</div></div>
        <div class="hero-copy">
          <p class="hero-greeting">${e(profile.greeting)}</p>
          <h1 id="hero-title">${e(profile.name)}</h1>
          <ul class="hero-labels" aria-label="身分">${profile.labels.map((label) => `<li>${e(label)}</li>`).join('')}</ul>
          <section id="about" class="hero-about" aria-label="關於 ${e(profile.name)}">
            <div class="biography">${introduction}</div>
          </section>
        </div>
      </div>
      <a class="scroll-cue" href="#teams" aria-label="往下閱讀任職團隊">${icon('chevron')}</a>
    </section>

    <section id="teams" class="section" aria-labelledby="teams-title">
      <div class="container section-grid"><h2 id="teams-title">團隊</h2><div class="teams-grid">${profile.teams.map((team) => identityCard(team, 'team')).join('')}</div></div>
    </section>

    <section id="activities" class="section" aria-labelledby="activities-title">
      <div class="container section-grid"><div class="section-heading"><h2 id="activities-title">活動</h2><span class="section-year">2026</span></div><div class="activities-grid">${profile.activities.map((activity) => identityCard(activity, 'activity')).join('')}</div></div>
    </section>

    <section id="friends" class="section" aria-labelledby="friends-title">
      <div class="container section-grid"><h2 id="friends-title">友站</h2><div class="friends-grid">${profile.friends.length ? profile.friends.map((friend) => identityCard(friend, 'friend')).join('') : '<p class="empty-state">友站資料即將更新</p>'}</div></div>
    </section>

    <section id="contact" class="section contact" aria-labelledby="contact-title">
      <div class="container section-grid"><h2 id="contact-title">聯繫</h2><div class="socials">${profile.socials.map((social) => {
        const content = `${icon(social.icon)}<span>${e(social.name)}</span>${social.url ? icon('arrow', 'social-arrow') : ''}`;
        return social.url
          ? `<a class="social-link" href="${e(social.url)}"${social.url.startsWith('mailto:') ? ` aria-label="Mail：${e(profile.email)}"` : ' target="_blank" rel="noopener noreferrer"'}>${content}</a>`
          : `<span class="social-link social-pending" aria-disabled="true" aria-label="${e(social.name)}，尚未設定連結">${content}</span>`;
      }).join('')}</div></div>
    </section>
  </main>

  <footer class="site-footer container"><div class="footer-info"><span>© ${new Date().getFullYear()} ${e(profile.name)}</span>${profile.portrait.src && profile.portrait.credit ? `<span class="photo-credit" title="照片經裁切、縮小並轉為 WebP">“<a href="${e(profile.portrait.credit.url)}" target="_blank" rel="noopener noreferrer">${e(profile.portrait.credit.title || profile.portrait.alt)}</a>” by <a href="${e(profile.portrait.credit.creatorUrl || profile.portrait.credit.url)}" target="_blank" rel="noopener noreferrer">${e(profile.portrait.credit.name)}</a>, <a href="${e(profile.portrait.credit.licenseUrl)}" target="_blank" rel="noopener noreferrer">${e(profile.portrait.credit.licenseName)}</a></span>` : ''}</div><a href="#home" aria-label="回到首頁">${icon('up')}</a></footer>
  <button class="motion-toggle" type="button" data-paused="false" aria-label="暫停背景動畫" title="暫停背景動畫" hidden>${icon('pause', 'motion-pause')}${icon('play', 'motion-play')}</button>
</body>
</html>`;
}
