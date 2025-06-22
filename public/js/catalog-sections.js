
import { config }        from './config.js';
// import { createCarCard } from './catalog.js';
import { createCarCard, openCarModal } from './catalog.js';


function loadCachedCars() {
  try {
    return JSON.parse(localStorage.getItem('carsCache') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCachedCars(list) {
  try {
    localStorage.setItem('carsCache', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save cache:', e);
  }
}


window.originalCarsOrder = {
  prokat: [],
  arenda: [],
  buyout: []
};


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



function renderAllSections(allCars, openModal = true) {
  const nums = config.prokatNumbers.map(toLatinNumber);

  // — ПРОКАТ —
  let pro = [...allCars];
  nums.forEach(n => {
    if (!pro.some(c => toLatinNumber(c.number) === n)) {
      const extra = allCars.find(c => toLatinNumber(c.number) === n);
      if (extra) pro.push(extra);
    }
  });
  pro.sort((a, b) => {
    const ia = nums.indexOf(toLatinNumber(a.number));
    const ib = nums.indexOf(toLatinNumber(b.number));
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  pro = pro.filter(car => !hasSupplementary(car));

  // — АРЕНДА —
  const rent = allCars
    .filter(car => !nums.includes(toLatinNumber(car.number)))
    .filter(car => !hasSupplementary(car));

  // — ВЫКУП —
  const buy = allCars
    .filter(car => !nums.includes(toLatinNumber(car.number)));

  renderSection(pro,  'prokatGrid', 'prokat');
  renderSection(rent, 'arendaGrid', 'rent');
  renderSection(buy,  'buyoutGrid','buyout');

  if (openModal) {
    const urlParams = new URLSearchParams(window.location.search);
    const carNum = urlParams.get('car');
    if (carNum) {
      const search = carNum.replace(/\s/g, '').toLowerCase();
      let carObj = pro.find(car => (car.number || '').replace(/\s/g, '').toLowerCase() === search);
      let mode = 'prokat';
      if (!carObj) {
        carObj = rent.find(car => (car.number || '').replace(/\s/g, '').toLowerCase() === search);
        mode = 'rent';
      }
      if (!carObj) {
        carObj = buy.find(car => (car.number || '').replace(/\s/g, '').toLowerCase() === search);
        mode = 'buyout';
      }
      if (carObj && window.getComputedStyle(document.getElementById('carModal')).display === 'none') {
        openCarModal(carObj, mode);
      }
    }
  }

  window.originalCarsOrder.prokat = Array.from(document.querySelectorAll('#prokatGrid .car-card'));
  window.originalCarsOrder.arenda = Array.from(document.querySelectorAll('#arendaGrid .car-card'));
  window.originalCarsOrder.buyout = Array.from(document.querySelectorAll('#buyoutGrid .car-card'));

  if (typeof applyFilters === 'function') {
    applyFilters();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const cached = loadCachedCars();
  if (cached.length) {
    renderAllSections(cached);
  }

  try {
    const allCars = await fetchAllCars();
    renderAllSections(allCars, !cached.length);
    saveCachedCars(allCars);
  } catch (e) {
    console.error(e);
  }
});



