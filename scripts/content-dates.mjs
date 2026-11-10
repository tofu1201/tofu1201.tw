import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';

export function contentDates(root) {
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try {
    if (realpathSync(git('rev-parse', '--show-toplevel')) !== realpathSync(root) || git('rev-parse', '--is-shallow-repository') === 'true') return {};
    const paths = {
      home: ['src/data/profile.mjs', 'src/page.mjs', 'src/seo.mjs', 'public/images', ':(exclude,glob)public/images/**/*.md'],
      learning: ['public/self.html', 'src/learning.mjs', 'src/seo.mjs', 'src/data/profile.mjs'],
    };
    return Object.fromEntries(Object.entries(paths).flatMap(([page, files]) => {
      const date = git('log', '-1', '--format=%cI', '--', ...files);
      return date && !Number.isNaN(Date.parse(date)) ? [[page, date]] : [];
    }));
  } catch {
    return {};
  }
}
