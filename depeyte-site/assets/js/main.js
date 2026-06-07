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
