(() => {
  document.documentElement.classList.add('js');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '開啟導覽選單');
    nav.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.header-inner')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });
  matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);

  document.querySelectorAll('.identity-logo img').forEach((image) => {
    const fallback = () => {
      const initials = document.createElement('span');
      initials.className = 'logo-fallback';
      initials.textContent = image.closest('.identity-card').querySelector('.identity-name').textContent.slice(0, 2);
      image.replaceWith(initials);
    };
    image.addEventListener('error', fallback, { once: true });
    if (image.complete && !image.naturalWidth) fallback();
  });

  const links = [...nav.querySelectorAll('a')];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1))).filter(Boolean);
  const update = () => {
    const atBottom = scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 3;
    const current = atBottom ? sections.at(-1) : sections.filter((section) => section.getBoundingClientRect().top <= Math.max(100, innerHeight * .3)).at(-1);
    links.forEach((link) => {
      const active = Boolean(current && link.hash === `#${current.id}`);
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  let queued = false;
  addEventListener('scroll', () => {
    if (!queued) {
      requestAnimationFrame(() => { update(); queued = false; });
      queued = true;
    }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();
