import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { profile } from '../src/data/profile.mjs';
import { renderPage } from '../src/page.mjs';
import { escapeHtml, homeGraph, learningGraph, renderSearchHead, siteUrl } from '../src/seo.mjs';
import { metadataFiles, metadataHeaders, profileMarkdown } from '../src/metadata.mjs';
import { renderLearningPage } from '../src/learning.mjs';
import { renderNotFound } from '../src/not-found.mjs';
import { contentDates } from '../scripts/content-dates.mjs';

const jsonLd = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const nodeOf = (graph, type) => graph['@graph'].find((node) => node['@type'] === type);
const visit = (value, callback) => {
  if (!value || typeof value !== 'object') return;
  callback(value);
  for (const child of Object.values(value)) visit(child, callback);
};

test('profile graph connects the person, page, organizations and visible participation roles', () => {
  const graph = homeGraph();
  const person = nodeOf(graph, 'Person');
  const page = nodeOf(graph, 'ProfilePage');
  assert.equal(page.mainEntity['@id'], person['@id']);
  assert.equal(person.mainEntityOfPage['@id'], page['@id']);
  assert.equal(person.name, profile.name);
  assert.deepEqual(person.sameAs, profile.socials.filter((social) => ['instagram', 'linkedin'].includes(social.icon) && /^https:\/\//.test(social.url)).map((social) => social.url));

  const definitions = new Set();
  visit(graph, (node) => { if (node['@id'] && Object.keys(node).length > 1) definitions.add(node['@id']); });
  visit(graph, (node) => { if (node['@id']) assert.ok(definitions.has(node['@id']), `Unresolved entity: ${node['@id']}`); });

  const organizations = graph['@graph'].filter((node) => node['@type'] === 'Organization');
  assert.equal(organizations.length, profile.teams.length);
  profile.teams.forEach((team, index) => {
    assert.equal(organizations[index].name, team.name);
    assert.equal(organizations[index].member.roleName, team.role);
    assert.equal(organizations[index].member.member['@id'], person['@id']);
  });
  const activities = graph['@graph'].find((node) => node['@id'] === siteUrl('#activities-list'));
  assert.equal(activities.itemListElement.length, profile.activities.length);
  profile.activities.forEach((activity, index) => {
    assert.equal(activities.itemListElement[index].name, activity.name);
    assert.equal(activities.itemListElement[index].url, activity.url);
    assert.ok(activities.itemListElement[index].description.includes(activity.roleLabel));
  });
  const types = [];
  visit(graph, (node) => { if (node['@type']) types.push(node['@type']); });
  assert.ok(!types.includes('Event'));
  assert.ok(!types.includes('FAQPage'));
});

test('portrait and derivative share image retain image licensing metadata', () => {
  const original = { ...profile.portrait };
  try {
    profile.portrait.src = '/images/avatar.webp';
    const images = homeGraph()['@graph'].filter((node) => node['@type'] === 'ImageObject');
    assert.equal(images.length, 2);
    for (const image of images) {
      assert.ok(image.copyrightNotice.includes(profile.portrait.credit.name));
      assert.equal(image.creator.name, profile.portrait.credit.name);
      assert.equal(image.license, profile.portrait.credit.licenseUrl);
      assert.equal(image.acquireLicensePage, profile.portrait.credit.url);
    }
    delete profile.portrait.src;
    const graph = homeGraph();
    assert.equal(nodeOf(graph, 'Person').image, undefined);
    assert.equal(nodeOf(graph, 'ProfilePage').primaryImageOfPage['@id'], siteUrl('#share-image'));
    assert.equal(nodeOf(graph, 'ImageObject').copyrightNotice, undefined);
    assert.ok(!metadataFiles().get('sitemap.xml').includes('<image:image>'));
  } finally {
    profile.portrait = original;
  }
});

test('changing the canonical domain updates both pages, data discovery and HTTP canonical links', () => {
  const original = profile.contact.website;
  try {
    profile.contact.website = 'https://example.test/?ref=preview#old';
    for (const page of ['home', 'learning']) {
      const head = renderSearchHead({ page });
      assert.ok(head.includes(`rel="canonical" href="https://example.test/${page === 'learning' ? 'self' : ''}"`));
      assert.ok(head.includes('href="https://example.test/profile.md"'));
      assert.ok(head.includes('content="https://example.test/og-image.png"'));
      assert.ok(!head.includes('https://tofu1201.tw/'));
      assert.ok(!head.includes('ref=preview'));
      assert.ok(!head.includes('#old'));
    }
    const files = metadataFiles();
    assert.ok(files.get('robots.txt').includes('https://example.test/sitemap.xml'));
    assert.ok(files.get('llms.txt').includes('https://example.test/profile.md'));
    assert.equal(metadataHeaders()['/profile.md'].Link, '<https://example.test/>; rel="canonical"');
    assert.ok(files.get('_headers').includes('Content-Type: text/markdown; charset=utf-8'));
  } finally {
    profile.contact.website = original;
  }
});

test('HTML and JSON-LD escape text that could otherwise terminate metadata elements', () => {
  const original = { name: profile.name, summary: profile.summary };
  try {
    profile.name = '</script><script>alert("name")</script>';
    profile.summary = 'A "quote" & <description>';
    const html = renderPage();
    assert.ok(!html.includes('<script>alert('));
    assert.ok(html.includes('&lt;description&gt;'));
    assert.equal(nodeOf(jsonLd(html), 'Person').name, profile.name);
    assert.equal(nodeOf(jsonLd(html), 'ProfilePage').description, profile.summary);
    assert.ok(profileMarkdown().includes('\\<description\\>'));
    const missing = renderNotFound();
    assert.ok(missing.includes('content="noindex, follow"'));
    assert.ok(!missing.includes('<script>alert('));
    assert.ok(missing.includes(escapeHtml(profile.name)));
  } finally {
    Object.assign(profile, original);
  }
});

test('homepage and learning page have distinct metadata and readable HTML without client rendering', async () => {
  const home = renderPage();
  const learning = renderLearningPage(await readFile(new URL('../public/self.html', import.meta.url), 'utf8'));
  for (const html of [home, learning]) {
    assert.equal((html.match(/<title>/g) || []).length, 1);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(html.includes('name="description"'));
    assert.ok(html.includes('property="og:description"'));
    jsonLd(html);
  }
  for (const item of [...profile.teams, ...profile.activities, ...profile.friends]) {
    assert.ok(home.includes(`<h3 class="identity-name">${escapeHtml(item.name)}</h3>`));
  }
  for (const team of profile.teams) assert.ok(home.includes(escapeHtml(team.role)));
  assert.ok(learning.includes(`rel="canonical" href="${siteUrl('self')}"`));
  assert.ok(learning.includes('資訊課自主學習計畫'));
  assert.ok(!learning.includes('search:start'));
  assert.equal(nodeOf(learningGraph(), 'WebPage').author['@id'], siteUrl('#person'));
  assert.ok(nodeOf(learningGraph(), 'WebPage').mainEntity.about.every((topic) => topic['@type'] === 'Thing' && topic.name));
  assert.throws(() => renderLearningPage('<html><head></head></html>'), /metadata markers/);
});

test('sitemap contains only canonical pages and uses supplied content dates with XML escaping', () => {
  const original = { ...profile.portrait };
  try {
    profile.portrait.src = '/images/avatar.webp?size=960&quality=80';
    const home = '2026-10-23T10:00:00+08:00';
    const learning = '2026-11-07T10:00:00+08:00';
    const sitemap = metadataFiles({ home, learning }).get('sitemap.xml');
    assert.equal((sitemap.match(/<url>/g) || []).length, 2);
    assert.ok(sitemap.includes(`<loc>${siteUrl()}</loc>`));
    assert.ok(sitemap.includes(`<loc>${siteUrl('self')}</loc>`));
    assert.ok(sitemap.includes(`<lastmod>${home}</lastmod>`));
    assert.ok(sitemap.includes(`<lastmod>${learning}</lastmod>`));
    assert.ok(sitemap.includes('?size=960&amp;quality=80'));
    assert.ok(!sitemap.includes('404.html'));
    assert.ok(!sitemap.includes('<priority>'));
    assert.ok(!metadataFiles().get('sitemap.xml').includes('<lastmod>'));
  } finally {
    profile.portrait = original;
  }
});

test('Markdown and JSON expose current public names, roles and contact links', () => {
  const files = metadataFiles();
  const md = files.get('profile.md');
  assert.equal(JSON.parse(files.get('profile.json')).name, profile.name);
  const readable = md.replace(/\\([\\`*_{}\[\]()<>#+.!|])/g, '$1');
  for (const activity of profile.activities) {
    assert.ok(readable.includes(activity.name));
    assert.ok(readable.includes(activity.roleLabel || activity.role));
  }
  for (const team of profile.teams) assert.ok(readable.includes(team.role));
  assert.ok(md.includes(`mailto:${profile.email}`));
  assert.ok(md.includes('## 技術與興趣'));
  assert.ok(files.get('llms.txt').includes(siteUrl('self')));
});

test('content dates ignore unrelated commits and omit dates for archives and shallow clones', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'tofu-content-dates-'));
  const repository = join(temporary, 'repository');
  const git = (...args) => execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8', stdio: 'pipe' });
  const commit = (message, date) => execFileSync('git', ['-C', repository, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', '-c', 'commit.gpgsign=false', 'commit', '-m', message], {
    env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date }, stdio: 'pipe',
  });
  try {
    await mkdir(join(repository, 'src/data'), { recursive: true });
    git('init');
    await writeFile(join(repository, 'src/data/profile.mjs'), 'export const profile = {};\n');
    git('add', '.');
    const initial = '2026-10-01T10:00:00+08:00';
    commit('Content', initial);
    await writeFile(join(repository, 'README.md'), '# Documentation\n');
    await mkdir(join(repository, 'public/images'), { recursive: true });
    await writeFile(join(repository, 'public/images/SOURCES.md'), '# Image sources\n');
    git('add', '.');
    commit('Documentation', '2026-11-01T10:00:00+08:00');
    assert.deepEqual(contentDates(repository), { home: initial, learning: initial });
    const archive = join(temporary, 'archive');
    await mkdir(archive);
    assert.deepEqual(contentDates(archive), {});
    const shallow = join(temporary, 'shallow');
    execFileSync('git', ['clone', '--depth=1', pathToFileURL(repository).href, shallow], { stdio: 'pipe' });
    assert.deepEqual(contentDates(shallow), {});
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
