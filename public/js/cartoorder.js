// cartoorder.js

export function createManualCarCard(car) {
  const card = document.createElement('div');
  card.className = 'car-card';

  card.innerHTML = `
    <img src="${car.image ? car.image : 'img/placeholder.jpg'}"
         alt="Фото ${car.brand} ${car.model}"
         class="car-image">
    <div class="car-content">
      <div class="car-left">
        <div class="car-title">${car.brand || ''} ${car.model || ''}</div>
        <div class="car-info">${car.price || 'Цена не указана'}</div>
      </div>
      <div class="car-right">
        <div class="car-snippet">${(car.description || '').slice(0, 350)}</div>
        <button class="car-detail-btn">ПОДРОБНЕЕ</button>
      </div>
    </div>
  `;

  // Модалка по кнопке
  card.querySelector('.car-detail-btn').addEventListener('click', () => openManualCarModal(car));

  return card;
}

// Простая модалка для ручных машин (без fetch)
export function openManualCarModal(car) {
  const carModal = document.getElementById('carModal');
  const carModalContent = document.getElementById('carModalContent');
  carModalContent.innerHTML = `
    <div class="car-modal-split">
      <div class="car-modal-left">
        <img src="${car.image ? car.image : 'img/placeholder.jpg'}" class="car-modal-main" alt="">
      </div>
      <div class="car-modal-right">
        <button class="car-modal-close">&times;</button>
        <h2 class="car-modal-title">${car.brand} ${car.model}</h2>
        <div class="car-modal-price"><span>${car.price || ''}</span></div>
        <div class="car-modal-specs">
          <div><strong>Марка:</strong> ${car.brand || '—'}</div>
          <div><strong>Модель:</strong> ${car.model || '—'}</div>
          <div><strong>Год выпуска:</strong> ${car.year || '—'}</div>
          <div><strong>Трансмиссия:</strong> ${car.transmission || '—'}</div>
          <div><strong>Топливо:</strong> ${car.fuel || '—'}</div>
          <div><strong>Пробег:</strong> ${car.mileage || '—'}</div>
        </div>
        <div class="car-modal-equipment"><strong>Комплектация:</strong><div class="preformatted-text">${car.equipment || '—'}</div></div>
        <div class="car-modal-description"><strong>Описание:</strong><div class="preformatted-text">${car.description || '—'}</div></div>
        <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
      </div>
    </div>
  `;
  carModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  carModalContent.querySelector('.car-modal-close').onclick = closeManualCarModal;
  document.getElementById('carModalOverlay').onclick = closeManualCarModal;
}

export function closeManualCarModal() {
  document.getElementById('carModal').style.display = 'none';
  document.body.style.overflow = '';
}
