// js/admin.js

// Сохраняем и загружаем данные карточки авто в localStorage

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminCarForm');
  if (!form) return;

  const fields = ['brand','model','year','transmission','fuel','mileage','equipment','description'];
  const saved = JSON.parse(localStorage.getItem('manualCar') || '{}');
  fields.forEach(f => {
    if (form.elements[f]) form.elements[f].value = saved[f] || '';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = {};
    fields.forEach(f => {
      data[f] = form.elements[f].value.trim();
    });
    localStorage.setItem('manualCar', JSON.stringify(data));
    alert('Данные сохранены');
  });
});