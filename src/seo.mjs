import { profile, site } from './data/profile.mjs';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const serializeJsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export function siteUrl(path = '') {
  const base = new URL(profile.contact.website);
  base.search = '';
  base.hash = '';
  if (!base.pathname.endsWith('/')) base.pathname += '/';
  return new URL(path, base).href;
}

export function pageDetails(page = 'home') {
  if (page === 'home') return { url: siteUrl(), title: site.title, description: site.description, type: 'profile' };
  if (page === 'learning') return {
    url: siteUrl('self'), title: `資訊課自主學習計畫｜${profile.name}`,
    description: `${profile.name}（${profile.nickname}）的資訊課自主學習計畫，記錄網站開發、Python 實作的學習動機、專案規劃、執行方式與成果驗收。`,
    type: 'website',
  };
  throw new Error(`Unknown page: ${page}`);
}

const personRef = () => ({ '@id': siteUrl('#person') });
const websiteRef = () => ({ '@id': siteUrl('#website') });
const organizationId = (team) => siteUrl(`#organization-${encodeURIComponent(team.name)}`);
const sameAs = () => profile.socials.filter((social) => ['instagram', 'linkedin'].includes(social.icon) && /^https:\/\//.test(social.url)).map((social) => social.url);

function imageCredit() {
  const credit = profile.portrait.src && profile.portrait.credit;
  return credit ? {
    creditText: credit.name,
    copyrightNotice: `© ${credit.name}；${credit.licenseName}`,
    creator: { '@type': 'Organization', name: credit.name, ...(credit.creatorUrl ? { url: credit.creatorUrl } : {}) },
    license: credit.licenseUrl,
    acquireLicensePage: credit.url,
  } : {};
}

function shareImage() {
  return {
    '@type': 'ImageObject', '@id': siteUrl('#share-image'),
    url: siteUrl('og-image.png'), contentUrl: siteUrl('og-image.png'),
    width: 1200, height: 630, caption: `${profile.name}｜${profile.labels.join('／')}`,
    ...imageCredit(),
  };
}

function website() {
  return {
    '@type': 'WebSite', ...websiteRef(), name: profile.name, url: siteUrl(),
    description: site.description, inLanguage: site.language, publisher: personRef(),
  };
}

function section(id, name, mainEntity) {
  return {
    '@type': 'WebPageElement', '@id': siteUrl(`#${id}`), name,
    isPartOf: { '@id': siteUrl('#webpage') },
    ...(mainEntity ? { mainEntity: { '@id': siteUrl(`#${id}-list`) } } : {}),
  };
}

export function homeGraph({ modified } = {}) {
  const portrait = profile.portrait.src ? {
    '@type': 'ImageObject', '@id': siteUrl('#portrait'),
    url: siteUrl(profile.portrait.src), contentUrl: siteUrl(profile.portrait.src),
    caption: profile.portrait.alt, name: profile.portrait.credit?.title || profile.portrait.alt,
    ...imageCredit(),
  } : null;
  const organizations = profile.teams.map((team) => ({
    '@type': 'Organization', '@id': organizationId(team), name: team.name,
    ...(team.url ? { url: team.url } : {}),
    ...(team.logo ? { logo: siteUrl(team.logo) } : {}),
    member: { '@type': 'OrganizationRole', member: personRef(), roleName: team.role },
  }));
  const lists = [
    { id: 'teams', name: `${profile.name} 的團隊與任職身分`, items: profile.teams.map((team) => ({ item: { '@id': organizationId(team) } })) },
    { id: 'activities', name: `${profile.name} 的活動參與經歷`, items: profile.activities.map((activity) => ({
      name: activity.name, ...(activity.url ? { url: activity.url } : {}), description: `參與身分：${activity.roleLabel || activity.role}`,
    })) },
    { id: 'friends', name: `${profile.name} 的友站`, items: profile.friends.map((friend) => ({
      name: friend.name, url: friend.url, ...(friend.role ? { description: friend.role } : {}),
    })) },
  ].map(({ id, name, items }) => ({
    '@type': 'ItemList', '@id': siteUrl(`#${id}-list`), name, numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })),
  }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person', ...personRef(), name: profile.name, alternateName: profile.nickname,
        description: profile.summary, url: siteUrl(), email: profile.email,
        jobTitle: profile.labels, homeLocation: { '@type': 'Country', name: '台灣' },
        knowsAbout: [...profile.skills.programming_languages, ...profile.skills.web_development],
        affiliation: organizations.map((organization) => ({ '@id': organization['@id'] })),
        sameAs: sameAs(), mainEntityOfPage: { '@id': siteUrl('#webpage') },
        ...(portrait ? { image: { '@id': portrait['@id'] } } : {}),
      },
      website(),
      {
        '@type': 'ProfilePage', '@id': siteUrl('#webpage'), url: siteUrl(), name: site.title,
        description: site.description, inLanguage: site.language,
        isPartOf: websiteRef(), mainEntity: personRef(), about: personRef(), author: personRef(),
        primaryImageOfPage: { '@id': portrait ? portrait['@id'] : siteUrl('#share-image') },
        ...(modified ? { dateModified: modified } : {}),
        hasPart: [section('home', '個人簡介'), section('teams', '團隊', true), section('activities', '活動', true), section('friends', '友站', true), section('contact', '聯繫')],
      },
      ...(portrait ? [portrait] : []), shareImage(), ...organizations, ...lists,
    ],
  };
}

