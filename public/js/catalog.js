// // js/catalog.js

// /**
//  * Возвращает текст цены для указанного режима проката/аренды/выкупа
//  * @param {Object} car — объект машины из API
//  * @param {'prokat'|'rent'|'buyout'} mode
//  * @returns {string}
//  */
// export function getPriceText(car, mode) {
//   return (car.manual_price && car.manual_price[mode])
//     ? car.manual_price[mode]
//     : 'Цена не указана';
// }

// /**
//  * Создает элемент карточки автомобиля и возвращает его.
//  * @param {Object} car — объект машины из API
//  * @param {'prokat'|'rent'|'buyout'} mode
//  * @returns {HTMLElement} <div class="car-card">
//  */
// export function createCarCard(car, mode) {
//   const priceText = getPriceText(car, mode);
//   // если в API задано avatar, используем его, иначе — placeholder
//   const imgUrl = car.avatar || 'img/placeholder.jpg';

//   const card = document.createElement('div');
//   card.className = 'car-card';
//   card.innerHTML = `
//     <img src="${imgUrl}" 
//          alt="${car.brand || ''} ${car.model || ''}" 
//          class="car-image">
//     <div class="car-title">
//       ${car.brand || ''} ${car.model || ''}
//     </div>
//     <div class="car-info">${priceText}</div>
//     <button class="car-detail-btn">ПОДРОБНЕЕ</button>
//   `;
//   return card;
// }








// import { config } from './config.js';

// // Маячок на загрузку модуля
// console.log('🟢 catalog.js loaded');

// // универсальный утилитарный метод
// function toLatinNumber(plate) {
//   const map = {
//     'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P',
//     'С':'C','Т':'T','У':'Y','Х':'X',
//     'а':'A','в':'B','е':'E','к':'K','м':'M','н':'H','о':'O','р':'P',
//     'с':'C','т':'T','у':'Y','х':'X'
//   };
//   return (plate||'').replace(/\s/g,'').split('').map(c=>map[c]||c).join('');
// }

// export function getPriceText(car, mode) {
//   const text = car.manual_price && car.manual_price[mode]
//     ? car.manual_price[mode]
//     : 'Цена не указана';
//   console.log(`getPriceText: [${mode}] ${car.number || ''} → ${text}`);
//   return text;
// }

// export function createCarCard(car, mode) {
//   // берём либо прямой URL (если внешний), либо префиксуем config.photoApi
//   const rawAvatar = car.avatar || '/img/placeholder.jpg';
//   const imgUrl = rawAvatar.startsWith('http')
//     ? rawAvatar
//     : `${config.photoApi}${rawAvatar}`;

//   const priceText = getPriceText(car, mode);

//   const card = document.createElement('div');
//   card.className = 'car-card';
//   card.innerHTML = `
//     <img src="${imgUrl}"
//          alt="${car.brand||''} ${car.model||''}"
//          class="car-image">
//     <div class="car-title">${car.brand||''} ${car.model||''}</div>
//     <div class="car-info">${priceText}</div>
//     <button class="car-detail-btn">ПОДРОБНЕЕ</button>
//   `;
//   card.querySelector('.car-detail-btn')
//       .addEventListener('click', e => {
//         e.stopPropagation();
//         openCarModal(car, mode);
//       });
//   return card;
// }

// // ==== все функции модалок (openCarModal, closeCarModal, openOrderModal, closeOrderModal) ====

// const carModal          = document.getElementById('carModal');
// const carModalOverlay   = document.getElementById('carModalOverlay');
// const carModalContent   = document.getElementById('carModalContent');
// const orderModal        = document.getElementById('orderModal');
// const orderModalOverlay = document.getElementById('orderModalOverlay');
// const orderModalContent = document.getElementById('orderModalContent');

