// filters.js
document.addEventListener('DOMContentLoaded', function() {
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
      const thisYear = new Date().getFullYear();
      if (activeTab === 'used') {
        if (cardYear === thisYear && cardMileage <= 100) show = false;
      }
      if (activeTab === 'new') {
        if (!(cardYear === thisYear && cardMileage <= 100)) show = false;
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
      if (show && activeFlags['transmission'] && activeFlags['transmission'].length) {
        if (!activeFlags['transmission'].includes(cardTransmission)) show = false;
      }
      // Привод
      if (show && activeFlags['drive'] && activeFlags['drive'].length) {
        if (!activeFlags['drive'].includes(cardDrive)) show = false;
      }
      // Тип двигателя
      if (show && activeFlags['fuel'] && activeFlags['fuel'].length) {
        if (!activeFlags['fuel'].includes(cardFuel)) show = false;
      }
      // Цвет
      if (show && colorValue !== 'any') {
        if (cardColor !== colorValue) show = false;
      }

      // Показываем или скрываем
      card.style.display = show ? '' : 'none';
    });
  }

  // Сброс всех фильтров
  function resetFilters() {
    // 1) Сброс табов
    tabs.forEach((t, idx) => {
      if (idx === 0) t.classList.add('active');
      else t.classList.remove('active');
    });
    // 2) Сброс чекбоксов
    checkboxes.forEach(ch => ch.checked = false);
    // 3) Сброс радиокнопок «Цвет»
    radioColors.forEach(r => {
      if (r.value === 'any') r.checked = true;
      else r.checked = false;
    });
    // 4) Сброс селекта «Марка»
    selectBrand.value = 'any';
    // 5) Сброс инпутов «Цена», «Год», «Пробег»
    inputPriceMin.value = '';
    inputPriceMax.value = '';
    inputYearMin.value = '';
    inputYearMax.value = '';
    inputMileageMin.value = '';
    inputMileageMax.value = '';
    // 6) Применяем фильтры заново
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

  // Сразу после загрузки показываем все карточки
  applyFilters();
});
