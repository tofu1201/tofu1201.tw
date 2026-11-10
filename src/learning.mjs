import { renderSearchHead } from './seo.mjs';

export function renderLearningPage(source, { modified } = {}) {
  const marker = /<!-- search:start -->[\s\S]*?<!-- search:end -->/;
  if (!marker.test(source)) throw new Error('self.html is missing its search metadata markers.');
  return source.replace(marker, () => renderSearchHead({ page: 'learning', modified }));
}
