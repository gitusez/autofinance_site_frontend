// cartoorder.js

// export function createManualCarCard(car) {
//   const card = document.createElement('div');
//   card.className = 'car-card';

//   card.innerHTML = `
//     <img src="${car.image ? car.image : 'img/placeholder.jpg'}"
//          alt="Фото ${car.brand} ${car.model}"
//          class="car-image">
//     <div class="car-content">
//       <div class="car-left">
//         <div class="car-title">${car.brand || ''} ${car.model || ''}</div>
//         <div class="car-info">${car.price || 'Цена не указана'}</div>
//       </div>
//       <div class="car-right">
//         <div class="car-snippet">${(car.description || '').slice(0, 350)}</div>
//         <button class="car-detail-btn">ПОДРОБНЕЕ</button>
//       </div>
//     </div>
//   `;

//   // Модалка по кнопке
//   card.querySelector('.car-detail-btn').addEventListener('click', () => openManualCarModal(car));

//   return card;
// }

// export function createManualCarCard(car) {
//   const card = document.createElement('div');
//   card.className = 'car-card';

//   const firstImage = (car.images && car.images.length > 0) ? car.images[0] : 'img/placeholder.jpg';

//   card.innerHTML = `
//     <img src="${firstImage}"
//          alt="Фото ${car.brand} ${car.model}"
//          class="car-image">
//     <div class="car-content">
//       <div class="car-left">
//         <div class="car-title">${car.brand || ''} ${car.model || ''}</div>
//         <div class="car-info">${car.price || 'Цена не указана'}</div>
//       </div>
//       <div class="car-right">
//         <div class="car-snippet">${(car.description || '').slice(0, 350)}</div>
//         <button class="car-detail-btn">ПОДРОБНЕЕ</button>
//       </div>
//     </div>
//   `;

//   // Открытие модалки
//   card.querySelector('.car-detail-btn').addEventListener('click', () => openManualCarModal(car));

//   return card;
// }


// // Простая модалка для ручных машин (без fetch)
// export function openManualCarModal(car) {
//   const carModal = document.getElementById('carModal');
//   const carModalContent = document.getElementById('carModalContent');
//   carModalContent.innerHTML = `
//     <div class="car-modal-split">
//       <div class="car-modal-left">
//         <img src="${car.image ? car.image : 'img/placeholder.jpg'}" class="car-modal-main" alt="">
//       </div>
//       <div class="car-modal-right">
//         <button class="car-modal-close">&times;</button>
//         <h2 class="car-modal-title">${car.brand} ${car.model}</h2>
//         <div class="car-modal-price"><span>${car.price || ''}</span></div>
//         <div class="car-modal-specs">
//           <div><strong>Марка:</strong> ${car.brand || '—'}</div>
//           <div><strong>Модель:</strong> ${car.model || '—'}</div>
//           <div><strong>Год выпуска:</strong> ${car.year || '—'}</div>
//           <div><strong>Трансмиссия:</strong> ${car.transmission || '—'}</div>
//           <div><strong>Топливо:</strong> ${car.fuel || '—'}</div>
//           <div><strong>Пробег:</strong> ${car.mileage || '—'}</div>
//         </div>
//         <div class="car-modal-equipment"><strong>Комплектация:</strong><div class="preformatted-text">${car.equipment || '—'}</div></div>
//         <div class="car-modal-description"><strong>Описание:</strong><div class="preformatted-text">${car.description || '—'}</div></div>
//         <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
//       </div>
//     </div>
//   `;
//   carModal.style.display = 'flex';
//   document.body.style.overflow = 'hidden';

//   carModalContent.querySelector('.car-modal-close').onclick = closeManualCarModal;
//   document.getElementById('carModalOverlay').onclick = closeManualCarModal;
// }

// export function closeManualCarModal() {
//   document.getElementById('carModal').style.display = 'none';
//   document.body.style.overflow = '';
// }


// cartoorder.js

export function createManualCarCard(car) {
  const card = document.createElement('div');
  card.className = 'car-card';

  const preview = car.images?.[0] || 'img/placeholder.jpg';

  card.innerHTML = `
    <img src="${preview}"
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

  card.querySelector('.car-detail-btn').addEventListener('click', () => openManualCarModal(car));

  return card;
}

export function openManualCarModal(car) {
  const carModal = document.getElementById('carModal');
  const carModalContent = document.getElementById('carModalContent');
  const images = Array.isArray(car.images) && car.images.length > 0 ? car.images : ['img/placeholder.jpg'];

  carModalContent.innerHTML = `
    <div class="car-modal-split">
      <div class="car-modal-left">
        <div class="car-modal-gallery">
          <img src="" id="modalMainImg" class="car-modal-main" title="Двойной клик — полноэкран">
          <div class="car-modal-thumbs">
            ${images.map((src, i) => `
              <img src="${src}" class="car-modal-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
            `).join('')}
          </div>
        </div>
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

    <div class="fullscreen-gallery" id="fsGallery" style="display:none;">
      <div class="fullscreen-overlay"></div>
      <button class="gallery-prev">&#10094;</button>
      <img id="fsImg" class="fullscreen-image" />
      <button class="gallery-next">&#10095;</button>
      <button class="gallery-close">&times;</button>
      <div class="gallery-counter" id="fsCounter"></div>
    </div>
  `;

  const mainImg = carModalContent.querySelector('#modalMainImg');
  const thumbs = Array.from(carModalContent.querySelectorAll('.car-modal-thumb'));
  const fsGallery = carModalContent.querySelector('#fsGallery');
  const fsImg = fsGallery.querySelector('#fsImg');
  const fsPrev = fsGallery.querySelector('.gallery-prev');
  const fsNext = fsGallery.querySelector('.gallery-next');
  const fsClose = fsGallery.querySelector('.gallery-close');
  const fsOverlay = fsGallery.querySelector('.fullscreen-overlay');
  const fsCounter = fsGallery.querySelector('#fsCounter');

  let idx = 0;
  function setIndex(i) {
    idx = i;
    const url = images[i];
    mainImg.src = url;
    fsImg.src = url;
    fsCounter.textContent = `${i + 1} / ${images.length}`;
    thumbs.forEach(t => t.classList.toggle('active', +t.dataset.idx === i));
  }
  setIndex(0);

  thumbs.forEach(t => t.addEventListener('click', () => setIndex(+t.dataset.idx)));

  const openFs = (i) => {
    setIndex(i);
    fsGallery.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };
  const closeFs = () => {
    fsGallery.style.display = 'none';
    document.body.style.overflow = '';
  };

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
  mainImg.addEventListener('click', () => openFs(idx));
} else {
  mainImg.addEventListener('dblclick', () => openFs(idx));
}
  fsPrev.addEventListener('click', () => setIndex((idx - 1 + images.length) % images.length));
  fsNext.addEventListener('click', () => setIndex((idx + 1) % images.length));
  fsClose.addEventListener('click', closeFs);
  fsOverlay.addEventListener('click', closeFs);

  carModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  carModalContent.querySelector('.car-modal-close').onclick = () => {
    carModal.style.display = 'none';
    document.body.style.overflow = '';
  };
  document.getElementById('carModalOverlay').onclick = () => {
    carModal.style.display = 'none';
    document.body.style.overflow = '';
  };
}

