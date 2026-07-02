// Justin J. Rush — site interactions

(function () {
  // Sticky nav background
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    const scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.appendChild(scrim);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'drawer-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.textContent = '✕';
    links.prepend(closeBtn);

    const setMenu = (open) => {
      links.classList.toggle('open', open);
      scrim.classList.toggle('show', open);
      document.body.classList.toggle('menu-open', open);
      toggle.textContent = open ? 'Close' : 'Menu';
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
    closeBtn.addEventListener('click', () => setMenu(false));
    scrim.addEventListener('click', () => setMenu(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('open')) setMenu(false);
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => setMenu(false))
    );
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress bar
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  const onProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ')';
  };
  window.addEventListener('scroll', onProgress, { passive: true });
  onProgress();

  // Cursor spotlight on cards
  const SPOT_SEL = '.case-card, .svc-card, .pain, .venture, .quote-card, .cred-card, .step, .uvp, .chapter, .honor';
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest(SPOT_SEL);
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // Hero parallax (fine pointers only)
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const target = document.querySelector('.hero-portrait .frame img, .rush-hero .logo-mark');
    const hero = document.querySelector('.hero, .rush-hero');
    if (target && hero) {
      hero.addEventListener('pointermove', (e) => {
        const x = (e.clientX / innerWidth - 0.5) * 10;
        const y = (e.clientY / innerHeight - 0.5) * 10;
        target.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(1.03)';
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { target.style.transform = ''; });
    }
  }

  // Back to top
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.textContent = '↑';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  const onTopBtn = () => toTop.classList.toggle('show', scrollY > 700);
  window.addEventListener('scroll', onTopBtn, { passive: true });
  onTopBtn();

  // Scrollspy sub-nav (pages with .subnav)
  const subnav = document.querySelector('.subnav');
  if (subnav) {
    const spyLinks = [...subnav.querySelectorAll('a[href^="#"]')];
    const sections = spyLinks
      .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);
    const setActive = (id) => spyLinks.forEach((a) =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    const spy = () => {
      if (!sections.length) return;
      const mark = scrollY + innerHeight * 0.32;
      let current = sections[0];
      sections.forEach((s) => { if (s.offsetTop <= mark) current = s; });
      setActive(current.id);
    };
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy, { passive: true });
    spy();
  }

  // Pain checker — click the pains that hit home; CTA rewrites itself
  const pains = document.querySelectorAll('.pain[data-pain]');
  if (pains.length) {
    const tally = document.getElementById('pain-tally');
    const total = pains.length;
    const baseSubject = 'JustRush.AI Consultation Request';
    const update = () => {
      const picked = [...document.querySelectorAll('.pain.checked')].map((p) => p.dataset.pain);
      if (tally) {
        if (picked.length) {
          tally.classList.add('show');
          tally.innerHTML = 'You recognized <b>' + picked.length + ' of ' + total +
            '</b> — every one of them is a problem we’ve already solved for a business like yours. ' +
            'Hit <b>Request your free consult</b> and they’ll be pre-filled in your email.';
        } else {
          tally.classList.remove('show');
        }
      }
      const body = picked.length
        ? 'Hi Justin,\n\nMy business: \n\nThese hit home for me:\n' + picked.map((p) => '• ' + p).join('\n') + '\n\nI’d like to set up a free consultation.'
        : 'Hi Justin,\n\nMy business: \nMy biggest operational headache: \n\nI’d like to set up a free consultation.';
      document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
        if (!a.href.includes('Consultation')) return;
        a.href = 'mailto:justin.jeffrey.rush@gmail.com?subject=' + encodeURIComponent(baseSubject) + '&body=' + encodeURIComponent(body);
      });
    };
    pains.forEach((p) => {
      const mark = document.createElement('span');
      mark.className = 'mark';
      mark.textContent = '✓';
      mark.setAttribute('aria-hidden', 'true');
      p.appendChild(mark);
      p.setAttribute('role', 'checkbox');
      p.setAttribute('aria-checked', 'false');
      p.setAttribute('tabindex', '0');
      const toggle = (e) => {
        if (e.target.closest('a')) return; // don't toggle when following "How we fix it"
        p.classList.toggle('checked');
        p.setAttribute('aria-checked', String(p.classList.contains('checked')));
        update();
      };
      p.addEventListener('click', toggle);
      p.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(e); }
      });
    });
  }

  // Animated counters — [data-count] holds the numeric target,
  // surrounding prefix/suffix text stays in markup.
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cio.observe(el));
  }
})();
