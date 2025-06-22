// js/catalog.js

import { config } from './config.js';


function loadCachedPhotos(plate) {
  try {
    const cache = JSON.parse(localStorage.getItem('photosCache') || '{}');
    return cache[plate] || null;
  } catch {
    return null;
  }
}

function saveCachedPhotos(plate, urls) {
  try {
    const cache = JSON.parse(localStorage.getItem('photosCache') || '{}');
    cache[plate] = urls;
    localStorage.setItem('photosCache', JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save photo cache:', e);
  }
}

/** Утилита: кириллица → латиница */
function toLatinNumber(plate) {
  const map = {
    'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P',
    'С':'C','Т':'T','У':'Y','Х':'X',
    'а':'A','в':'B','е':'E','к':'K','м':'M','н':'H','о':'O','р':'P',
    'с':'C','т':'T','у':'Y','х':'X'
  };
  return (plate||'').replace(/\s/g,'').split('').map(c=>map[c]||c).join('');
}

/** Возвращает текст цены */
export function getPriceText(car, mode) {
  return car.manual_price?.[mode] || 'Цена не указана';
}

function extractPrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.match(/\d{3,6}/);
  return match ? parseInt(match[0], 10) : 0;
}

export function createCarCard(car, mode) {


  const priceText = getPriceText(car, mode);
  const priceValue = extractPrice(priceText);

  const card = document.createElement('div');


  card.className = 'car-card';

  // ✅ Вставляем data-* атрибуты до innerHTML
  card.dataset.price        = priceValue;
  card.dataset.year         = car.year || 0;
  card.dataset.mileage      = car.odometer || 0;
  card.dataset.name         = `${car.brand || ''} ${car.model || ''}`;
  card.dataset.fuel         = car.fuel_type || '';
  
  // card.dataset.transmission = car.transmission || '';
  // Стало:
  let transmission = '';
  if (car.transmission === 'mt') transmission = 'МКПП';
  else if (car.transmission === 'at') transmission = 'АКПП';
  else transmission = car.transmission || '';
  card.dataset.transmission = transmission;

  card.dataset.drive        = car.drive || '';
  card.dataset.color        = car.color || '';
//   card.dataset.discount     = car.discount ? 'true' : 'false';

const isDiscount = car.discount || (car.manual_price && car.manual_price.discount);
card.dataset.discount = isDiscount ? 'true' : 'false';

  card.dataset.gifts        = car.gifts ? 'true' : 'false';
  card.dataset.credit       = car.credit ? 'true' : 'false';
  card.dataset.select       = car.select ? 'true' : 'false';

card.innerHTML = `
  <img src="img/placeholder.jpg"
      alt="Фото ${car.brand} ${car.model}"
      class="car-image">
       
  <div class="car-content">
    <div class="car-left">
      <div class="car-title">${car.brand || ''} ${car.model || ''}</div>
      <div class="car-info">${priceText}</div>
    </div>
    <div class="car-right">
      <div class="car-snippet">${(car.description || '').slice(0, 350)}</div>
      <button class="car-detail-btn">ПОДРОБНЕЕ</button>
    </div>
  </div>
`;


  // Загрузка фото с учётом кэша
(async () => {
  const imgEl = card.querySelector('.car-image');
  const plate = toLatinNumber(car.number || '');
  const cached = loadCachedPhotos(plate);
  if (Array.isArray(cached) && cached.length > 0) {
    imgEl.src = cached[0];
    document.getElementById('loader').style.display = 'none';
    return;
  }
  try {
    const resp = await fetch(`${config.photoApi}/api/photos/${plate}`);
    const arr = await resp.json();
    if (Array.isArray(arr) && arr.length > 0) {
      const urls = arr.map(item => {
        const path = item.startsWith('/') ? item : `/photos/${plate}/${item}`;
        return path.startsWith('http') ? path : `${config.photoApi}${path}`;
      });
      imgEl.src = urls[0];
      saveCachedPhotos(plate, urls);
    }
  } catch {
    // Оставляем placeholder
  } finally {
    document.getElementById('loader').style.display = 'none';
  }
})();





  // Навешиваем на кнопку «ПОДРОБНЕЕ» открытие модалки
  card.querySelector('.car-detail-btn')
      .addEventListener('click', e => {
        e.stopPropagation();
        openCarModal(car, mode);
      });

  return card;
}

const carModal          = document.getElementById('carModal');
const carModalOverlay   = document.getElementById('carModalOverlay');
const carModalContent   = document.getElementById('carModalContent');
const orderModal        = document.getElementById('orderModal');
const orderModalOverlay = document.getElementById('orderModalOverlay');
const orderModalContent = document.getElementById('orderModalContent');

/** Открывает модалку с деталями */

