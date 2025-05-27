// js/catalog-sections.js

import { config }        from './config.js';
import { createCarCard } from './catalog.js';

/** Преобразует кириллический номер в «латиницу» для фильтрации */
function toLatinNumber(plate) {
  const map = {
    'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P','С':'C','Т':'T','У':'Y','Х':'X',
    'а':'A','в':'B','е':'E','к':'K','м':'M','н':'H','о':'O','р':'P','с':'C','т':'T','у':'Y','х':'X'
  };
  return plate.replace(/\s/g, '')
              .split('')
              .map(c => map[c] || c)
              .join('');
}

/** Запрашивает полный список машин с бэка */
async function fetchAllCars() {
  const res = await fetch(config.apiUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ items: config.itemsInitial, offset: 0 })
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.cars_list) ? data.cars_list : [];
}

/** Фильтрует «Прокат» по списку номеров в config.prokatNumbers */
function isProkat(car) {
  const num = toLatinNumber((car.number || '').toUpperCase());
  return config.prokatNumbers
               .map(toLatinNumber)
               .includes(num);
}

/** Фильтрует «Выкуп» по наличию ручной цены buyout */
function isBuyout(car) {
  return car.manual_price && car.manual_price.buyout;
}

/** Рендерит переданный массив cars в контейнер с id=containerId */
function renderSection(cars, containerId, mode) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  cars.forEach(car => {
    frag.appendChild(createCarCard(car, mode));
  });
  container.appendChild(frag);
}

// Точка входа: запускаем после полной загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const allCars = await fetchAllCars();

    // 1) Прокат: те, чьи номера в config.prokatNumbers
    const prokatCars = allCars.filter(isProkat);

    // 2) Выкуп: не прокат и есть ручная цена buyout
    const buyoutCars = allCars
      .filter(car => !isProkat(car))
      .filter(isBuyout);

    // 3) Аренда: все остальные
    const arendaCars = allCars
      .filter(car => !isProkat(car))
      .filter(car => !isBuyout(car));

    // Отображаем в три секции
    renderSection(prokatCars,  'prokatGrid', 'prokat');
    renderSection(arendaCars,   'arendaGrid', 'rent');
    renderSection(buyoutCars,   'buyoutGrid', 'buyout');
  } catch (err) {
    console.error('Ошибка при загрузке каталога:', err);
  }
});
