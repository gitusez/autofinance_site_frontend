// // js/catalog-sections.js

// import { config }        from './config.js';
// import { createCarCard } from './catalog.js';

// /**
//  * Преобразует кириллический номер в латиницу для сравнения
//  */
// function toLatinNumber(plate) {
//   const map = {
//     'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P',
//     'С':'C','Т':'T','У':'Y','Х':'X',
//     'а':'A','в':'B','е':'E','к':'K','м':'M','н':'H','о':'O','р':'P',
//     'с':'C','т':'T','у':'Y','х':'X'
//   };
//   return (plate || '')
//     .replace(/\s/g, '')
//     .split('')
//     .map(c => map[c] || c)
//     .join('');
// }

// /**
//  * Проверяет, установлено ли дополнительное оборудование
//  */
// function hasSupplementary(car) {
//   return /Установлено доп/i.test(car.equipment || '');
// }

// /**
//  * Запрашивает у API полный список машин
//  */
// async function fetchAllCars() {
//   console.log('[LOG] fetchAllCars: items =', config.itemsInitial);
//   const res = await fetch(config.apiUrl, {
//     method:  'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body:    JSON.stringify({ items: config.itemsInitial, offset: 0 })
//   });
//   if (!res.ok) throw new Error(`API error ${res.status}`);
//   const { cars_list, total } = await res.json();
//   const list = Array.isArray(cars_list) ? cars_list : [];
//   console.log('[LOG] fetchAllCars: получено машин =', list.length,
//               total ? `(total=${total})` : '');
//   return list;
// }

// /**
//  * Рендерит массив cars в контейнер containerId с нужным режимом mode
//  */
// function renderSection(cars, containerId, mode) {
//   console.log(`[LOG] renderSection "${containerId}" mode=${mode}: ${cars.length} шт.`);
//   const container = document.getElementById(containerId);
//   if (!container) return console.warn(`Контейнер "${containerId}" не найден`);
//   container.innerHTML = '';
//   const frag = document.createDocumentFragment();
//   cars.forEach(car => frag.appendChild(createCarCard(car, mode)));
//   container.appendChild(frag);
// }

// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const allCars    = await fetchAllCars();
//     const prokatNums = config.prokatNumbers.map(toLatinNumber);
//     console.log('[LOG] Всего машин:', allCars.length);

//     // 1) ПРОКАТ: 
//     //    - Берём ВСЕ машины
//     //    - Гарантированно добавляем номера из prokatNums (если чего-то не было)
//     //    - Сортируем по приоритету prokatNums
//     //    - Исключаем доп. оборудование
//     let prokatList = [...allCars];
//     // добавить недостающие по prokatNums
//     prokatNums.forEach(num => {
//       if (!prokatList.some(car => toLatinNumber(car.number) === num)) {
//         const extra = allCars.find(car => toLatinNumber(car.number) === num);
//         if (extra) prokatList.push(extra);
//       }
//     });
//     // сортировка по приоритету
//     prokatList.sort((a, b) => {
//       const na = toLatinNumber(a.number), nb = toLatinNumber(b.number);
//       const ia = prokatNums.indexOf(na), ib = prokatNums.indexOf(nb);
//       if (ia !== -1 || ib !== -1) {
//         if (ia === -1) return 1;
//         if (ib === -1) return -1;
//         return ia - ib;
//       }
//       return 0;
//     });
//     // фильтр по доп. оборудованию
//     prokatList = prokatList.filter(car => !hasSupplementary(car));
//     console.log('[LOG] prokatList (после фильтров):', prokatList.length);

//     // 2) АРЕНДА:
//     //    - Все машины, НЕ в prokatNums
//     //    - Исключаем доп. оборудование
//     const rentList = allCars
//       .filter(car => !prokatNums.includes(toLatinNumber(car.number)))
//       .filter(car => !hasSupplementary(car));
//     console.log('[LOG] rentList:', rentList.length);

//     // 3) ВЫКУП:
//     //    - Все машины, НЕ в prokatNums
//     //    - НЕ исключаем доп. оборудование
//     const buyoutList = allCars
//       .filter(car => !prokatNums.includes(toLatinNumber(car.number)));
//     console.log('[LOG] buyoutList:', buyoutList.length);

//     renderSection(prokatList, 'prokatGrid', 'prokat');
//     renderSection(rentList,   'arendaGrid', 'rent');
//     renderSection(buyoutList, 'buyoutGrid', 'buyout');

//   } catch (err) {
//     console.error('Ошибка в catalog-sections.js:', err);
//   }
// });








// import { config }        from './config.js';
// import { createCarCard } from './catalog.js';

// // Маячок на загрузку
// console.log('🟢 catalog-sections.js loaded');

// function toLatinNumber(plate) {
//   const map = {
//     'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P',
//     'С':'C','Т':'T','У':'Y','Х':'X',
//     'а':'A','в':'B','е':'E','к':'K','м':'M','н':'H','о':'O','р':'P',
//     'с':'C','т':'T','у':'Y','х':'X'
//   };
//   return (plate||'').replace(/\s/g,'').split('').map(c=>map[c]||c).join('');
// }

// function hasSupplementary(car) {
//   return /Установлено доп/i.test(car.equipment || '');
// }