export async function openCarModal(car, mode) {
  const plate = toLatinNumber(car.number || '');
  let images = loadCachedPhotos(plate) || [];
  document.body.classList.add('no-scroll'); // ← добавь сюда

  if (!images.length) {
    try {
      const resp = await fetch(`${config.photoApi}/api/photos/${plate}`);
      const arr = await resp.json(); // массив строк с именами файлов
      if (Array.isArray(arr) && arr.length > 0) {
        images = arr.map(item => {
          const path = item.startsWith('/') ? item : `/photos/${plate}/${item}`;
          return path.startsWith('http') ? path : `${config.photoApi}${path}`;
        });
        saveCachedPhotos(plate, images);
      }
    } catch {
      // В случае ошибки оставляем images пустым
    }
  }

// /** Открывает модалку с деталями */

  // Если фоток нет, используем avatar или placeholder
  if (!images.length) {
    images = car.avatar
      ? [car.avatar]
      : ['img/placeholder.jpg'];
  }

  // Сортируем массив images по суффиксу (_1, _2, _10 и т.п.)
  images.sort((a, b) => {
    const idx = src => {
      const m = src.match(/_(\d+)\.(?:jpe?g|png)$/i);
      return m ? +m[1] : 0;
    };
    return idx(a) - idx(b);
  });

let transmissionLabel = '';
const tr = (car.transmission || '').toLowerCase();
if (tr === 'mt') transmissionLabel = 'Механическая коробка';
else if (tr === 'at') transmissionLabel = 'Автомат';
else transmissionLabel = car.transmission || '—';


  // Формируем HTML модалки
  carModalContent.innerHTML = `
    <div class="car-modal-split">
      <!-- Левая колонка: галерея -->
      <div class="car-modal-left">
        <div class="car-modal-gallery">
          <img src="" id="modalMainImg" class="car-modal-main"
              title="Двойной клик — полноэкран">
          <div class="car-modal-thumbs">
            ${images.map((src, i) => `
              <img src="${src}"
                  class="car-modal-thumb ${i === 0 ? 'active' : ''}"
                  data-idx="${i}">
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Правая колонка: детали автомобиля -->
      <div class="car-modal-right">
        <button class="car-modal-close">&times;</button>

        <h2 class="car-modal-title">${car.brand} ${car.model}</h2>
        <div class="car-modal-price"><span>${getPriceText(car, mode)}</span></div>

        <div class="car-modal-specs">
          <div><strong>Марка:</strong> ${car.brand || '—'}</div>
          <div><strong>Модель:</strong> ${car.model || '—'}</div>
          <div><strong>Год выпуска:</strong> ${car.year || '—'}</div>
          <div><strong>Трансмиссия:</strong> ${transmissionLabel}</div>
          <div><strong>Топливо:</strong> ${car.fuel_type || '—'}</div>
          <div><strong>Пробег:</strong> ${car.odometer_display || '—'}</div>
        </div>

        <!-- Новое поле: Комплектация (с сохранением переносов строк) -->
        <div class="car-modal-equipment">
          <strong>Комплектация:</strong>
          <div class="preformatted-text">
            ${car.equipment ? car.equipment : '&mdash;'}
          </div>
        </div>

        <!-- Новое поле: Описание (с сохранением переносов строк) -->
        <div class="car-modal-description">
          <strong>Описание:</strong>
          <div class="preformatted-text">
            ${car.description ? car.description : '&mdash;'}
          </div>
        </div>
        




        <button class="car-share-btn" style="margin-left:12px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
        
        <div class="car-action-buttons">
  <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
  <a href="tel:+78005553432" class="car-call-btn" title="Позвонить">
    Позвонить
  </a>
  <a href="https://wa.me/78005553432" class="car-whatsapp-btn" title="Написать в WhatsApp" target="_blank">
    WhatsApp
  </a>
</div>

      </div>
    </div>

    <!-- Fullscreen-галерея (скрыта по умолчанию) -->
    <div class="fullscreen-gallery" id="fsGallery" style="display:none;">
      <div class="fullscreen-overlay"></div>
      <button class="gallery-prev">&#10094;</button>
      <img id="fsImg" class="fullscreen-image" />
      <button class="gallery-next">&#10095;</button>
      <button class="gallery-close">&times;</button>
      <div class="gallery-counter" id="fsCounter"></div>
    </div>
  `;


  // Навешиваем обработчики на кнопки внутри модалки
carModalContent.querySelector('.car-modal-close').addEventListener('click', closeCarModal);
carModalOverlay.addEventListener('click', closeCarModal);
carModalContent.querySelector('.car-order-btn').addEventListener('click', () => openOrderModal(car, mode));


const shareBtn = carModalContent.querySelector('.car-share-btn');
if (shareBtn) {
  const url = `${window.location.origin}${window.location.pathname}?car=${encodeURIComponent(car.number || '')}`;

  shareBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(url);

      // Добавляем временный эффект "нажатия"
      shareBtn.classList.add('clicked');
      setTimeout(() => {
        shareBtn.classList.remove('clicked');
      }, 180); // короткое время — имитация клика
    } catch {
      alert('Не удалось скопировать ссылку');
    }
  };
}



  // Логика переключения картинок и fullscreen
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
  let pinchStartDist = 0;
  let pinchStartScale = 1;

  function setIndex(i) {
    idx = i;
    const url = images[i];
    mainImg.src = url;
    fsImg.src = url;
    fsCounter.textContent = `${i + 1} / ${images.length}`;
    thumbs.forEach(t => t.classList.toggle('active', +t.dataset.idx === i));
  }

  setIndex(0);


const openFs = i => {
  fsGallery.style.display = 'flex';
  document.body.classList.add('no-scroll');  // 👈 добавь это
  setIndex(i);

  // 👇 свайп-влево/вправо
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

  fsImg.addEventListener('touchend', e => {
    if (Math.abs(deltaX) > 50) {
      idx = deltaX > 0
        ? (idx - 1 + images.length) % images.length
        : (idx + 1) % images.length;
      setIndex(idx);
    }
    deltaX = 0;
  });
};


  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  thumbs.forEach(t => {
    t.addEventListener('click', () => setIndex(+t.dataset.idx));
    if (isTouchDevice) {
      t.addEventListener('click', e => {
        e.stopPropagation();
        openFs(+t.dataset.idx);
      });
    } else {
      t.addEventListener('dblclick', e => {
        e.stopPropagation();
        openFs(+t.dataset.idx);
      });
    }
  });

  if (isTouchDevice) {
    mainImg.addEventListener('click', e => {
      e.stopPropagation();
      openFs(idx);
    });
  } else {
    mainImg.addEventListener('dblclick', e => {
      e.stopPropagation();
      openFs(idx);
    });
  }

  fsPrev.addEventListener('click', e => {
    e.stopPropagation();
    setIndex((idx - 1 + images.length) % images.length);
  });
  fsNext.addEventListener('click', e => {
    e.stopPropagation();
    setIndex((idx + 1) % images.length);
  });

  // pinch zoom for fullscreen image on touch devices
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
    if (e.touches.length < 2) pinchStartDist = 0;
  });


const closeFs = () => {
  fsGallery.style.display = 'none';

  // Проверяем: если основная модалка всё ещё открыта, не разблокируем прокрутку
  if (carModal.style.display === 'none') {
    document.body.style.overflow = '';
    document.body.classList.remove('no-scroll');
  }
};

  fsClose.addEventListener('click', e => {
    e.stopPropagation();
    closeFs();
  });
  fsOverlay.addEventListener('click', e => {
    e.stopPropagation();
    closeFs();
  });

  // Открываем основную модалку
  carModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  carModalContent.querySelector('.car-modal-close').addEventListener('click', closeCarModal);
  carModalOverlay.addEventListener('click', closeCarModal);
  carModalContent.querySelector('.car-order-btn').addEventListener('click', () => openOrderModal(car, mode));

  
}

/** Закрывает окно деталей */
export function closeCarModal() {
  carModal.style.display = 'none';
  document.body.style.overflow = '';
  document.body.classList.remove('no-scroll');

}


// /** Открывает окно заказа */ <h3>Ваш заказ:</h3>

export function openOrderModal(car, mode) {
  const price = getPriceText(car, mode);
  orderModalContent.innerHTML = `
    <div>
      <b>${car.brand} ${car.model}</b><br />
      ${car.year ? `Год: ${car.year}<br />` : ''}
      ${car.number ? `Номер: ${car.number}` : ''}
    </div>
    <p>Цена: <strong>${price}</strong></p>

    <form class="order-form" method="POST">
      <input type="hidden" name="source" value="Каталог - ${car.brand} ${car.model}" />
      <input type="hidden" name="car" value="${car.brand} ${car.model}, ${car.year || ''}, ${car.number || ''}" />
      <input type="hidden" name="price" value="${price}" />

      <label>Имя<br /><input type="text" name="name" required /></label><br />
      <label>Телефон<br /><input type="tel" name="phone" required /></label><br />
      <button type="submit">Отправить</button>
    </form>

    <button class="order-modal-close">&times;</button>
  `;

  orderModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  orderModalContent.querySelector('.order-modal-close').onclick = closeOrderModal;
  orderModalOverlay.onclick = closeOrderModal;

  const form = orderModalContent.querySelector('.order-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch('/sendmail.php', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const result = await response.text();

      if (result.trim() === 'OK') {
        orderModalContent.innerHTML = `<p>Спасибо! Мы свяжемся с вами.</p>`;
        setTimeout(closeOrderModal, 2000);
      } else {
        orderModalContent.innerHTML = `<p>Ошибка при отправке. Попробуйте позже.</p>`;
      }
    } catch (err) {
      orderModalContent.innerHTML = `<p>Ошибка соединения. Проверьте интернет.</p>`;
    }
  };
}


export function closeOrderModal() {
  orderModal.style.display = 'none';
  document.body.style.overflow = '';
}


