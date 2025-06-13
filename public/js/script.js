

// --- Гамбургер-меню ---
// const burgerBtn = document.getElementById('burgerBtn');
// const menuOverlay = document.getElementById('menuOverlay');
// const closeMenu = document.getElementById('closeMenu');

// if (burgerBtn && menuOverlay && closeMenu) {
//   burgerBtn.addEventListener('click', function() {
//     menuOverlay.classList.add('active');
//     document.body.style.overflow = 'hidden';
//   });
//   closeMenu.addEventListener('click', function() {
//     menuOverlay.classList.remove('active');
//     document.body.style.overflow = '';
//   });
//   menuOverlay.addEventListener('click', function(e) {
//     if (e.target === menuOverlay) {
//       menuOverlay.classList.remove('active');
//       document.body.style.overflow = '';
//     }
//   });
// }

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
  }
});


// --- Плавный скролл к услугам по клику на стрелку ---
const scrollToServices = document.getElementById('scrollToServices');
const servicesSection = document.getElementById('services');
if (scrollToServices && servicesSection) {
  scrollToServices.addEventListener('click', function(e) {
    e.preventDefault();
    servicesSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// --- Клик по логотипу возвращает на главную ---
const logoHome = document.getElementById('logoHome');
if (logoHome) {
  logoHome.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'index.html';
  });
}

// Плавное появление about-photos
window.addEventListener('DOMContentLoaded', function() {
  const aboutPhotos = document.querySelector('.about-photos');
  if (aboutPhotos) setTimeout(() => aboutPhotos.classList.add('visible'), 200);
});

// Навешиваем на все ссылки меню и основные навигационные ссылки (теперь обычный переход)
function setupMenuLinks() {
  const selector = '.menu-list a, .service-card, .cta-btn, .footer-link, .hero-arrow, .back-button';
  document.querySelectorAll(selector).forEach(link => {
    if (link.tagName === 'A' && link.href && !link.href.endsWith('#')) {
      // обычный переход
      link.addEventListener('click', function() {
        // Закрыть меню при переходе по ссылке
        if (menuOverlay && menuOverlay.classList.contains('active')) {
          menuOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    } else if (link.classList.contains('service-card')) {
      // обычный переход
    }
  });
}
setupMenuLinks(); 


// ─────────────────────────────────────────────────────────────────────────────
// ОТПРАВКА ФОРМЫ «contactForm» AJAX-запросом и редирект на thankyou.html
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const errorBlock   = document.getElementById('contactFormError');

  if (!contactForm) return;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault(); // отменяем стандартное поведение формы

    // Скрываем предыдущие ошибки (если были)
    errorBlock.style.display = 'none';
    errorBlock.textContent = '';

    // Собираем данные из формы
    const formData = new FormData(contactForm);

    try {
      // Обратите внимание: путь к PHP должен быть корректным относительно этой страницы
      // Если файл лежит рядом с catalog.html — используйте './send_request.php'
      const response = await fetch('./send_request.php', {
        method: 'POST',
        body: formData,
      });

      // Если сервер вернул HTTP-код 200…299, response.ok === true
      if (!response.ok) {
        throw new Error(`Сервер вернул статус ${response.status}`);
      }

      const text = await response.text();

      // Обрезаем пробелы и сравниваем с «OK»
      if (text.trim() === 'OK') {
        // Успешно: делаем редирект на страницу «Спасибо»
        window.location.href = 'thankyou.html';
      } else {
        // Что-то пошло не так: показываем, что вернул PHP
        throw new Error(text || 'Не удалось отправить заявку');
      }

    } catch (err) {
      // Ловим сетевые ошибки и выводим в блок errorBlock
      errorBlock.textContent = 'Ошибка при отправке: ' + err.message;
      errorBlock.style.display = 'block';
    }
  });
});
// ─────────────────────────────────────────────────────────────────────────────
// Динамический калькулятор выкупа: три взаимозависимых ползунка
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const PRICE_CONST = 1000000;

  const initialSlider      = document.getElementById('initialSlider');
  const termSlider         = document.getElementById('termSlider');
  const dailySlider        = document.getElementById('dailySlider');

  const initialDisplay     = document.getElementById('initialDisplay');
  const termDisplay        = document.getElementById('termDisplay');
  const dailySliderDisplay = document.getElementById('dailySliderDisplay');

  // ─────────────────────────────
  // 1) Добавьте ссылки на «итоговые» span
  const sumInitial  = document.getElementById('sumInitial');
  const sumDaily    = document.getElementById('sumDaily');
  // ─────────────────────────────

  function formatRub(value) {
    return value.toLocaleString('ru-RU') + ' ₽';
  }
  function formatDays(value) {
    return value.toLocaleString('ru-RU') + ' дн.';
  }

  let isSyncing = false;

  // 2) Обновляем все «ленты» и итоговый блок
  function updateDisplays() {
    const initialValue = parseInt(initialSlider.value, 10);
    const termValue    = parseInt(termSlider.value, 10);
    const dailyValue   = parseInt(dailySlider.value, 10);

    // Обновляем текстовые значения под слайдерами
    initialDisplay.textContent     = formatRub(initialValue);
    termDisplay.textContent        = formatDays(termValue);
    dailySliderDisplay.textContent = formatRub(dailyValue);

    // ─────────────────────────────────────────────────────────────────────────
    // Обновляем итоговый блок внизу
    sumInitial.textContent = formatRub(initialValue);
    sumDaily.textContent   = formatRub(dailyValue) + '/дн.';
    // ─────────────────────────────────────────────────────────────────────────
  }

  function recalcDailyFromInitialOrTerm() {
    if (isSyncing) return;
    isSyncing = true;

    const initialValue = parseInt(initialSlider.value, 10);
    const termValue    = parseInt(termSlider.value, 10);

    let residual = PRICE_CONST - initialValue;
    if (residual < 0) residual = 0;

    let daily = 0;
    if (termValue > 0) {
      daily = residual / termValue;
    }
    daily = Math.floor(daily);

    const maxDaily = parseInt(dailySlider.max, 10) || 0;
    if (daily > maxDaily) {
      dailySlider.value = maxDaily;
    } else {
      dailySlider.value = daily;
    }

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

    let term = 0;
    if (dailyValue > 0) {
      term = residual / dailyValue;
    }
    term = Math.floor(term);

    const minTerm = parseInt(termSlider.min, 10) || 1;
    const maxTerm = parseInt(termSlider.max, 10) || minTerm;
    if (term < minTerm) term = minTerm;
    if (term > maxTerm) term = maxTerm;

    termSlider.value = term;

    updateDisplays();
    isSyncing = false;
  }

  // --- Добавлено! Оборачиваем обработчики в проверку ---
  if (initialSlider && termSlider && dailySlider && initialDisplay && termDisplay && dailySliderDisplay && sumInitial && sumDaily) {
    // Всегда пересчитываем при движении ползунков
    initialSlider.addEventListener('input', function() {
      recalcDailyFromInitialOrTerm();
    });
    termSlider.addEventListener('input', function() {
      recalcDailyFromInitialOrTerm();
    });
    dailySlider.addEventListener('input', function() {
      recalcTermFromInitialOrDaily();
    });

    // При загрузке страницы синхронизируем всё разово
    updateDisplays();
    recalcDailyFromInitialOrTerm();
  }
});


window.addEventListener('load', () => {
  const container = document.querySelector('.cars-marquee');
  const marquee   = container.querySelector('.marquee');
  if (!container || !marquee) return;

  // 1) Дублируем карточки до тех пор, пока общая ширина не перекроет экран как
  // минимум дважды. Это позволяет избежать пустого пространства.
  const original = marquee.innerHTML;
  marquee.innerHTML += original; // минимум две копии
  while (marquee.scrollWidth < container.offsetWidth * 2) {
    marquee.innerHTML += original;
  }

  // 2) Задаём начальные параметры
  let offset   = 0;                      // текущий сдвиг
  const total  = marquee.scrollWidth;    // общая ширина (две копии)
  const half   = total / 2;              // ширина одной копии
  const speed  = 80;                     // px в секунду (регулируйте)
  let lastTime = performance.now();

  // 3) Запускаем requestAnimationFrame-цикл
  function step(now) {
    const dt = (now - lastTime) / 1000;  // время в секундах
    lastTime = now;

    // двигаем
    offset += speed * dt;
    // как только прошли одну копию — вычитаем её длину, чтобы не расти бесконечно
    if (offset >= half) offset -= half;

    marquee.style.transform = `translateX(-${offset}px)`;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});