// export async function openCarModal(car, mode) {
//   // 1) загрузить относительные пути из API
//   let images = [];
//   const plate = toLatinNumber(car.number||'');
//   try {
//     const resp = await fetch(`${config.photoApi}/api/photos/${plate}`);
//     const { success, photos } = await resp.json();
//     if (success && photos.length) {
//       // префиксуем каждый путь
//       images = photos.map(p => p.startsWith('http')
//         ? p
//         : `${config.photoApi}${p}`);
//     } else {
//       throw new Error('no photos');
//     }
//   } catch {
//     // fallback — один кадр
//     const rawAvatar = car.avatar || '/img/placeholder.jpg';
//     images = [ rawAvatar.startsWith('http')
//       ? rawAvatar
//       : `${config.photoApi}${rawAvatar}` ];
//   }
//   // 2) собрать specs
//   const specs = [
//     { label: 'Марка',       value: car.brand       || '—' },
//     { label: 'Модель',      value: car.model       || '—' },
//     { label: 'Год выпуска', value: car.year        || '—' },
//     { label: 'Трансмиссия', value: car.transmission|| '—' },
//     { label: 'Топливо',     value: car.fuel_type   || '—' },
//     { label: 'Пробег',      value: car.odometer_display || '—' }
//   ];
//   // 3) рисуем
//   carModalContent.innerHTML = `
//     <div class="car-modal-split">
//       <div class="car-modal-left">
//         <div class="car-modal-gallery">
//           <img src="${images[0]}" id="modalMainImg" class="car-modal-main">
//           <div class="car-modal-thumbs">
//             ${images.map((src,i)=>`
//               <img src="${src}" class="car-modal-thumb ${i===0?'active':''}" data-idx="${i}">
//             `).join('')}
//           </div>
//         </div>
//       </div>
//       <div class="car-modal-right">
//         <button class="car-modal-close">&times;</button>
//         <div class="car-modal-title">${car.brand} ${car.model}</div>
//         <div class="car-modal-price">${getPriceText(car, mode)}</div>
//         <div class="car-modal-specs">
//           ${specs.map(s=>`<div><strong>${s.label}:</strong> ${s.value}</div>`).join('')}
//         </div>
//         <div class="car-modal-desc">${car.equipment||''}</div>
//         <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
//       </div>
//     </div>
//     <div class="fullscreen-gallery" id="fsGallery" style="display:none;">
//       <div class="fullscreen-overlay"></div>
//       <button class="gallery-prev">&#10094;</button>
//       <img id="fsImg" class="fullscreen-image">
//       <button class="gallery-next">&#10095;</button>
//       <button class="gallery-close">&times;</button>
//       <div class="gallery-counter" id="fsCounter"></div>
//     </div>
//   `;
//   // … тут код для галереи и кнопок …
//   carModal.style.display = 'flex';
//   document.body.style.overflow = 'hidden';
//   carModalContent.querySelector('.car-modal-close').onclick = closeCarModal;
//   carModalOverlay.onclick = closeCarModal;
//   carModalContent.querySelector('.car-order-btn').onclick = () => openOrderModal(car, mode);
// }

// export function closeCarModal() {
//   console.log('closeCarModal');
//   carModal.style.display = 'none';
//   document.body.style.overflow = '';
// }

// export function openOrderModal(car, mode) {
//   console.log('openOrderModal:', car.id, mode);
//   const price = getPriceText(car, mode);
//   orderModalContent.innerHTML = `
//     <div class="order-modal-title">Ваш заказ:</div>
//     <div class="order-modal-car">
//       <img src="${car.avatar||'img/placeholder.jpg'}" style="width:90px;height:70px;object-fit:cover;border-radius:8px;margin-right:18px;">
//       <div style="flex:1;">
//         <b>${car.brand} ${car.model}</b><br>
//         ${car.year?`Год: ${car.year}<br>`:''}
//         ${car.number?`Номер: ${car.number}`:''}
//       </div>
//     </div>
//     <hr>
//     <form class="order-form">
//       <p>Цена: <strong>${price}</strong></p>
//       <label>Имя<br><input type="text" required></label>
//       <label>Телефон<br><input type="tel" required></label>
//       <button type="submit">Отправить заявку</button>
//     </form>
//     <button class="order-modal-close">&times;</button>
//   `;
//   orderModal.style.display = 'flex';
//   document.body.style.overflow = 'hidden';

//   orderModalContent.querySelector('.order-modal-close').onclick = closeOrderModal;
//   orderModalOverlay.onclick = closeOrderModal;
//   orderModalContent.querySelector('.order-form').onsubmit = e => {
//     e.preventDefault();
//     orderModalContent.innerHTML = `<p>Спасибо! Мы свяжемся с вами.</p>`;
//     setTimeout(closeOrderModal, 2000);
//   };
// }

