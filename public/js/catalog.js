// js/catalog.js

import { config } from './config.js';

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
  card.dataset.discount     = car.discount ? 'true' : 'false';
  card.dataset.gifts        = car.gifts ? 'true' : 'false';
  card.dataset.credit       = car.credit ? 'true' : 'false';
  card.dataset.select       = car.select ? 'true' : 'false';

  card.innerHTML = `
    <img src="img/placeholder.jpg"
         alt="Фото ${car.brand} ${car.model}"
         class="car-image">
    <div class="car-title">${car.brand || ''} ${car.model || ''}</div>
    <div class="car-info">${priceText}</div>
    <button class="car-detail-btn">ПОДРОБНЕЕ</button>
  `;

  // Загрузка фото
  (async () => {
    const imgEl = card.querySelector('.car-image');
    const plate = toLatinNumber(car.number || '');
    try {
      const resp = await fetch(`${config.photoApi}/api/photos/${plate}`);
      const arr = await resp.json();
      if (Array.isArray(arr) && arr.length > 0) {
        const first = arr[0].startsWith('/')
          ? arr[0]
          : `/photos/${plate}/${arr[0]}`;
        imgEl.src = first.startsWith('http')
          ? first
          : `${config.photoApi}${first}`;
      }
    } catch {
      // Оставляем placeholder
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
  let images = [];

  try {
    const resp = await fetch(`${config.photoApi}/api/photos/${plate}`);
    const arr = await resp.json(); // массив строк с именами файлов
    if (Array.isArray(arr) && arr.length > 0) {
      images = arr.map(item => {
        if (item.startsWith('/')) {
          return item.startsWith('http')
            ? item
            : `${config.photoApi}${item}`;
        }
        return `${config.photoApi}/photos/${plate}/${item}`;
      });
    }
  } catch {
    // В случае ошибки оставляем images пустым
  }

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

        <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
        <button class="car-share-btn" style="margin-left:12px;">Поделиться</button>
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

// === ВСТАВЬТЕ СЮДА этот блок: ===
const shareBtn = carModalContent.querySelector('.car-share-btn');
if (shareBtn) {
  const url = `${window.location.origin}${window.location.pathname}?car=${encodeURIComponent(car.number || '')}`;
  shareBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      shareBtn.textContent = 'Ссылка скопирована!';
      setTimeout(() => { shareBtn.textContent = 'Поделиться'; }, 1200);
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

  function setIndex(i) {
    idx = i;
    const url = images[i];
    mainImg.src = url;
    fsImg.src = url;
    fsCounter.textContent = `${i + 1} / ${images.length}`;
    thumbs.forEach(t => t.classList.toggle('active', +t.dataset.idx === i));
  }

  setIndex(0);

  thumbs.forEach(t => {
    t.addEventListener('click', () => setIndex(+t.dataset.idx));
    t.addEventListener('dblclick', e => {
      e.stopPropagation();
      fsGallery.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      setIndex(+t.dataset.idx);
    });
  });

  mainImg.addEventListener('dblclick', e => {
    e.stopPropagation();
    fsGallery.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setIndex(idx);
  });

  fsPrev.addEventListener('click', e => {
    e.stopPropagation();
    setIndex((idx - 1 + images.length) % images.length);
  });
  fsNext.addEventListener('click', e => {
    e.stopPropagation();
    setIndex((idx + 1) % images.length);
  });

  const closeFs = () => {
    fsGallery.style.display = 'none';
    document.body.style.overflow = '';
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
}

/** Открывает окно заказа */
export function openOrderModal(car, mode) {
  const price = getPriceText(car, mode);
  orderModalContent.innerHTML = `
    <h3>Ваш заказ:</h3>
    <div style="display:flex;align-items:center;gap:12px;">
      <img
        src="${car.avatar || 'img/placeholder.jpg'}"
        style="width:90px;height:70px;object-fit:cover;border-radius:4px"
      />
      <div>
        <b>${car.brand} ${car.model}</b><br />
        ${car.year ? `Год: ${car.year}<br />` : ''} ${car.number ? `Номер: ${car.number}` : ''}
      </div>
    </div>
    <p>Цена: <strong>${price}</strong></p>
    <form class="order-form">
      <label>Имя<br /><input type="text" required /></label><br />
      <label>Телефон<br /><input type="tel" required /></label><br />
      <button type="submit">Отправить</button>
    </form>
    <button class="order-modal-close">&times;</button>
  `;
  orderModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  orderModalContent
    .querySelector('.order-modal-close')
    .onclick = closeOrderModal;
  orderModalOverlay.onclick = closeOrderModal;
  orderModalContent.querySelector('.order-form').onsubmit = e => {
    e.preventDefault();
    orderModalContent.innerHTML = `<p>Спасибо! Мы свяжемся с вами.</p>`;
    setTimeout(closeOrderModal, 1500);
  };
}

export function closeOrderModal() {
  orderModal.style.display = 'none';
  document.body.style.overflow = '';
}


document.addEventListener('DOMContentLoaded', () => {
  const burgerBtn   = document.getElementById('burgerBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const closeMenuBtn = document.getElementById('closeMenu');
  if (!burgerBtn || !menuOverlay || !closeMenuBtn) return;

  burgerBtn.addEventListener('click', () => {
    menuOverlay.classList.toggle('active');
  });

  closeMenuBtn.addEventListener('click', () => {
    menuOverlay.classList.remove('active');
  });

  menuOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuOverlay.classList.remove('active');
    });
  });
});

