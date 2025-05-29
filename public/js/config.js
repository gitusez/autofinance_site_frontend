// export const config = {
//   apiUrl: "https://autofinanceapp.ru/api/cars/combined",
//   photoApi: "http://localhost:3000",
//   itemsInitial: 100,
//   itemsLoadMore: 20,
//   prokatNumbers: ['М505КУ126', 'Н300СТ126', 'Н505МР126']
// };

// // Маячок, чтобы точно видеть, что config подхватился
// console.log('🟢 config.js loaded:', config);

// js/config.js
export const config = {
  // вместо localhost:3000
  apiUrl:   "https://autofinanceapp.ru/api/cars/combined",
  photoApi: "https://autofinanceapp.ru",
  itemsInitial: 100,
  itemsLoadMore: 20,
  prokatNumbers: ['М505КУ126','Н300СТ126','Н505МР126']
};

console.log('🟢 config.js loaded:', config);

