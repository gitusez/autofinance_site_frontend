// js/cartoorder.js
// Отображает вручную заданную карточку автомобиля на странице cartoorder.html

function renderManualCar() {
  const container = document.getElementById('manualCarCard');
  if (!container) return;

  const data = JSON.parse(localStorage.getItem('manualCar') || '{}');
  if (!data.brand) {
    container.style.display = 'none';
    return;
  }

  container.innerHTML = `
    <div class="car-title">${data.brand || ''} ${data.model || ''}</div>
    <div class="car-info">${data.year || ''}</div>
    <div class="car-snippet">
      <p><strong>Трансмиссия:</strong> ${data.transmission || ''}</p>
      <p><strong>Топливо:</strong> ${data.fuel || ''}</p>
      <p><strong>Пробег:</strong> ${data.mileage || ''}</p>
      <p><strong>Комплектация:</strong> ${data.equipment || ''}</p>
      <p>${data.description || ''}</p>
    </div>
  `;
  container.style.display = '';
}

document.addEventListener('DOMContentLoaded', renderManualCar);