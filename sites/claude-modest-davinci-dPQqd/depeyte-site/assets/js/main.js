document.addEventListener('DOMContentLoaded', function () {

  /* Mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); });
    });
  }

  /* Hero slider */
  var slides = document.querySelectorAll('.hero__slide');
  var dots = document.querySelectorAll('.hero__dots button');
  if (slides.length) {
    var current = 0;
    var rotate = function () {
      slides[current].classList.remove('is-active');
      if (dots[current]) dots[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('is-active');
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        slides[current].classList.remove('is-active');
        dots[current].classList.remove('is-active');
        current = i;
        slides[current].classList.add('is-active');
        dots[current].classList.add('is-active');
      });
    });
    setInterval(rotate, 6000);
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Portfolio filter */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.portfolio-card');
  if (filterBtns.length && cards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var cat = btn.dataset.filter;
        cards.forEach(function (card) {
          var match = cat === 'all' || (card.dataset.cat || '').indexOf(cat) !== -1;
          card.style.display = match ? 'flex' : 'none';
        });
      });
    });
  }

  /* Header shadow on scroll */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    });
  }

  /* ---- Gallery lightbox (swipeable) ---- */
  var lightbox, track, titleEl, counterEl, dotsEl, slideCount, currentSlide;

  function buildLightbox() {
    if (lightbox) return;
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
      '<button class="lightbox__close" aria-label="Fermer la galerie"><i class="fa-solid fa-xmark"></i></button>' +
      '<button class="lightbox__nav lightbox__prev" aria-label="Image précédente"><i class="fa-solid fa-chevron-left"></i></button>' +
      '<button class="lightbox__nav lightbox__next" aria-label="Image suivante"><i class="fa-solid fa-chevron-right"></i></button>' +
      '<div class="lightbox__stage"><div class="lightbox__track"></div></div>' +
      '<div class="lightbox__footer">' +
        '<h3 class="lightbox__title"></h3>' +
        '<div class="lightbox__counter"></div>' +
        '<div class="lightbox__dots"></div>' +
      '</div>';
    document.body.appendChild(lightbox);

    track = lightbox.querySelector('.lightbox__track');
    titleEl = lightbox.querySelector('.lightbox__title');
    counterEl = lightbox.querySelector('.lightbox__counter');
    dotsEl = lightbox.querySelector('.lightbox__dots');

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', function () { goTo(currentSlide - 1); });
    lightbox.querySelector('.lightbox__next').addEventListener('click', function () { goTo(currentSlide + 1); });
    lightbox.addEventListener('click', function (e) {
      if (wasDragging) { wasDragging = false; return; }
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goTo(currentSlide - 1);
      if (e.key === 'ArrowRight') goTo(currentSlide + 1);
    });

    /* Swipe handling (touch + mouse drag) */
    var startX = 0, deltaX = 0, dragging = false, wasDragging = false;
    var stage = lightbox.querySelector('.lightbox__stage');

    function dragStart(x) { dragging = true; startX = x; deltaX = 0; track.style.transition = 'none'; }
    function dragMove(x) {
      if (!dragging) return;
      deltaX = x - startX;
      if (Math.abs(deltaX) > 4) wasDragging = true;
      track.style.transform = 'translateX(calc(' + (-currentSlide * 100) + '% + ' + deltaX + 'px))';
    }
    function dragEnd() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      var threshold = stage.clientWidth * 0.15;
      if (deltaX > threshold) goTo(currentSlide - 1);
      else if (deltaX < -threshold) goTo(currentSlide + 1);
      else goTo(currentSlide);
    }

    stage.addEventListener('touchstart', function (e) { dragStart(e.touches[0].clientX); }, { passive: true });
    stage.addEventListener('touchmove', function (e) { dragMove(e.touches[0].clientX); }, { passive: true });
    stage.addEventListener('touchend', dragEnd);

    stage.addEventListener('mousedown', function (e) { e.preventDefault(); dragStart(e.clientX); });
    window.addEventListener('mousemove', function (e) { if (dragging) dragMove(e.clientX); });
    window.addEventListener('mouseup', dragEnd);
  }

  function goTo(index) {
    currentSlide = (index + slideCount) % slideCount;
    track.style.transform = 'translateX(' + (-currentSlide * 100) + '%)';
    counterEl.textContent = (currentSlide + 1) + ' / ' + slideCount;
    dotsEl.querySelectorAll('button').forEach(function (d, i) {
      d.classList.toggle('is-active', i === currentSlide);
    });
  }

  function openLightbox(images, title) {
    buildLightbox();
    track.innerHTML = '';
    dotsEl.innerHTML = '';
    images.forEach(function (img, i) {
      var slide = document.createElement('div');
      slide.className = 'lightbox__slide';
      slide.innerHTML = '<img src="' + img.src + '" alt="' + (img.alt || title || '') + '" loading="lazy">';
      track.appendChild(slide);

      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Image ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsEl.appendChild(dot);
    });
    slideCount = images.length;
    titleEl.textContent = title || '';
    document.body.classList.add('lightbox-open');
    lightbox.classList.add('is-open');
    goTo(0);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
  }

  document.querySelectorAll('[data-gallery] .portfolio-card__action--zoom').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var card = btn.closest('[data-gallery]');
      try {
        var images = JSON.parse(card.getAttribute('data-gallery'));
        var title = card.getAttribute('data-title') || '';
        openLightbox(images, title);
      } catch (err) { /* ignore malformed gallery data */ }
    });
  });

  /* Simple contact form feedback (no backend) */
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      if (msg) {
        msg.textContent = 'Merci, votre message a bien été pris en compte. Nous revenons vers vous au plus vite.';
        msg.style.display = 'block';
      }
      form.reset();
    });
  }
});