export function learningGraph({ modified } = {}) {
  const page = pageDetails('learning');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', ...personRef(), name: profile.name, alternateName: profile.nickname, url: siteUrl(), sameAs: sameAs() },
      website(), shareImage(),
      {
        '@type': 'WebPage', '@id': `${page.url}#webpage`, url: page.url, name: page.title,
        description: page.description, inLanguage: site.language, isPartOf: websiteRef(), author: personRef(),
        primaryImageOfPage: { '@id': siteUrl('#share-image') },
        ...(modified ? { dateModified: modified } : {}),
        mainEntity: {
          '@type': 'CreativeWork', '@id': `${page.url}#plan`, name: '資訊課自主學習計畫',
          description: page.description, author: personRef(), inLanguage: site.language,
          about: ['網站開發', 'Python', '自主學習'].map((name) => ({ '@type': 'Thing', name })),
        },
      },
    ],
  };
}

export function renderSearchHead({ page = 'home', modified } = {}) {
  const details = pageDetails(page);
  const e = escapeHtml;
  const graph = page === 'home' ? homeGraph({ modified }) : learningGraph({ modified });
  return `<title>${e(details.title)}</title>
  <meta name="description" content="${e(details.description)}">
  <meta name="author" content="${e(profile.name)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${e(details.url)}">
  <link rel="sitemap" type="application/xml" href="${e(siteUrl('sitemap.xml'))}">
  <link rel="alternate" type="application/json" href="${e(siteUrl('profile.json'))}" title="${e(profile.name)} 公開個人資料">
  <link rel="alternate" type="text/markdown" href="${e(siteUrl('profile.md'))}" title="${e(profile.name)} 個人資料（Markdown）">
  <meta property="og:type" content="${details.type}">
  <meta property="og:site_name" content="${e(profile.name)}">
  <meta property="og:title" content="${e(details.title)}">
  <meta property="og:description" content="${e(details.description)}">
  <meta property="og:url" content="${e(details.url)}">
  <meta property="og:locale" content="${e(site.locale)}">
  <meta property="og:image" content="${e(siteUrl('og-image.png'))}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${e(profile.name)}｜${e(profile.labels.join('／'))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(details.title)}">
  <meta name="twitter:description" content="${e(details.description)}">
  <meta name="twitter:image" content="${e(siteUrl('og-image.png'))}">
  <meta name="twitter:image:alt" content="${e(profile.name)}｜${e(profile.labels.join('／'))}">
  <script type="application/ld+json">${serializeJsonLd(graph)}</script>`;
}