// export function closeOrderModal() {
//   console.log('closeOrderModal');
//   orderModal.style.display = 'none';
//   document.body.style.overflow = '';
// }









// import { config } from './config.js';

// /** Утилита: кириллица → латиница для номера */
// function toLatinNumber(plate) {
//   const map = {
//     'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P',
//     'С':'C','Т':'T','У':'Y','Х':'X',
//     'а':'A','в':'B','е':'E','к':'K','м':'M','н':'H','о':'O','р':'P',
//     'с':'C','т':'T','у':'Y','х':'X'
//   };
//   return (plate||'').replace(/\s/g,'').split('').map(c=>map[c]||c).join('');
// }

// /** Текст цены из ручных цен */
// export function getPriceText(car, mode) {
//   return car.manual_price?.[mode] || 'Цена не указана';
// }

// /**
//  * Создаёт карточку и динамически подгружает её мини-фото.
//  * @returns HTMLElement
//  */
// export function createCarCard(car, mode) {
//   const priceText = getPriceText(car, mode);
//   // создаём обёртку
//   const card = document.createElement('div');
//   card.className = 'car-card';
//   card.innerHTML = `
//     <img src="img/placeholder.jpg" 
//          alt="Фото ${car.brand} ${car.model}" 
//          class="car-image">
//     <div class="car-title">${car.brand||''} ${car.model||''}</div>
//     <div class="car-info">${priceText}</div>
//     <button class="car-detail-btn">ПОДРОБНЕЕ</button>
//   `;

//   // по клику подменяем <img> на первую фотографию из /api/photos
//   (async () => {
//     const imgEl = card.querySelector('.car-image');
//     const plate = toLatinNumber(car.number||'');
//     try {
//       const resp = await fetch(`${config.photoApi}/api/photos/${plate}`);
//       const { success, photos } = await resp.json();
//       if (success && photos.length) {
//         imgEl.src = photos[0].startsWith('http')
//           ? photos[0]
//           : `${config.photoApi}${photos[0]}`;
//       }
//     } catch {
//       // оставляем placeholder
//     }
//   })();

//   // «ПОДРОБНЕЕ» открывает модалку
//   card.querySelector('.car-detail-btn')
//       .addEventListener('click', e => {
//         e.stopPropagation();
//         openCarModal(car, mode);
//       });

//   return card;
// }

// // —————————————————————————————————————————————————————————————
// // Ниже — весь код модалки (openCarModal / closeCarModal и fullscreen)
// // —————————————————————————————————————————————————————————————

// const carModal         = document.getElementById('carModal');
// const carModalOverlay  = document.getElementById('carModalOverlay');
// const carModalContent  = document.getElementById('carModalContent');
// const orderModal       = document.getElementById('orderModal');
// const orderModalOverlay= document.getElementById('orderModalOverlay');
// const orderModalContent= document.getElementById('orderModalContent');

// // export async function openCarModal(car, mode) {
// //   // 1) загрузить все фото
// //   const plate = toLatinNumber(car.number||'');
// //   let images = [];
// //   try {
// //     const r = await fetch(`${config.photoApi}/api/photos/${plate}`);
// //     const j = await r.json();
// //     if (j.success) images = j.photos;
// //   } catch {}
// //   // fallback на avatar или placeholder
// //   if (!images.length) {
// //     if (car.avatar) images = [ car.avatar ];
// //     else          images = [ 'img/placeholder.jpg' ];
// //   }

// //   // 2) отсортировать по номеру файла (_1, _2, _10 и т.д.)
// //   images.sort((a,b) => {
// //     const idx = src => {
// //       const m = src.match(/_(\d+)\.(jpe?g|png)/i);
// //       return m ? parseInt(m[1],10) : 0;
// //     };
// //     return idx(a) - idx(b);
// //   });

