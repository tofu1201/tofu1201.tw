const paths = {
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  up: '<path d="m7 12 5-5 5 5M12 7v12"/>',
  pause: '<path d="M9 6v12M15 6v12"/>',
  play: '<path d="m9 5 10 7-10 7Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7m4 0v-7m0 3a3 3 0 0 1 6 0v4"/><circle cx="8" cy="7" r=".8" fill="currentColor" stroke="none"/>',
  discord: '<path d="m8 5-3 1-3 12 4 2 2-3m8-12 3 1 3 12-4 2-2-3M5 17c4 2 10 2 14 0M7 7c3-1 7-1 10 0"/><ellipse cx="8.5" cy="12.5" rx="1" ry="1.5" fill="currentColor" stroke="none"/><ellipse cx="15.5" cy="12.5" rx="1" ry="1.5" fill="currentColor" stroke="none"/>',
};

export function icon(name, className = '') {
  return `<svg class="icon ${className}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
}
