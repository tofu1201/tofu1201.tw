import { profile } from './data/profile.mjs';

export function metadataFiles() {
  const url = new URL(profile.contact.website).href;
  return new Map([
    ['robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${url}sitemap.xml\n`],
    ['sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url.replace(/&/g, '&amp;')}</loc></url></urlset>\n`],
    ['profile.json', `${JSON.stringify(profile, null, 2)}\n`],
    ['llms.txt', `# ${profile.name} (${profile.nickname})\n\n> ${profile.labels.join('／')}\n\n${profile.introduction}\n\n## Website\n\n- [個人網站](${url}): 個人簡介、技能、任職團隊、活動與聯繫方式。\n- [結構化個人資料](${url}profile.json): 網站公開的個人資料。\n\n## Teams\n\n${profile.teams.map((team) => `- ${team.name}: ${team.role}`).join('\n')}\n\n## Contact\n\n${profile.socials.map((social) => `- [${social.name}](${social.url})`).join('\n')}\n\n## Skills\n\n- Programming: ${profile.skills.programming_languages.join(', ')}\n- Web: ${profile.skills.web_development.join(', ')}\n- Interests: ${profile.skills.technical_interests.join(', ')}\n\n## Community activities\n\n${profile.activities.map((activity) => `- ${activity.name}: ${activity.role} (${activity.roleLabel})`).join('\n')}\n`],
  ]);
}