// //   // 3) собрать HTML модалки
// //   carModalContent.innerHTML = `
// //   <div class="car-modal-split">
// //     <div class="car-modal-left">
// //       <div class="car-modal-gallery">
// //         <img src="${images[0]}" id="modalMainImg" class="car-modal-main">
// //         <div class="car-modal-thumbs">
// //           ${images.map((src,i)=>`
// //             <img 
// //               src="${ src.startsWith('http') ? src : config.photoApi+src }"
// //               class="car-modal-thumb ${i===0?'active':''}"
// //               data-idx="${i}">`).join('')}
// //         </div>
// //       </div>
// //     </div>
// //     <div class="car-modal-right">
// //       <button class="car-modal-close">&times;</button>
// //       <h2 class="car-modal-title">${car.brand} ${car.model}</h2>
// //       <div class="car-modal-price">${getPriceText(car,mode)}</div>
// //       <div class="car-modal-specs">
// //         <div><strong>Марка:</strong> ${car.brand||'—'}</div>
// //         <div><strong>Модель:</strong> ${car.model||'—'}</div>
// //         <div><strong>Год выпуска:</strong> ${car.year||'—'}</div>
// //         <div><strong>Трансмиссия:</strong> ${car.transmission||'—'}</div>
// //         <div><strong>Топливо:</strong> ${car.fuel_type||'—'}</div>
// //         <div><strong>Пробег:</strong> ${car.odometer_display||'—'}</div>
// //       </div>
// //       <p class="car-modal-desc">${car.equipment||''}</p>
// //       <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
// //     </div>
// //   </div>
// //   <div class="fullscreen-gallery" id="fsGallery" style="display:none;">
// //     <div class="fullscreen-overlay"></div>
// //     <button class="gallery-prev">&#10094;</button>
// //     <img id="fsImg" class="fullscreen-image">
// //     <button class="gallery-next">&#10095;</button>
// //     <button class="gallery-close">&times;</button>
// //     <div class="gallery-counter" id="fsCounter"></div>
// //   </div>`;

// //   // 4) логика переключения и fullscreen
// //   const mainImg = carModalContent.querySelector('#modalMainImg');
// //   const thumbs  = [...carModalContent.querySelectorAll('.car-modal-thumb')];
// //   const fsGallery = carModalContent.querySelector('#fsGallery');
// //   const fsImg     = fsGallery.querySelector('#fsImg');
// //   const fsPrev    = fsGallery.querySelector('.gallery-prev');
// //   const fsNext    = fsGallery.querySelector('.gallery-next');
// //   const fsClose   = fsGallery.querySelector('.gallery-close');
// //   const fsCounter = fsGallery.querySelector('#fsCounter');
// //   let idx = 0;

// //   function setMain(i) {
// //     idx = i;
// //     mainImg.src = images[i].startsWith('http')
// //       ? images[i]
// //       : `${config.photoApi}${images[i]}`;
// //     thumbs.forEach(t => t.classList.toggle('active', +t.dataset.idx===i));
// //     fsImg.src = mainImg.src;
// //     fsCounter.textContent = `${i+1} / ${images.length}`;
// //   }

// //   // клики по миниатюрам
// //   thumbs.forEach(t => {
// //     t.addEventListener('click', ()=> setMain(+t.dataset.idx));
// //     t.addEventListener('dblclick', ()=> {
// //       fsGallery.style.display = 'flex';
// //       document.body.style.overflow = 'hidden';
// //       setMain(+t.dataset.idx);
// //     });
// //   });

// //   fsPrev.onclick  = ()=> setMain((idx-1+images.length)%images.length);
// //   fsNext.onclick  = ()=> setMain((idx+1)%images.length);
// //   fsClose.onclick = ()=> {
// //     fsGallery.style.display = 'none';
// //     document.body.style.overflow = '';
// //   };
// //   fsGallery.querySelector('.fullscreen-overlay')
// //            .onclick = fsClose;

// //   // 5) открыть модалку и навесить закрытие
// //   carModal.style.display = 'flex';
// //   document.body.style.overflow = 'hidden';
// //   carModalContent.querySelector('.car-modal-close')
// //                  .onclick = closeCarModal;
// //   carModalOverlay.onclick = closeCarModal;
// //   carModalContent.querySelector('.car-order-btn')
// //                  .onclick   = () => openOrderModal(car, mode);
// // }

// export async function openCarModal(car, mode) {
//   // … ваша логика загрузки и сортировки массива images …
//   // допустим, у вас уже есть готовый отсортированный массив `images`

