// js/catalog.js

/**
 * Возвращает текст цены для указанного режима проката/аренды/выкупа
 * @param {Object} car — объект машины из API
 * @param {'prokat'|'rent'|'buyout'} mode
 * @returns {string}
 */
export function getPriceText(car, mode) {
  return (car.manual_price && car.manual_price[mode])
    ? car.manual_price[mode]
    : 'Цена не указана';
}

/**
 * Создает элемент карточки автомобиля и возвращает его.
 * @param {Object} car — объект машины из API
 * @param {'prokat'|'rent'|'buyout'} mode
 * @returns {HTMLElement} <div class="car-card">
 */
export function createCarCard(car, mode) {
  const priceText = getPriceText(car, mode);
  // если в API задано avatar, используем его, иначе — placeholder
  const imgUrl = car.avatar || 'img/placeholder.jpg';

  const card = document.createElement('div');
  card.className = 'car-card';
  card.innerHTML = `
    <img src="${imgUrl}" 
         alt="${car.brand || ''} ${car.model || ''}" 
         class="car-image">
    <div class="car-title">
      ${car.brand || ''} ${car.model || ''}
    </div>
    <div class="car-info">${priceText}</div>
    <button class="car-detail-btn">ПОДРОБНЕЕ</button>
  `;
  return card;
}
