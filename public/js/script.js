document.addEventListener('DOMContentLoaded', function() {
  const burgerBtn = document.getElementById('burgerBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const closeMenu = document.getElementById('closeMenu');

  if (burgerBtn && menuOverlay && closeMenu) {
    burgerBtn.addEventListener('click', function () {
      menuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    closeMenu.addEventListener('click', function () {
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });

    menuOverlay.addEventListener('click', function (e) {
      if (e.target === menuOverlay) {
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    function setupMenuLinks() {
      const selector = '.menu-list a, .service-card, .cta-btn, .footer-link, .hero-arrow, .back-button';
      document.querySelectorAll(selector).forEach(link => {
        if (link.tagName === 'A' && link.href && !link.href.endsWith('#')) {
          link.addEventListener('click', function() {
            if (menuOverlay.classList.contains('active')) {
              menuOverlay.classList.remove('active');
              document.body.style.overflow = '';
            }
          });
        }
      });
    }

    setupMenuLinks();
  }
});

const scrollToServices = document.getElementById('scrollToServices');
const servicesSection = document.getElementById('services');
if (scrollToServices && servicesSection) {
  scrollToServices.addEventListener('click', function(e) {
    e.preventDefault();
    servicesSection.scrollIntoView({ behavior: 'smooth' });
  });
}

const logoHome = document.getElementById('logoHome');
if (logoHome) {
  logoHome.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'index.html';
  });
}

window.addEventListener('DOMContentLoaded', function() {
  const aboutPhotos = document.querySelector('.about-photos');
  if (aboutPhotos) setTimeout(() => aboutPhotos.classList.add('visible'), 200);
});

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const errorBlock = document.getElementById('contactFormError');

      try {
        const response = await fetch('/sendmail.php', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'XMLHttpRequest' // 💡 важно для правильной работы PHP
          }
        });

        const result = await response.text();

        if (result.trim() === 'OK') {
          window.location.href = 'thankyou.html';
        } else {
          errorBlock.textContent = 'Ошибка при отправке. Пожалуйста, попробуйте ещё раз.';
        }
      } catch (error) {
        errorBlock.textContent = 'Ошибка соединения. Проверьте интернет.';
      }
    });
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const PRICE_CONST = 1000000;

  const initialSlider      = document.getElementById('initialSlider');
  const termSlider         = document.getElementById('termSlider');
  const dailySlider        = document.getElementById('dailySlider');

  const initialDisplay     = document.getElementById('initialDisplay');
  const termDisplay        = document.getElementById('termDisplay');
  const dailySliderDisplay = document.getElementById('dailySliderDisplay');

  const sumInitial  = document.getElementById('sumInitial');
  const sumDaily    = document.getElementById('sumDaily');

  function formatRub(value) {
    return value.toLocaleString('ru-RU') + ' ₽';
  }
  function formatDays(value) {
    return value.toLocaleString('ru-RU') + ' дн.';
  }

  let isSyncing = false;

  function updateDisplays() {
    const initialValue = parseInt(initialSlider.value, 10);
    const termValue    = parseInt(termSlider.value, 10);
    const dailyValue   = parseInt(dailySlider.value, 10);

    initialDisplay.textContent     = formatRub(initialValue);
    termDisplay.textContent        = formatDays(termValue);
    dailySliderDisplay.textContent = formatRub(dailyValue);

    sumInitial.textContent = formatRub(initialValue);
    sumDaily.textContent   = formatRub(dailyValue) + '/дн.';
  }

  function recalcDailyFromInitialOrTerm() {
    if (isSyncing) return;
    isSyncing = true;

    const initialValue = parseInt(initialSlider.value, 10);
    const termValue    = parseInt(termSlider.value, 10);

    let residual = PRICE_CONST - initialValue;
    if (residual < 0) residual = 0;

    let daily = termValue > 0 ? Math.floor(residual / termValue) : 0;

    const maxDaily = parseInt(dailySlider.max, 10) || 0;
    dailySlider.value = (daily > maxDaily) ? maxDaily : daily;

    updateDisplays();
    isSyncing = false;
  }

  function recalcTermFromInitialOrDaily() {
    if (isSyncing) return;
    isSyncing = true;

    const initialValue = parseInt(initialSlider.value, 10);
    const dailyValue   = parseInt(dailySlider.value, 10);

    let residual = PRICE_CONST - initialValue;
    if (residual < 0) residual = 0;

    let term = dailyValue > 0 ? Math.floor(residual / dailyValue) : 0;

    const minTerm = parseInt(termSlider.min, 10) || 1;
    const maxTerm = parseInt(termSlider.max, 10) || minTerm;
    term = Math.max(minTerm, Math.min(term, maxTerm));

    termSlider.value = term;

    updateDisplays();
    isSyncing = false;
  }

  if (initialSlider && termSlider && dailySlider && initialDisplay && termDisplay && dailySliderDisplay && sumInitial && sumDaily) {
    initialSlider.addEventListener('input', recalcDailyFromInitialOrTerm);
    termSlider.addEventListener('input', recalcDailyFromInitialOrTerm);
    dailySlider.addEventListener('input', recalcTermFromInitialOrDaily);

    updateDisplays();
    recalcDailyFromInitialOrTerm();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  if (!document.body.classList.contains('cartoorder-page')) return;

  const container = document.getElementById('marqueeContainer');
  if (!container) return;

  fetch('/data/manualCars.json')
    .then(res => res.json())
    .then(cars => {
      const originalCards = [];

      cars.forEach((car, index) => {
        const card = window.createManualCarCard(car);
        if (!card) return;
        container.appendChild(card);
        originalCards.push(card);
      });
    



      const minWidth = window.innerWidth * 2;
      let totalWidth = container.scrollWidth;
      let cloneIdx = 0;
      while (totalWidth < minWidth && originalCards.length) {
        const origIdx = cloneIdx % originalCards.length;
        const clone = originalCards[origIdx].cloneNode(true);
        const btn = clone.querySelector('.car-detail-btn');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.openManualCarModal(cars[origIdx]);
          });
        }
        container.appendChild(clone);
        totalWidth = container.scrollWidth;
        cloneIdx++;
      }

      let offset = 0;
      const speed = 40;
      let lastTime = performance.now();

      function step(now) {
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        offset += speed * dt;

        const maxScroll = container.scrollWidth - container.offsetWidth;
        if (offset >= maxScroll) {
          offset = 0;
        }

        container.style.transform = `translateX(-${offset}px)`;
        requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
});