//   // 3) рендерим HTML
//   carModalContent.innerHTML = `
//     <div class="car-modal-split">
//       <div class="car-modal-left">
//         <div class="car-modal-gallery">
//           <img src="" id="modalMainImg" class="car-modal-main" title="Двойной клик — полноэкран">
//           <div class="car-modal-thumbs">
//             ${images.map((src,i)=>`
//               <img 
//                 src="${src.startsWith('http') ? src : config.photoApi+src}"
//                 class="car-modal-thumb ${i===0?'active':''}"
//                 data-idx="${i}"
//               >`).join('')}
//           </div>
//         </div>
//       </div>
//       <!-- правая колонка -->
//       …
//     </div>
//     <div class="fullscreen-gallery" id="fsGallery" style="display:none;">
//       <div class="fullscreen-overlay"></div>
//       <button class="gallery-prev">&#10094;</button>
//       <img id="fsImg" class="fullscreen-image">
//       <button class="gallery-next">&#10095;</button>
//       <button class="gallery-close">&times;</button>
//       <div class="gallery-counter" id="fsCounter"></div>
//     </div>
//   `;

//   // 4) работа с DOM
//   const mainImg   = carModalContent.querySelector('#modalMainImg');
//   const thumbs    = [...carModalContent.querySelectorAll('.car-modal-thumb')];
//   const fsGallery = carModalContent.querySelector('#fsGallery');
//   const fsImg     = fsGallery.querySelector('#fsImg');
//   const fsPrev    = fsGallery.querySelector('.gallery-prev');
//   const fsNext    = fsGallery.querySelector('.gallery-next');
//   const fsClose   = fsGallery.querySelector('.gallery-close');
//   const fsCounter = fsGallery.querySelector('#fsCounter');
//   let idx = 0;

//   // Вспомогательная функция, чтобы обновить всё сразу
//   function setIndex(i) {
//     idx = i;
//     // большая картинка
//     mainImg.src = images[i].startsWith('http')
//       ? images[i]
//       : `${config.photoApi}${images[i]}`;
//     // миниатюры
//     thumbs.forEach(t => t.classList.toggle('active', +t.dataset.idx === i));
//     // full-screen
//     fsImg.src      = mainImg.src;
//     fsCounter.textContent = `${i+1} / ${images.length}`;
//   }

//   // 5) сразу показываем первую
//   setIndex(0);

//   // клики по миниатюрам
//   thumbs.forEach(t => {
//     t.addEventListener('click', () => setIndex(+t.dataset.idx));
//     // двойной клик на миниатюре — тоже полноэкран
//     t.addEventListener('dblclick', () => {
//       fsGallery.style.display = 'flex';
//       document.body.style.overflow = 'hidden';
//       setIndex(+t.dataset.idx);
//     });
//   });

//   // двойной клик по большой картинке
//   mainImg.addEventListener('dblclick', () => {
//     fsGallery.style.display = 'flex';
//     document.body.style.overflow = 'hidden';
//     setIndex(idx);
//   });

//   // навигация fullscreen
//   fsPrev.onclick = () => setIndex((idx - 1 + images.length) % images.length);
//   fsNext.onclick = () => setIndex((idx + 1) % images.length);
//   fsClose.onclick = () => {
//     fsGallery.style.display = 'none';
//     document.body.style.overflow = '';
//   };
//   fsGallery.querySelector('.fullscreen-overlay')
//            .onclick = fsClose;

//   // 6) открываем основную модалку
//   carModal.style.display = 'flex';
//   document.body.style.overflow = 'hidden';
//   carModalContent.querySelector('.car-modal-close').onclick = closeCarModal;
//   carModalOverlay.onclick = closeCarModal;
//   carModalContent.querySelector('.car-order-btn')
//                  .onclick = () => openOrderModal(car, mode);
// }


// export function closeCarModal() {
//   carModal.style.display = 'none';
//   document.body.style.overflow = '';
// }

