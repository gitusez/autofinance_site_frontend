// filters.js

// Глобально сохраняем исходный порядок карточек каждой секции
const originalOrder = {
  prokatGrid: [],
  arendaGrid: [],
  buyoutGrid: []
};

document.addEventListener('DOMContentLoaded', function() {
  // ───────────────────────────────────────────────────────────
  // ВАШ СУЩЕСТВУЮЩИЙ КОД (функции applyFilters, resetFilters, навешивание событий и т.д.)
  // ───────────────────────────────────────────────────────────

  // Находим все элементы управления фильтрами
  const tabs = document.querySelectorAll('.filter-tab');
  const checkboxes = document.querySelectorAll('.filter-checkbox');
  const radioColors = document.querySelectorAll('.filter-radio[name="color"]');
  const selectBrand = document.getElementById('filterBrand');
  const inputPriceMin = document.getElementById('filterPriceMin');
  const inputPriceMax = document.getElementById('filterPriceMax');
  const inputYearMin = document.getElementById('filterYearMin');
  const inputYearMax = document.getElementById('filterYearMax');
  const inputMileageMin = document.getElementById('filterMileageMin');
  const inputMileageMax = document.getElementById('filterMileageMax');
  const btnReset = document.getElementById('buttonResetFilters');

  function applyFilters() {
    // 1) Определяем активный таб: all / used / new
    let activeTab = 'all';
    tabs.forEach(t => {
      if (t.classList.contains('active')) {
        activeTab = t.getAttribute('data-filter-type');
      }
    });

    // 2) Собираем состояния всех чекбоксов
    const activeFlags = {};
    checkboxes.forEach(ch => {
      const field = ch.getAttribute('data-filter-field');
      if (!activeFlags[field]) activeFlags[field] = [];
      if (ch.checked) {
        if (['discount','gifts','credit','select'].includes(field)) {
          activeFlags[field].push(true);
        } else {
          activeFlags[field].push(ch.value);
        }
      }
    });

    // 3) Читаем остальные фильтры
    const brandValue = selectBrand.value; // "any" или, например, "LADA"
    const priceMin = parseInt(inputPriceMin.value) || 0;
    const priceMax = parseInt(inputPriceMax.value) || Infinity;
    const yearMin = parseInt(inputYearMin.value) || 0;
    const yearMax = parseInt(inputYearMax.value) || Infinity;
    const mileageMin = parseInt(inputMileageMin.value) || 0;
    const mileageMax = parseInt(inputMileageMax.value) || Infinity;

    let colorValue = 'any';
    radioColors.forEach(r => {
      if (r.checked) colorValue = r.value;
    });

    // 4) Перебираем все карточки (.car-card)
    const cards = document.querySelectorAll('.car-card');
    cards.forEach(card => {
      let show = true;

      // Считываем data-атрибуты
      const cardPrice = parseInt(card.getAttribute('data-price')) || 0;
      const cardYear = parseInt(card.getAttribute('data-year')) || 0;
      const cardMileage = parseInt(card.getAttribute('data-mileage')) || 0;
      const fullName = card.getAttribute('data-name') || '';
      const cardBrand = fullName.split(' ')[0];
      const cardFuel = card.getAttribute('data-fuel') || '';
      const cardTransmission = card.getAttribute('data-transmission') || '';
      const cardDrive = card.getAttribute('data-drive') || '';
      const cardColor = card.getAttribute('data-color') || '';
      const cardDiscount = card.getAttribute('data-discount') === 'true';
      const cardGifts = card.getAttribute('data-gifts') === 'true';
      const cardCredit = card.getAttribute('data-credit') === 'true';
      const cardSelect = card.getAttribute('data-select') === 'true';

      // Фильтр «Тип автомобиля»
      // const thisYear = new Date().getFullYear();
      // if (activeTab === 'used') {
      //   if (cardYear === thisYear && cardMileage <= 100) show = false;
      // }
      // if (activeTab === 'new') {
      //   if (!(cardYear === thisYear && cardMileage <= 100)) show = false;
      // }

      // Фильтр «Тип автомобиля»
if (activeTab === 'used') {
  // С пробегом: всё, что больше 1500 км (вне зависимости от года)
  if (cardMileage <= 1500) show = false;
}
if (activeTab === 'new') {
  // Новые: всё, что до 1500 км (включительно)
  if (cardMileage > 1500) show = false;
}


      // Булевые флаги
      if (show && activeFlags['discount'] && activeFlags['discount'].length) {
        if (!cardDiscount) show = false;
      }
      if (show && activeFlags['gifts'] && activeFlags['gifts'].length) {
        if (!cardGifts) show = false;
      }
      if (show && activeFlags['credit'] && activeFlags['credit'].length) {
        if (!cardCredit) show = false;
      }
      if (show && activeFlags['select'] && activeFlags['select'].length) {
        if (!cardSelect) show = false;
      }

      // Бренд
      if (show && brandValue !== 'any') {
        if (cardBrand.toLowerCase() !== brandValue.toLowerCase()) show = false;
      }

      // Цена
      if (show && (cardPrice < priceMin || cardPrice > priceMax)) show = false;
      // Год
      if (show && (cardYear < yearMin || cardYear > yearMax)) show = false;
      // Пробег
      if (show && (cardMileage < mileageMin || cardMileage > mileageMax)) show = false;

      // Коробка передач
      // if (show && activeFlags['transmission'] && activeFlags['transmission'].length) {
      //   if (!activeFlags['transmission'].includes(cardTransmission)) show = false;
      // }

if (
  show &&
  activeFlags['transmission'] &&
  activeFlags['transmission'].length
) {
  let cardTrans = (cardTransmission || '').toLowerCase().trim();
  if (cardTrans === 'mt') cardTrans = 'мкпп';
  if (cardTrans === 'at') cardTrans = 'акпп';
  const filterTrans = activeFlags['transmission'].map(v => (v || '').toLowerCase().trim());
  if (!filterTrans.includes(cardTrans)) show = false;
}


      // Привод
      if (show && activeFlags['drive'] && activeFlags['drive'].length) {
        if (!activeFlags['drive'].includes(cardDrive)) show = false;
      }
      // Тип двигателя
      // if (show && activeFlags['fuel'] && activeFlags['fuel'].length) {
      //   if (!activeFlags['fuel'].includes(cardFuel)) show = false;
      // }
      // Тип двигателя (без учёта регистра)
if (show && activeFlags['fuel'] && activeFlags['fuel'].length) {
  const cardFuelLower = (cardFuel || '').toLowerCase().trim();
  const filterFuel = activeFlags['fuel'].map(v => (v || '').toLowerCase().trim());
  if (!filterFuel.includes(cardFuelLower)) show = false;
}

      // Цвет
      if (show && colorValue !== 'any') {
        if (cardColor !== colorValue) show = false;
      }

      // Показываем или скрываем
      card.style.display = show ? '' : 'none';
    });
    
// === Показывать или скрывать секции, если нет видимых карточек ===
['prokat', 'arenda', 'buyout'].forEach(section => {
  const grid = document.getElementById(section + 'Grid');
  const wrapper = document.getElementById(section + 'Section'); // Убедись, что этот ID есть!
  if (!grid || !wrapper) return;

  const visibleCards = Array.from(grid.querySelectorAll('.car-card'))
    .filter(card => card.style.display !== 'none');

  wrapper.style.display = visibleCards.length > 0 ? '' : 'none';
});

  }

  // Сохраняем изначальный порядок карточек после первого рендера
['prokatGrid', 'arendaGrid', 'buyoutGrid'].forEach(id => {
  const container = document.getElementById(id);
  if (container) {
    originalOrder[id] = Array.from(container.children);
  }
});


function resetFilters() {
  // 1. Прячем выпадающий список сортировки и сбрасываем его визуал
  const sortOptions = document.getElementById('sortOptions');
  if (sortOptions) {
    sortOptions.setAttribute('hidden', '');
  }
  const sortBtn = document.getElementById('sortBtn');
  if (sortBtn) {
    sortBtn.setAttribute('aria-expanded', 'false');
    const span = sortBtn.querySelector('span');
    if (span) span.textContent = 'Сортировать';
  }
  document.querySelectorAll('#sortOptions li').forEach(li => li.classList.remove('active'));

  // 2. Сброс переменных сортировки
  if (typeof currentSort !== 'undefined') currentSort = null;
  if (typeof sortType !== 'undefined') sortType = null;

  // 3. Сброс табов (тип автомобиля)
  tabs.forEach((t, idx) => {
    if (idx === 0) t.classList.add('active');
    else t.classList.remove('active');
  });

  // 4. Сброс чекбоксов
  checkboxes.forEach(ch => ch.checked = false);

  // 5. Сброс радиокнопок «Цвет»
  radioColors.forEach(r => {
    if (r.value === 'any') r.checked = true;
    else r.checked = false;
  });

  // 6. Сброс селекта «Марка»
  selectBrand.value = 'any';

  // 7. Сброс инпутов «Цена», «Год», «Пробег»
  inputPriceMin.value = '';
  inputPriceMax.value = '';
  inputYearMin.value = '';
  inputYearMax.value = '';
  inputMileageMin.value = '';
  inputMileageMax.value = '';

  // Восстанавливаем исходный DOM-порядок карточек
  ['prokat', 'arenda', 'buyout'].forEach(section => {
    const grid = document.getElementById(section + 'Grid');
    if (grid && window.originalCarsOrder[section]) {
      window.originalCarsOrder[section].forEach(card => grid.appendChild(card));
    }
  });

  // 9. Применяем фильтры заново (сброшенные)
  applyFilters();
}



  // ─── Навешиваем события ───
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      applyFilters();
    });
  });
  checkboxes.forEach(ch => ch.addEventListener('change', applyFilters));
  radioColors.forEach(r => r.addEventListener('change', applyFilters));
  selectBrand.addEventListener('change', applyFilters);
  [inputPriceMin, inputPriceMax, inputYearMin, inputYearMax, inputMileageMin, inputMileageMax]
    .forEach(inp => inp.addEventListener('input', applyFilters));
  btnReset.addEventListener('click', resetFilters);

  // ───────────────────────────────────────────────────────────
  // НОВЫЙ БЛОК: Mobile Filter Toggle
  // ───────────────────────────────────────────────────────────

  // Кнопка «Фильтры» для мобильных
  const mobileFilterBtn = document.getElementById('mobileFilterToggle');
  // Кнопка закрытия внутри панели фильтров
  const closeFilterBtn  = document.getElementById('closeFilters');
  // Вся панель с фильтрами
  const filterPanel     = document.getElementById('filterPanel');

  if (mobileFilterBtn && closeFilterBtn && filterPanel) {
    // При клике «открыть фильтры» (показать <div.filters> сверху)
    mobileFilterBtn.addEventListener('click', function() {
      filterPanel.classList.add('active');
      // Блокируем скролл основного контента на фоне (по желанию)
      document.body.style.overflow = 'hidden';
    });

    // При клике «×» закрыть (спрятать фильтры)
    closeFilterBtn.addEventListener('click', function() {
      filterPanel.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Сразу после загрузки показываем все карточки
//   applyFilters();
});

// ==============================
// Логика переключения вида (список/сетка) и сортировки
// ==============================

// 1) Ссылки на элементы панели
const listViewBtn   = document.getElementById('listViewBtn');
const gridViewBtn   = document.getElementById('gridViewBtn');
const sortBtn       = document.getElementById('sortBtn');
const sortOptions   = document.getElementById('sortOptions');
const catalogContent = document.querySelector('.catalog-content');

// 2) Обработчики переключения вида

// По умолчанию — у catalog-content есть класс grid-view
// (либо можно задать его в верстке, если хотите сделать «сетка» сразу)
// Если хотите, чтобы изначально стоял режим «список», то ставьте list-view.
catalogContent.classList.add('list-view');
listViewBtn.classList.add('active');

listViewBtn.addEventListener('click', () => {
  if (!listViewBtn.classList.contains('active')) {
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    catalogContent.classList.remove('grid-view');
    catalogContent.classList.add('list-view');
  }
});

gridViewBtn.addEventListener('click', () => {
  if (!gridViewBtn.classList.contains('active')) {
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    catalogContent.classList.remove('list-view');
    catalogContent.classList.add('grid-view');
  }
});

// 3) Показ/скрытие списка сортировки
sortBtn.addEventListener('click', () => {
  const isOpen = !sortOptions.hasAttribute('hidden');
  if (isOpen) {
    sortOptions.setAttribute('hidden', '');
    sortBtn.setAttribute('aria-expanded', 'false');
  } else {
    sortOptions.removeAttribute('hidden');
    sortBtn.setAttribute('aria-expanded', 'true');
  }
});

// 4) Сортировка карточек внутри каждой секции
// Чтобы сортировать, будем перебрасывать уже отрисованные DOM‐элементы .car-card
// Можно сортировать отдельно для каждой секции (Прокат, Аренда, Выкуп).
// Ниже пример для одной секции; при желании скопируйте и подправьте для всех.

// Утилита: сортирует DOM‐элементы внутри контейнера containerId по data-атрибуту
function sortDomCards(containerId, dataField, ascending = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  // Получаем NodeList всех .car-card
  const cards = Array.from(container.querySelectorAll('.car-card'));
  // Сортируем по числовому значению data-атрибута
  cards.sort((a, b) => {
    const aVal = Number(a.dataset[dataField] || 0);
    const bVal = Number(b.dataset[dataField] || 0);
    return ascending ? aVal - bVal : bVal - aVal;
  });
  // Перебираем уже отсортированные и помещаем их обратно
  cards.forEach(card => container.appendChild(card));
}

// 5) Когда пользователь выбрал пункт сортировки
sortOptions.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-sort]');
  if (!li) return;
  const sortType = li.dataset.sort; // 'priceAsc', 'yearDesc', 'mileageAsc' и т.д.

  // Для каждой секции делаем свой вызов sortDomCards:
  // Например: сортируем секцию «Прокат» → containerId = 'prokatGrid'
  // Секция «Аренда» → 'arendaGrid'
  // Секция «Выкуп» → 'buyoutGrid'

  switch (sortType) {
    case 'priceAsc':
      sortDomCards('prokatGrid',   'price', true);
      sortDomCards('arendaGrid',   'price', true);
      sortDomCards('buyoutGrid',   'price', true);
      break;
    case 'priceDesc':
      sortDomCards('prokatGrid',   'price', false);
      sortDomCards('arendaGrid',   'price', false);
      sortDomCards('buyoutGrid',   'price', false);
      break;
    case 'yearAsc':
      sortDomCards('prokatGrid',   'year', true);
      sortDomCards('arendaGrid',   'year', true);
      sortDomCards('buyoutGrid',   'year', true);
      break;
    case 'yearDesc':
      sortDomCards('prokatGrid',   'year', false);
      sortDomCards('arendaGrid',   'year', false);
      sortDomCards('buyoutGrid',   'year', false);
      break;
    case 'mileageAsc':
      sortDomCards('prokatGrid',   'mileage', true);
      sortDomCards('arendaGrid',   'mileage', true);
      sortDomCards('buyoutGrid',   'mileage', true);
      break;
    case 'mileageDesc':
      sortDomCards('prokatGrid',   'mileage', false);
      sortDomCards('arendaGrid',   'mileage', false);
      sortDomCards('buyoutGrid',   'mileage', false);
      break;
  }

  // Скрываем выпадающее меню после выбора
  sortOptions.setAttribute('hidden', '');
  sortBtn.setAttribute('aria-expanded', 'false');
});
// ==============================

