// Каталог авто
const carGrid = document.getElementById('carGrid');
const searchInput = document.getElementById('catalogSearch');
const carModal = document.getElementById('carModal');
const carModalContent = document.getElementById('carModalContent');
const carModalOverlay = document.getElementById('carModalOverlay');
const orderModal = document.getElementById('orderModal');
const orderModalContent = document.getElementById('orderModalContent');
const orderModalOverlay = document.getElementById('orderModalOverlay');

function getCarFromCard(card) {
  if (card.dataset.id) {
    return {
      id: card.dataset.id,
      name: card.dataset.name,
      nameRu: card.dataset.nameru,
      price: parseInt(card.dataset.price),
      priceText: card.dataset.pricetext,
      images: card.dataset.images.split(','),
      specs: JSON.parse(card.dataset.specs),  
      description: card.dataset.description
    };
  }
  return null;
}

function renderCars(list) {
  // Сохраняем существующие карточки с data-атрибутами
  const existingCards = Array.from(carGrid.querySelectorAll('.car-card[data-id]'));
  const existingIds = new Set(existingCards.map(card => card.dataset.id));
  
  // Очищаем только карточки из массива
  carGrid.querySelectorAll('.car-card:not([data-id])').forEach(card => card.remove());
  
  // Добавляем новые карточки из массива
  list.forEach(car => {
    if (!existingIds.has(car.id)) {
      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
        <img src="${car.images[0]}" alt="${car.name}" class="car-image">
        <div class="car-title">${car.name}</div>
        <div class="car-info">${car.priceText}</div>
        <button class="car-detail-btn">ПОДРОБНЕЕ</button>
      `;
      card.setAttribute('data-id', car.id);
      card.setAttribute('data-name', car.name);
      card.setAttribute('data-nameru', car.nameRu);
      card.setAttribute('data-price', car.price);
      card.setAttribute('data-pricetext', car.priceText);
      card.setAttribute('data-images', car.images.join(','));
      card.setAttribute('data-specs', JSON.stringify(car.specs));
      card.setAttribute('data-description', car.description);
      card.addEventListener('click', () => openCarModal(car));
      carGrid.appendChild(card);
    }
  });
}

function searchCars(query) {
  query = query.trim().toLowerCase();
  const allCards = Array.from(carGrid.querySelectorAll('.car-card'));
  return allCards.filter(card => {
    const car = getCarFromCard(card);
    if (!car) return false;
    return car.name.toLowerCase().includes(query) ||
           car.nameRu.toLowerCase().includes(query);
  });
}

// --- Поиск по карточкам ---
// searchInput.addEventListener('input', function() {
//   const query = this.value.trim().toLowerCase();
//   const allCards = Array.from(carGrid.querySelectorAll('.car-card'));
//   allCards.forEach(card => {
//     const car = getCarFromCard(card);
//     if (!car) return;
//     const matches = car.name.toLowerCase().includes(query) ||
//                    car.nameRu.toLowerCase().includes(query);
//     card.style.display = matches ? '' : 'none';
//   });
// });

// Рендерим только карточки из массива

function openCarModal(car) {
  console.log('Opening modal for car:', car); // Отладочный вывод
  carModal.style.display = 'flex';
  carModalContent.innerHTML = `
    <div class="car-modal-split">
      <div class="car-modal-left">
        <div class="car-modal-gallery">
          <img src="${car.images[0]}" class="car-modal-main" id="carModalMainImg" style="cursor:zoom-in;">
          <div class="car-modal-thumbs">
            ${car.images.map((img, i) => `<img src="${img}" class="car-modal-thumb${i===0?' active':''}" data-idx="${i}" style="cursor:pointer;">`).join('')}
          </div>
        </div>
      </div>
      <div class="car-modal-right">
        <button class="car-modal-close" style="position:absolute;top:18px;right:18px;z-index:10;">&times;</button>
        <div class="car-modal-title">${car.name}</div>
        <div class="car-modal-price">${car.priceText}</div>
        <div class="car-modal-specs car-modal-specs-grid">
          ${car.specs.map(s => `<div class='car-spec-item'><span class='car-spec-label'>${s.label}:</span> <span class='car-spec-value'>${s.value}</span></div>`).join('')}
        </div>
        <div class="car-modal-desc">${car.description}</div>
        <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
      </div>
    </div>
    <div class="fullscreen-gallery" id="fullscreenGallery" style="display:none;">
      <div class="fullscreen-overlay" id="fullscreenOverlay"></div>
      <button class="gallery-nav gallery-prev" id="galleryPrev" style="left:20px;">&#10094;</button>
      <img src="${car.images[0]}" class="fullscreen-image" id="fullscreenImg">
      <button class="gallery-nav gallery-next" id="galleryNext" style="right:20px;">&#10095;</button>
      <button class="gallery-close" id="galleryClose">&times;</button>
      <div class="gallery-counter" id="galleryCounter">1 / ${car.images.length}</div>
    </div>
  `;
  // Галерея
  const mainImg = carModalContent.querySelector('#carModalMainImg');
  const thumbs = carModalContent.querySelectorAll('.car-modal-thumb');
  let currentIdx = 0;
  function setMain(idx) {
    mainImg.src = car.images[idx];
    thumbs.forEach((t,i)=>t.classList.toggle('active',i===idx));
    currentIdx = idx;
  }
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', function(e) {
      setMain(i);
    });
    thumb.addEventListener('dblclick', function(e) {
      openFullscreen(i);
    });
  });
  mainImg.onclick = () => openFullscreen(currentIdx);
  // Закрытие
  carModalContent.querySelector('.car-modal-close').onclick = closeCarModal;
  carModalOverlay.onclick = closeCarModal;
  // Оставить заявку
  carModalContent.querySelector('.car-order-btn').onclick = () => openOrderModal(car);

  // Полноэкранная галерея
  const fullscreenGallery = carModalContent.querySelector('#fullscreenGallery');
  const fullscreenImg = carModalContent.querySelector('#fullscreenImg');
  const galleryPrev = carModalContent.querySelector('#galleryPrev');
  const galleryNext = carModalContent.querySelector('#galleryNext');
  const galleryClose = carModalContent.querySelector('#galleryClose');
  const galleryCounter = carModalContent.querySelector('#galleryCounter');
  const fullscreenOverlay = carModalContent.querySelector('#fullscreenOverlay');
  function openFullscreen(idx) {
    fullscreenGallery.style.display = 'flex';
    setFullscreen(idx);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', fullscreenKeyHandler);
  }
  function closeFullscreen() {
    fullscreenGallery.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', fullscreenKeyHandler);
  }
  function setFullscreen(idx) {
    fullscreenImg.src = car.images[idx];
    galleryCounter.textContent = (idx+1) + ' / ' + car.images.length;
    currentIdx = idx;
  }
  function fullscreenKeyHandler(e) {
    if (fullscreenGallery.style.display !== 'flex') return;
    if (e.key === 'ArrowLeft') galleryPrev.click();
    if (e.key === 'ArrowRight') galleryNext.click();
    if (e.key === 'Escape') galleryClose.click();
  }
  galleryPrev.onclick = function(e) {
    e.stopPropagation();
    setFullscreen((currentIdx-1+car.images.length)%car.images.length);
  };
  galleryNext.onclick = function(e) {
    e.stopPropagation();
    setFullscreen((currentIdx+1)%car.images.length);
  };
  galleryClose.onclick = closeFullscreen;
  fullscreenOverlay.onclick = closeFullscreen;
  fullscreenImg.onclick = function(e) { e.stopPropagation(); };
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', function(e) {
      if (e.detail === 2) openFullscreen(i);
    });
  });
  fullscreenGallery.addEventListener('keydown', function(e) {
    if (fullscreenGallery.style.display !== 'flex') return;
    if (e.key === 'ArrowLeft') galleryPrev.click();
    if (e.key === 'ArrowRight') galleryNext.click();
    if (e.key === 'Escape') galleryClose.click();
  });
  fullscreenGallery.tabIndex = 0;

  // Закрытие по Escape для модального окна
  function escListener(e) {
    if (e.key === 'Escape') closeCarModal();
  }
  document.addEventListener('keydown', escListener);
  // Удаляем обработчик при закрытии
  function closeCarModalWithCleanup() {
    document.removeEventListener('keydown', escListener);
    closeCarModal();
  }
  carModalContent.querySelector('.car-modal-close').onclick = closeCarModalWithCleanup;
  carModalOverlay.onclick = closeCarModalWithCleanup;
  // Переопределяем функцию закрытия
  function closeCarModal() {
    carModal.style.display = 'none';
  }
}

function openOrderModal(car) {
  orderModal.style.display = 'flex';
  let quantity = 1;
  function getTotal() {
    return car.price * quantity;
  }
  function renderOrder() {
    orderModalContent.innerHTML = `
      <div class="order-modal-title">Ваш заказ:</div>
      <div class="order-modal-car">
        <img src="${car.images[0]}" alt="${car.name}" style="width:90px;height:70px;object-fit:cover;border-radius:8px;margin-right:18px;">
        <div style="flex:1;">
          <b style="font-size:1.15rem;">${car.name}</b><br>
          <span style="font-size:0.98rem;">${car.specs.map(s => `${s.label}: ${s.value}`).join('<br>')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-left:18px;">
          <button class="order-qty-btn" id="orderQtyMinus">&minus;</button>
          <span id="orderQtyVal" style="min-width:24px;display:inline-block;text-align:center;">${quantity}</span>
          <button class="order-qty-btn" id="orderQtyPlus">+</button>
        </div>
        <div style="font-weight:600;font-size:1.1rem;margin-left:18px;">${getTotal().toLocaleString()} ₽ в сутки</div>
        <button class="order-remove-btn" id="orderRemove" style="margin-left:18px;font-size:1.3rem;background:none;border:none;color:#888;cursor:pointer;">&times;</button>
      </div>
      <hr style="margin:18px 0;">
      <div style="font-size:1.2rem;font-weight:700;text-align:right;margin-bottom:18px;">Сумма: <span id="orderTotal">${getTotal().toLocaleString()} ₽ в сутки</span></div>
      <form class="order-form">
        <label>Ваше имя<br><input type="text" required style="width:100%;padding:12px 10px;font-size:1.1rem;margin-top:4px;margin-bottom:12px;"></label>
        <label>Ваш телефон<br><input type="tel" required style="width:100%;padding:12px 10px;font-size:1.1rem;margin-top:4px;margin-bottom:12px;"></label>
        <button type="submit" style="width:100%;background:#000;color:#fff;font-size:1.2rem;font-weight:700;padding:16px 0;border-radius:8px;margin-top:10px;cursor:pointer;">Отправить заявку</button>
      </form>
      <button class="order-modal-close" id="orderModalClose" style="position:absolute;top:18px;right:18px;font-size:2rem;background:none;border:none;color:#888;cursor:pointer;">&times;</button>
    `;
    // qty
    orderModalContent.querySelector('#orderQtyMinus').onclick = () => { if(quantity>1){quantity--;renderOrder();} };
    orderModalContent.querySelector('#orderQtyPlus').onclick = () => { quantity++;renderOrder(); };
    orderModalContent.querySelector('#orderRemove').onclick = () => { closeOrderModal(); };
    orderModalContent.querySelector('#orderModalClose').onclick = () => { closeOrderModal(); };
    orderModalContent.querySelector('.order-form').onsubmit = function(e) {
      e.preventDefault();
      orderModalContent.innerHTML = '<div style="padding:60px 0; font-size:1.3rem; text-align:center;">Спасибо! Ваша заявка отправлена.<br>Мы свяжемся с вами в ближайшее время.</div>';
      setTimeout(closeOrderModal, 2000);
    };
  }
  renderOrder();
  orderModalOverlay.onclick = closeOrderModal;
}

function closeOrderModal() {
  orderModal.style.display = 'none';
}

// Навешиваем обработчик на все карточки
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, adding click handlers'); // Отладочный вывод
  const cards = carGrid.querySelectorAll('.car-card');
  console.log('Found cards:', cards.length); // Отладочный вывод
  
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      console.log('Card clicked:', this.dataset.id); // Отладочный вывод
      const car = getCarFromCard(this);
      console.log('Car data:', car); // Отладочный вывод
      if (car) {
        openCarModal(car);
      }
    });
  });
}); 