// export function openOrderModal(car, mode) {
//   const price = getPriceText(car, mode);
//   orderModalContent.innerHTML = `
//     <h3>Ваш заказ:</h3>
//     <div style="display:flex;align-items:center;gap:12px;">
//       <img src="${ car.avatar||'img/placeholder.jpg' }" style="width:90px;height:70px;object-fit:cover;border-radius:4px;">
//       <div>
//         <b>${car.brand} ${car.model}</b><br>
//         ${car.year?`Год: ${car.year}<br>`:''}
//         ${car.number?`Номер: ${car.number}`:''}
//       </div>
//     </div>
//     <p>Цена: <strong>${price}</strong></p>
//     <form class="order-form">
//       <label>Имя<br><input type="text" required></label><br>
//       <label>Телефон<br><input type="tel" required></label><br>
//       <button type="submit">Отправить</button>
//     </form>
//     <button class="order-modal-close">&times;</button>
//   `;
//   orderModal.style.display = 'flex';
//   document.body.style.overflow = 'hidden';
//   orderModalContent.querySelector('.order-modal-close').onclick = closeOrderModal;
//   orderModalOverlay.onclick = closeOrderModal;
//   orderModalContent.querySelector('.order-form').onsubmit = e => {
//     e.preventDefault();
//     orderModalContent.innerHTML = `<p>Спасибо! Мы свяжемся с вами.</p>`;
//     setTimeout(closeOrderModal, 1500);
//   };
// }

// export function closeOrderModal() {
//   orderModal.style.display = 'none';
//   document.body.style.overflow = '';
// }


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

