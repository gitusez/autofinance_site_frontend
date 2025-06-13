// js/admin.js
// Управление списком автомобилей, добавленных вручную

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminCarForm');
  const list = document.getElementById('carList');
  if (!form || !list) return;

const fields = ['brand','model','year','transmission','fuel','mileage','equipment','description','image','price'];

  function loadCars() {
    return JSON.parse(localStorage.getItem('manualCars') || '[]');
  }

  function saveCars(cars) {
    localStorage.setItem('manualCars', JSON.stringify(cars));
  }

  function renderList() {
    const cars = loadCars();
    list.innerHTML = '';
    cars.forEach((car, idx) => {
      const li = document.createElement('li');
      li.textContent = `${car.brand || ''} ${car.model || ''}`;
      const del = document.createElement('button');
      del.textContent = 'Удалить';
      del.style.marginLeft = '8px';
      del.addEventListener('click', () => {
        cars.splice(idx, 1);
        saveCars(cars);
        renderList();
      });
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const car = {};
    fields.forEach(f => car[f] = form.elements[f].value.trim());

    const cars = loadCars();
    cars.push(car);
    saveCars(cars);
    form.reset();
    renderList();
  });

  renderList();
});
