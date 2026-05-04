// 모바일 메뉴 토글 + 챕터 페이지 스크롤 진행도
(function () {
  // ---- Mobile sheet menu ----
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const sheet = document.querySelector('[data-mobile-sheet]');
  const scrim = document.querySelector('[data-mobile-scrim]');
  const closeBtn = document.querySelector('[data-mobile-close]');

  function openSheet() {
    if (!sheet || !scrim) return;
    sheet.dataset.open = 'true';
    scrim.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    if (!sheet || !scrim) return;
    sheet.dataset.open = 'false';
    scrim.dataset.open = 'false';
    document.body.style.overflow = '';
  }

  menuBtn && menuBtn.addEventListener('click', openSheet);
  closeBtn && closeBtn.addEventListener('click', closeSheet);
  scrim && scrim.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  // ---- Chapter page: scroll progress bar ----
  const progress = document.querySelector('[data-progress-fill]');
  const article = document.querySelector('[data-chapter-article]');
  if (progress && article) {
    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = article.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const ratio = Math.max(0, Math.min(1, scrolled / total));
      progress.style.width = (ratio * 100).toFixed(1) + '%';
    };
    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ---- Chapter section TOC: scroll-spy ----
  const tocLinks = document.querySelectorAll('[data-toc-section]');
  const sections = document.querySelectorAll('[data-section-anchor]');
  if (tocLinks.length && sections.length && 'IntersectionObserver' in window) {
    const linkMap = new Map();
    tocLinks.forEach((a) => {
      const id = a.getAttribute('href').replace('#', '');
      linkMap.set(id, a);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tocLinks.forEach((a) => a.removeAttribute('aria-current'));
          const link = linkMap.get(entry.target.id);
          if (link) link.setAttribute('aria-current', 'page');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    sections.forEach((s) => observer.observe(s));
  }
})();
