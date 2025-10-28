(() => {
  const doc = document;

  const navToggle = doc.querySelector('[data-nav-toggle]');
  const navList = doc.querySelector('[data-nav-list]');

  if (navToggle && navList) {
    const toggleNav = () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navList.dataset.open = String(!isOpen);
    };

    navToggle.addEventListener('click', toggleNav);

    navList.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 960 && navToggle.getAttribute('aria-expanded') === 'true') {
          toggleNav();
        }
      });
    });
  }

  const switchMediaSource = (el) => {
    if (!el) return;
    if (el.dataset.src) {
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
    }
    if (el.dataset.srcset) {
      el.srcset = el.dataset.srcset;
      el.removeAttribute('data-srcset');
    }
    if (el.dataset.sizes) {
      el.sizes = el.dataset.sizes;
      el.removeAttribute('data-sizes');
    }
  };

  const loadPicture = (pictureWrapper) => {
    const picture = pictureWrapper.querySelector('picture') || pictureWrapper;
    picture.querySelectorAll('source').forEach((source) => switchMediaSource(source));
    const img = picture.querySelector('img');
    switchMediaSource(img);
    img?.classList.add('is-loaded');
  };

  const loadVideo = (video) => {
    video.querySelectorAll('source').forEach((source) => switchMediaSource(source));
    if (video.poster && video.dataset.poster) {
      video.poster = video.dataset.poster;
      video.removeAttribute('data-poster');
    }
    video.load();
    video.classList.add('is-loaded');
  };

  const lazyElements = [...doc.querySelectorAll('[data-lazy]')];

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        if (target.dataset.lazy === 'picture') {
          loadPicture(target);
        } else if (target.dataset.lazy === 'video') {
          loadVideo(target);
        }
        target.classList.add('is-loaded');
        obs.unobserve(target);
      });
    }, { rootMargin: '0px 0px 240px', threshold: 0.1 });

    lazyElements.forEach((el) => observer.observe(el));
  } else {
    lazyElements.forEach((el) => {
      if (el.dataset.lazy === 'picture') {
        loadPicture(el);
      } else if (el.dataset.lazy === 'video') {
        loadVideo(el);
      }
    });
  }

  doc.querySelectorAll('img.lazy-media').forEach((img) => {
    if (img.complete) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    }
  });

  const yearEl = doc.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