// async function fetchAllCars() {
//   console.log('[LOG] fetchAllCars: отправляем запрос, items=', config.itemsInitial);
//   const res = await fetch(config.apiUrl, {
//     method:  'POST',
//     headers: {'Content-Type':'application/json'},
//     body:    JSON.stringify({ items: config.itemsInitial, offset: 0 })
//   });
//   if (!res.ok) {
//     console.error('[ERROR] fetchAllCars HTTP', res.status);
//     throw new Error(`API error ${res.status}`);
//   }
//   const { cars_list, total } = await res.json();
//   const list = Array.isArray(cars_list) ? cars_list : [];
//   console.log(`[LOG] fetchAllCars: получено ${list.length} машин (total=${total})`);
//   return list;
// }

// function renderSection(cars, containerId, mode) {
//   console.log(`[LOG] renderSection "${containerId}" (${mode}): ${cars.length} шт.`);
//   const container = document.getElementById(containerId);
//   if (!container) {
//     console.warn(`❗ контейнер "${containerId}" не найден`);
//     return;
//   }
//   container.innerHTML = '';
//   const frag = document.createDocumentFragment();
//   cars.forEach(car => {
//     frag.appendChild(createCarCard(car, mode));
//   });
//   container.appendChild(frag);
// }

// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const allCars    = await fetchAllCars();
//     const prokatNums = config.prokatNumbers.map(toLatinNumber);
//     console.log('[LOG] Всего машин в allCars:', allCars.length);

//     // === ПРОКАТ ===
//     let prokatList = [...allCars];
//     prokatNums.forEach(num => {
//       if (!prokatList.some(c => toLatinNumber(c.number) === num)) {
//         const extra = allCars.find(c => toLatinNumber(c.number) === num);
//         if (extra) prokatList.push(extra);
//       }
//     });
//     prokatList.sort((a, b) => {
//       const na = toLatinNumber(a.number), nb = toLatinNumber(b.number);
//       const ia = prokatNums.indexOf(na), ib = prokatNums.indexOf(nb);
//       if (ia !== -1 || ib !== -1) {
//         if (ia === -1) return 1;
//         if (ib === -1) return -1;
//         return ia - ib;
//       }
//       return 0;
//     });
//     prokatList = prokatList.filter(car => !hasSupplementary(car));
//     console.log('[LOG] prokatList после фильтров:', prokatList.length);

//     // === АРЕНДА ===
//     const rentList = allCars
//       .filter(car => !prokatNums.includes(toLatinNumber(car.number)))
//       .filter(car => !hasSupplementary(car));
//     console.log('[LOG] rentList:', rentList.length);

//     // === ВЫКУП ===
//     const buyoutList = allCars
//       .filter(car => !prokatNums.includes(toLatinNumber(car.number)));
//     console.log('[LOG] buyoutList:', buyoutList.length);

//     renderSection(prokatList, 'prokatGrid', 'prokat');
//     renderSection(rentList,   'arendaGrid', 'rent');
//     renderSection(buyoutList, 'buyoutGrid', 'buyout');

//   } catch (err) {
//     console.error('❌ Ошибка в catalog-sections.js:', err);
//     // Можно показать пользователю сообщение об ошибке в каждом контейнере
//   }
// });


import { config }        from './config.js';
import { createCarCard } from './catalog.js';

async function fetchAllCars() {
  const res = await fetch(config.apiUrl, {
    method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ items: config.itemsInitial, offset: 0 })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const { cars_list } = await res.json();
  return Array.isArray(cars_list) ? cars_list : [];
}

function toLatinNumber(plate) {
  const map = {'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P','С':'C','Т':'T','У':'Y','Х':'X',
               'а':'A','в':'B','е':'E','к':'K','м':'M','н':'H','о':'O','р':'P','с':'C','т':'T','у':'Y','х':'X'};
  return (plate||'').replace(/\s/g,'').split('').map(c=>map[c]||c).join('');
}

function hasSupplementary(car) {
  return /Установлено доп/i.test(car.equipment||'');
}

function renderSection(list, containerId, mode) {
  const c = document.getElementById(containerId);
  c.innerHTML = '';
  const fr = document.createDocumentFragment();
  list.forEach(car => fr.appendChild(createCarCard(car, mode)));
  c.appendChild(fr);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const allCars = await fetchAllCars();
    const nums    = config.prokatNumbers.map(toLatinNumber);

    // — ПРОКАТ —
    let pro = [...allCars];
    nums.forEach(n => {
      if (!pro.some(c=>toLatinNumber(c.number)===n)) {
        const extra = allCars.find(c=>toLatinNumber(c.number)===n);
        if (extra) pro.push(extra);
      }
    });
    pro.sort((a,b)=>{
      const ia = nums.indexOf(toLatinNumber(a.number));
      const ib = nums.indexOf(toLatinNumber(b.number));
      if (ia===-1 && ib===-1) return 0;
      if (ia===-1) return 1;
      if (ib===-1) return -1;
      return ia-ib;
    });
    pro = pro.filter(car=>!hasSupplementary(car));

    // — АРЕНДА —
    const rent = allCars
      .filter(car=>!nums.includes(toLatinNumber(car.number)))
      .filter(car=>!hasSupplementary(car));

    // — ВЫКУП —
    const buy = allCars
      .filter(car=>!nums.includes(toLatinNumber(car.number)));

    renderSection(pro,   'prokatGrid', 'prokat');
    renderSection(rent,  'arendaGrid', 'rent');
    renderSection(buy,   'buyoutGrid','buyout');

  } catch (e) {
    console.error(e);
  }
});
