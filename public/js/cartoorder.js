// // js/cartoorder.js
// // Отображает вручную добавленные автомобили на странице cartoorder.html

// function renderManualCars() {
//   const container = document.getElementById('manualCarsContainer');
//   if (!container) return;

//   const cars = JSON.parse(localStorage.getItem('manualCars') || '[]');
//   if (!cars.length) {
//     container.innerHTML = '<p>Нет данных для отображения</p>';
//     container.style.display = '';
//     return;
//   }

//   container.innerHTML = '';
//   cars.forEach(data => {
//     const card = document.createElement('div');
//     card.className = 'car-card';
//     card.innerHTML = `
//       <div class="car-title">${data.brand || ''} ${data.model || ''}</div>
//       <div class="car-info">${data.year || ''}</div>
//       <div class="car-snippet">
//         <p><strong>Трансмиссия:</strong> ${data.transmission || ''}</p>
//         <p><strong>Топливо:</strong> ${data.fuel || ''}</p>
//         <p><strong>Пробег:</strong> ${data.mileage || ''}</p>
//         <p><strong>Комплектация:</strong> ${data.equipment || ''}</p>
//         <p>${data.description || ''}</p>
//       </div>`;
//     container.appendChild(card);
//   });
//   container.style.display = '';
// }

document.addEventListener('DOMContentLoaded', renderManualCars);


function renderManualCars() {
  const container = document.getElementById('manualCarsContainer');
  if (!container) return;

  const cars = JSON.parse(localStorage.getItem('manualCars') || '[]');
  if (!cars.length) {
    container.innerHTML = '<p>Нет данных для отображения</p>';
    container.style.display = '';
    return;
  }

  container.innerHTML = '';

  cars.forEach((car, index) => {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.setAttribute('data-index', index);

    card.innerHTML = `
      <img src="${car.image || 'img/placeholder.jpg'}" alt="${car.brand} ${car.model}">
      <div class="car-card-title">${car.brand || ''} ${car.model || ''}</div>
      <div class="car-card-price">${car.price || 'Цена по запросу'}</div>
      <button class="car-card-button">ПОДРОБНЕЕ</button>
    `;

    card.querySelector('.car-card-button').addEventListener('click', () => {
      openCarModal(car);
    });

    container.appendChild(card);
  });

  container.style.display = '';
}

function openCarModal(car) {
  const modal = document.getElementById('carModal');
  const modalBody = document.getElementById('modalBody');

  modalBody.innerHTML = `
    <h2>${car.brand || ''} ${car.model || ''}</h2>
    <p><strong>Год:</strong> ${car.year || '—'}</p>
    <p><strong>Пробег:</strong> ${car.mileage || '—'}</p>
    <p><strong>Трансмиссия:</strong> ${car.transmission || '—'}</p>
    <p><strong>Топливо:</strong> ${car.fuel || '—'}</p>
    <p><strong>Комплектация:</strong> ${car.equipment || '—'}</p>
    <p><strong>Описание:</strong> ${car.description || '—'}</p>
  `;

  modal.classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  renderManualCars();

  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('carModal').classList.remove('open');
    });
  }
});