export function createCarCard(car, mode) {
  const priceText = getPriceText(car, mode);

  const card = document.createElement('div');
  card.className = 'car-card';
  card.innerHTML = `
    <img src="img/placeholder.jpg"
         alt="Фото ${car.brand} ${car.model}"
         class="car-image">
    <div class="car-title">${car.brand||''} ${car.model||''}</div>
    <div class="car-info">${priceText}</div>
    <button class="car-detail-btn">ПОДРОБНЕЕ</button>
  `;

  // Асинхронно подгружаем первую фотографию через API /api/photos/${plate}
  (async () => {
    const imgEl = card.querySelector('.car-image');
    const plate = toLatinNumber(car.number || '');
    try {
      const resp = await fetch(`${config.photoApi}/api/photos/${plate}`);
      const arr = await resp.json(); // здесь resp.json() — это массив строк
      if (Array.isArray(arr) && arr.length > 0) {
        const first = arr[0].startsWith('/')
          ? arr[0]
          : `/photos/${plate}/${arr[0]}`;
        imgEl.src = first.startsWith('http')
          ? first
          : `${config.photoApi}${first}`;
      }
    } catch {
      // если ошибка или фоток нет, оставляем placeholder
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

// export async function openCarModal(car, mode) {
//   const plate = toLatinNumber(car.number || '');
//   let images = [];

//   try {
//     const resp = await fetch(`${config.photoApi}/api/photos/${plate}`);
//     const arr = await resp.json(); // теперь resp.json() — это массив строк
//     if (Array.isArray(arr) && arr.length > 0) {
//       images = arr.map(item => {
//         if (item.startsWith('/')) {
//           return item.startsWith('http')
//             ? item
//             : `${config.photoApi}${item}`;
//         }
//         return `${config.photoApi}/photos/${plate}/${item}`;
//       });
//     }
//   } catch {
//     // если ошибка, оставляем пустой массив → попадём в fallback ниже
//   }

//   // fallback: если нет фотографий, берём avatar или placeholder
//   if (!images.length) {
//     images = car.avatar
//       ? [car.avatar]
//       : ['img/placeholder.jpg'];
//   }

//   // Сортируем массив images по номеру суффикса (_1, _2, _10 и т. д.)
//   images.sort((a, b) => {
//     const idx = src => {
//       const m = src.match(/_(\d+)\.(?:jpe?g|png)$/i);
//       return m ? +m[1] : 0;
//     };
//     return idx(a) - idx(b);
//   });

//   // Собираем HTML модалки:
//   carModalContent.innerHTML = `
//     <div class="car-modal-split">
//       <div class="car-modal-left">
//         <div class="car-modal-gallery">
//           <img src="" id="modalMainImg" class="car-modal-main"
//                title="Двойной клик — полноэкран">
//           <div class="car-modal-thumbs">
//             ${images.map((src,i) => `
//               <img
//                 src="${src}"
//                 class="car-modal-thumb ${i===0?'active':''}"
//                 data-idx="${i}">
//             `).join('')}
//           </div>
//         </div>
//       </div>
//       <div class="car-modal-right">
//         <button class="car-modal-close">&times;</button>
//         <h2 class="car-modal-title">${car.brand} ${car.model}</h2>
//         <div class="car-modal-price">${getPriceText(car, mode)}</div>
//         <div class="car-modal-specs">
//           <div><strong>Марка:</strong> ${car.brand||'—'}</div>
//           <div><strong>Модель:</strong> ${car.model||'—'}</div>
//           <div><strong>Год выпуска:</strong> ${car.year||'—'}</div>
//           <div><strong>Трансмиссия:</strong> ${car.transmission||'—'}</div>
//           <div><strong>Топливо:</strong> ${car.fuel_type||'—'}</div>
//           <div><strong>Пробег:</strong> ${car.odometer_display||'—'}</div>
//         </div>
//         <p class="car-modal-desc">${car.equipment || ''}</p>
//         <button class="car-order-btn">ОСТАВИТЬ ЗАЯВКУ</button>
//       </div>
//     </div>

//     <div class="fullscreen-gallery" id="fsGallery" style="display:none;">
//       <div class="fullscreen-overlay"></div>
//       <button class="gallery-prev">&#10094;</button>
//       <img id="fsImg" class="fullscreen-image" />
//       <button class="gallery-next">&#10095;</button>
//       <button class="gallery-close">&times;</button>
//       <div class="gallery-counter" id="fsCounter"></div>
//     </div>
//   `;

//   // Логика переключения картинок и fullscreen:
//   const mainImg   = carModalContent.querySelector('#modalMainImg');
//   const thumbs    = Array.from(carModalContent.querySelectorAll('.car-modal-thumb'));
//   const fsGallery = carModalContent.querySelector('#fsGallery');
//   const fsImg     = fsGallery.querySelector('#fsImg');
//   const fsPrev    = fsGallery.querySelector('.gallery-prev');
//   const fsNext    = fsGallery.querySelector('.gallery-next');
//   const fsClose   = fsGallery.querySelector('.gallery-close');
//   const fsOverlay = fsGallery.querySelector('.fullscreen-overlay');
//   const fsCounter = fsGallery.querySelector('#fsCounter');
//   let idx = 0;

//   function setIndex(i) {
//     idx = i;
//     const url = images[i];
//     mainImg.src = url;
//     fsImg.src = url;
//     fsCounter.textContent = `${i + 1} / ${images.length}`;
//     thumbs.forEach(t => t.classList.toggle('active', +t.dataset.idx === i));
//   }

//   // Показываем первую фотографию
//   setIndex(0);

//   // Навешиваем клики на миниатюры
//   thumbs.forEach(t => {
//     t.addEventListener('click', () => setIndex(+t.dataset.idx));
//     t.addEventListener('dblclick', e => {
//       e.stopPropagation();
//       fsGallery.style.display = 'flex';
//       document.body.style.overflow = 'hidden';
//       setIndex(+t.dataset.idx);
//     });
//   });

//   // Двойной клик по «большой» картинке
//   mainImg.addEventListener('dblclick', e => {
//     e.stopPropagation();
//     fsGallery.style.display = 'flex';
//     document.body.style.overflow = 'hidden';
//     setIndex(idx);
//   });

//   // Кнопки вперед/назад в fullscreen
//   fsPrev.addEventListener('click', e => {
//     e.stopPropagation();
//     setIndex((idx - 1 + images.length) % images.length);
//   });
//   fsNext.addEventListener('click', e => {
//     e.stopPropagation();
//     setIndex((idx + 1) % images.length);
//   });

//   // Закрытие fullscreen-галереи
//   const closeFs = () => {
//     fsGallery.style.display = 'none';
//     document.body.style.overflow = '';
//   };
//   fsClose.addEventListener('click', e => {
//     e.stopPropagation();
//     closeFs();
//   });
//   fsOverlay.addEventListener('click', e => {
//     e.stopPropagation();
//     closeFs();
//   });

//   // Открываем «основную» модалку с деталями:
//   carModal.style.display = 'flex';
//   document.body.style.overflow = 'hidden';
//   carModalContent
//     .querySelector('.car-modal-close')
//     .addEventListener('click', closeCarModal);
//   carModalOverlay.addEventListener('click', closeCarModal);
//   carModalContent
//     .querySelector('.car-order-btn')
//     .addEventListener('click', () => openOrderModal(car, mode));
// }

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
          <div><strong>Трансмиссия:</strong> ${car.transmission || '—'}</div>
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

