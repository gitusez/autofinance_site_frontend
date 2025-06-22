document.addEventListener('DOMContentLoaded', () => {
  const CACHE_KEY = 'manualCarsCache';
  const CACHE_TTL = 60 * 60 * 1000;
  const marqueeContainer = document.getElementById('marqueeContainer');

  async function fetchManualCars() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        renderCars(data);
        return;
      }
    }

    try {
      const response = await fetch('/data/manualCars.json', { cache: 'no-store' });
      const data = await response.json();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      renderCars(data);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  }

  function renderCars(cars) {
    marqueeContainer.innerHTML = '';
    cars.forEach(car => {
      const card = window.createManualCarCard(car);
      marqueeContainer.appendChild(card);
    });
  }

  fetchManualCars();
});

const carModal = document.getElementById('carModal');
const carModalContent = document.getElementById('carModalContent');
const orderModal = document.getElementById('orderModal');
const orderModalOverlay = document.getElementById('orderModalOverlay');
const orderModalContent = document.getElementById('orderModalContent');

window.createManualCarCard = function(car) {
  const card = document.createElement('div');
  card.className = 'car-card';

  const preview = car.images?.[0] || 'img/placeholder.jpg';

  card.innerHTML = `
    <img src="${preview}" alt="Фото ${car.brand} ${car.model}" class="car-image">
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

  card.querySelector('.car-detail-btn').addEventListener('click', () => window.openManualCarModal(car));
  return card;
};

window.openManualCarModal = function(car) {
  const images = Array.isArray(car.images) && car.images.length > 0 ? car.images : ['img/placeholder.jpg'];

  carModalContent.innerHTML = `
    <div class="car-modal-split">
      <div class="car-modal-left">
        <div class="car-modal-gallery">
          <img src="${images[0]}" id="modalMainImg" class="car-modal-main" title="Двойной клик — полноэкран">
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
        <div class="car-action-buttons">
          <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
          <a href="tel:+78005553432" class="car-call-btn">Позвонить</a>
          <a href="https://wa.me/78005553432" class="car-whatsapp-btn" target="_blank">WhatsApp</a>
        </div>
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

  const mainImg   = carModalContent.querySelector('#modalMainImg');
  const thumbs    = Array.from(carModalContent.querySelectorAll('.car-modal-thumb'));
  const fsGallery = carModalContent.querySelector('#fsGallery');
  const fsImg     = fsGallery.querySelector('#fsImg');
  const fsPrev    = fsGallery.querySelector('.gallery-prev');
  const fsNext    = fsGallery.querySelector('.gallery-next');
  const fsClose   = fsGallery.querySelector('.gallery-close');
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

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function openFs(i) {
  fsGallery.style.display = 'flex';
  document.body.classList.add('no-scroll');
  setIndex(i);

  // 👇 Добавляем свайп на мобильных
  if (isTouchDevice) {
    let startX = 0;
    let deltaX = 0;

    fsImg.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
      }
    });

    fsImg.addEventListener('touchmove', e => {
      if (e.touches.length === 1) {
        deltaX = e.touches[0].clientX - startX;
      }
    });

    fsImg.addEventListener('touchend', () => {
      if (Math.abs(deltaX) > 50) {
        idx = deltaX > 0
          ? (idx - 1 + images.length) % images.length
          : (idx + 1) % images.length;
        setIndex(idx);
      }
      deltaX = 0;
    });

    let pinchStartDist = 0;
    let pinchStartScale = 1;
    const getDist = (t1, t2) => {
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      return Math.hypot(dx, dy);
    };

    fsImg.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        e.preventDefault();
        pinchStartDist = getDist(e.touches[0], e.touches[1]);
        pinchStartScale = parseFloat(fsImg.dataset.scale || '1');
      }
    });

    fsImg.addEventListener('touchmove', e => {
      if (e.touches.length === 2 && pinchStartDist) {
        e.preventDefault();
        const scale = Math.min(3, Math.max(1,
          pinchStartScale * getDist(e.touches[0], e.touches[1]) / pinchStartDist));
        fsImg.dataset.scale = scale;
        fsImg.style.transform = `scale(${scale})`;
      }
    });

    fsImg.addEventListener('touchend', e => {
      if (e.touches.length < 2) {
        pinchStartDist = 0;
        fsImg.dataset.scale = '1';
        fsImg.style.transform = '';
      }
    });
  }
}


  function closeFs() {
    fsGallery.style.display = 'none';
    if (carModal.style.display === 'none') {
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = '';
    }
  }

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
  document.body.classList.add('no-scroll');
  document.documentElement.classList.add('no-scroll');
  document.body.style.overflow = 'hidden';

  carModalContent.querySelector('.car-modal-close').onclick = () => {
    carModal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
    document.body.style.overflow = '';
  };

  carModalContent.querySelector('.car-order-btn').onclick = () => {
    window.openOrderModal(car);
  };
};

window.openOrderModal = function(car) {
  orderModalContent.innerHTML = `
    <div>
      <b>${car.brand} ${car.model}</b><br />
      ${car.year ? `Год: ${car.year}<br />` : ''}
      ${car.number ? `Номер: ${car.number}<br />` : ''}
    </div>
    <p>Цена: <strong>${car.price || ''}</strong></p>

    <form class="order-form" method="POST">
      <input type="hidden" name="source" value="Авто под заказ - ${car.brand} ${car.model}" />
      <input type="hidden" name="car" value="${car.brand} ${car.model}, ${car.year || ''}, ${car.number || ''}" />
      <input type="hidden" name="price" value="${car.price || ''}" />

      <label>Имя<br /><input type="text" name="name" required /></label><br />
      <label>Телефон<br /><input type="tel" name="phone" required /></label><br />
      <button type="submit">Отправить</button>
    </form>

    <button class="order-modal-close">&times;</button>
  `;

  orderModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  orderModalContent.querySelector('.order-modal-close').onclick = window.closeOrderModal;
  orderModalOverlay.onclick = window.closeOrderModal;

  const form = orderModalContent.querySelector('.order-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch('/sendmail.php', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.text();
      if (result.trim() === 'OK') {
        orderModalContent.innerHTML = `<p>Спасибо! Мы свяжемся с вами.</p>`;
        setTimeout(window.closeOrderModal, 2000);
      } else {
        orderModalContent.innerHTML = `<p>Ошибка при отправке. Попробуйте позже.</p>`;
      }
    } catch {
      orderModalContent.innerHTML = `<p>Ошибка соединения. Проверьте интернет.</p>`;
    }
  };
};

window.closeOrderModal = function() {
  orderModal.style.display = 'none';
  document.body.style.overflow = '';
  document.body.classList.remove('no-scroll');
  document.documentElement.classList.remove('no-scroll');
};



