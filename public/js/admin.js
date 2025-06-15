// // js/admin.js
// // Управление списком автомобилей, добавленных вручную

// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('adminCarForm');
//   const list = document.getElementById('carList');
//   if (!form || !list) return;

// const fields = ['brand','model','year','transmission','fuel','mileage','equipment','description','image','price'];

//   function loadCars() {
//     return JSON.parse(localStorage.getItem('manualCars') || '[]');
//   }

//   function saveCars(cars) {
//     localStorage.setItem('manualCars', JSON.stringify(cars));
//   }

//   function renderList() {
//     const cars = loadCars();
//     list.innerHTML = '';
//     cars.forEach((car, idx) => {
//       const li = document.createElement('li');
//       li.textContent = `${car.brand || ''} ${car.model || ''}`;
//       const del = document.createElement('button');
//       del.textContent = 'Удалить';
//       del.style.marginLeft = '8px';
//       del.addEventListener('click', () => {
//         cars.splice(idx, 1);
//         saveCars(cars);
//         renderList();
//       });
//       li.appendChild(del);
//       list.appendChild(li);
//     });
//   }

//   form.addEventListener('submit', e => {
//     e.preventDefault();
//     const car = {};
//     fields.forEach(f => car[f] = form.elements[f].value.trim());

//     const cars = loadCars();
//     cars.push(car);
//     saveCars(cars);
//     form.reset();
//     renderList();
//   });

//   renderList();
// });


// const form = document.getElementById('carForm');
// const carList = document.getElementById('carList');
// let cars = [];

// function renderCars() {
//   carList.innerHTML = '';
//   cars.forEach((car, index) => {
//     const item = document.createElement('div');
//     item.className = 'car-item';
//     item.innerHTML = `
//       <img src="${car.image}" alt="${car.brand} ${car.model}" width="120">
//       <div>
//         <strong>${car.brand} ${car.model}</strong><br>
//         ${car.year}, ${car.transmission}, ${car.fuel}, ${car.mileage} км<br>
//         <em>${car.price}</em>
//         <p>${car.description}</p>
//       </div>
//       <button class="delete-btn" data-index="${index}">Удалить</button>
//     `;
//     carList.appendChild(item);
//   });

//   document.querySelectorAll('.delete-btn').forEach(btn => {
//     btn.addEventListener('click', e => {
//       const i = e.target.dataset.index;
//       cars.splice(i, 1);
//       saveCarsToServer(cars);
//       renderCars();
//     });
//   });
// }

// function saveCarsToServer(cars) {
//   fetch('/admin/save-cars.php', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(cars)
//   })
//     .then(res => res.text())
//     .then(msg => {
//       console.log('✅ Сохранено на сервере:', msg);
//     })
//     .catch(err => {
//       console.error('❌ Ошибка при сохранении:', err);
//       alert('Ошибка при сохранении на сервер');
//     });
// }

// if (form) {
//   form.addEventListener('submit', e => {
//     e.preventDefault();

//     const car = {
//       brand: form.brand.value.trim(),
//       model: form.model.value.trim(),
//       year: form.year.value,
//       transmission: form.transmission.value,
//       fuel: form.fuel.value,
//       mileage: form.mileage.value,
//       equipment: form.equipment.value.trim(),
//       description: form.description.value.trim(),
//       image: form.image.value.trim(),
//       price: form.price.value.trim()
//     };

//     cars.push(car);
//     saveCarsToServer(cars);
//     renderCars();
//     form.reset();
//   });
// }


// function loadCarsFromServer() {
//   fetch('/data/manualCars.json')
//     .then(res => res.json())
//     .then(data => {
//       cars = Array.isArray(data) ? data : [];
//       renderCars();
//     })
//     .catch(err => {
//       console.warn('⚠️ Не удалось загрузить машины с сервера:', err);
//     });
// }

// loadCarsFromServer();





// const form = document.getElementById('carForm');
// const carList = document.getElementById('carList');
// let cars = [];

// function renderCars() {
//   carList.innerHTML = '';
//   cars.forEach((car, index) => {
//     const item = document.createElement('div');
//     item.className = 'car-item';
//     item.innerHTML = `
//       <img src="${car.image ? car.image : 'img/placeholder.jpg'}" alt="${car.brand} ${car.model}" width="120">
//       <div>
//         <strong>${car.brand} ${car.model}</strong><br>
//         ${car.year}, ${car.transmission}, ${car.fuel}, ${car.mileage} км<br>
//         <em>${car.price}</em>
//         <p>${car.description}</p>
//       </div>
//       <button class="delete-btn" data-index="${index}">Удалить</button>
//     `;
//     carList.appendChild(item);
//   });

//   document.querySelectorAll('.delete-btn').forEach(btn => {
//     btn.addEventListener('click', e => {
//       const i = e.target.dataset.index;
//       cars.splice(i, 1);
//       saveCarsToServer(cars);
//       renderCars();
//     });
//   });
// }

// function saveCarsToServer(cars) {
//   fetch('/admin/save-cars.php', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(cars)
//   })
//     .then(res => res.text())
//     .then(msg => {
//       console.log('✅ Сохранено на сервере:', msg);
//     })
//     .catch(err => {
//       console.error('❌ Ошибка при сохранении:', err);
//       alert('Ошибка при сохранении на сервер');
//     });
// }

// if (form) {
//   form.addEventListener('submit', async e => {
//     e.preventDefault();

//     // === Новый код для загрузки фото ===
//     const imageFile = form.imageFile.files[0];
//     let imageUrl = '';

//     if (imageFile) {
//       const formData = new FormData();
//       formData.append('file', imageFile);

//       try {
//         const resp = await fetch('/admin/upload.php', {
//           method: 'POST',
//           body: formData
//         });
//         const data = await resp.json();
//         if (data.success) {
//           imageUrl = data.url;
//         } else {
//           alert('Ошибка при загрузке фото: ' + data.error);
//           return;
//         }
//       } catch (err) {
//         alert('Ошибка при загрузке файла');
//         return;
//       }
//     }
//     // === /конец блока загрузки фото ===

//     const car = {
//       brand: form.brand.value.trim(),
//       model: form.model.value.trim(),
//       year: form.year.value,
//       transmission: form.transmission.value,
//       fuel: form.fuel.value,
//       mileage: form.mileage.value,
//       equipment: form.equipment.value.trim(),
//       description: form.description.value.trim(),
//       image: imageUrl, // теперь путь к фото на сервере
//       price: form.price.value.trim()
//     };

//     cars.push(car);
//     saveCarsToServer(cars);
//     renderCars();
//     form.reset();
//   });
// }

// function loadCarsFromServer() {
//   fetch('/data/manualCars.json')
//     .then(res => res.json())
//     .then(data => {
//       cars = Array.isArray(data) ? data : [];
//       renderCars();
//     })
//     .catch(err => {
//       console.warn('⚠️ Не удалось загрузить машины с сервера:', err);
//     });
// }

// loadCarsFromServer();




// const form = document.getElementById('carForm');
// const carList = document.getElementById('carList');
// const imageUpload = document.getElementById('imageUpload');
// const imagePreview = document.getElementById('imagePreview');

// let cars = [];
// let uploadedImagePaths = [];

// function renderCars() {
//   carList.innerHTML = '';
//   cars.forEach((car, index) => {
//     const item = document.createElement('div');
//     item.className = 'car-item';

//     const imgs = (car.images || []).map(src => `<img src="${src}" alt="Фото" width="100">`).join('');

//     item.innerHTML = `
//       <div style="display:flex; gap:12px;">${imgs}</div>
//       <div>
//         <strong>${car.brand} ${car.model}</strong><br>
//         ${car.year}, ${car.transmission}, ${car.fuel}, ${car.mileage} км<br>
//         <em>${car.price}</em>
//         <p>${car.description}</p>
//       </div>
//       <button class="delete-btn" data-index="${index}">Удалить</button>
//     `;

//     carList.appendChild(item);
//   });

//   document.querySelectorAll('.delete-btn').forEach(btn => {
//     btn.addEventListener('click', e => {
//       const i = e.target.dataset.index;
//       cars.splice(i, 1);
//       saveCarsToServer(cars);
//       renderCars();
//     });
//   });
// }

// function saveCarsToServer(cars) {
//   fetch('/admin/save-cars.php', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(cars)
//   })
//     .then(res => res.text())
//     .then(msg => {
//       console.log('✅ Сохранено на сервере:', msg);
//     })
//     .catch(err => {
//       console.error('❌ Ошибка при сохранении:', err);
//       alert('Ошибка при сохранении на сервер');
//     });
// }

// if (form) {
//   form.addEventListener('submit', e => {
//     e.preventDefault();

//     const car = {
//       brand: form.brand.value.trim(),
//       model: form.model.value.trim(),
//       year: form.year.value,
//       transmission: form.transmission.value,
//       fuel: form.fuel.value,
//       mileage: form.mileage.value,
//       equipment: form.equipment.value.trim(),
//       description: form.description.value.trim(),
//       images: [...uploadedImagePaths], // массив ссылок
//       price: form.price.value.trim()
//     };

//     cars.push(car);
//     saveCarsToServer(cars);
//     renderCars();
//     form.reset();
//     imagePreview.innerHTML = '';
//     uploadedImagePaths = [];
//   });
// }

// // Загрузка изображений
// imageUpload.addEventListener('change', () => {
//   const files = [...imageUpload.files];
//   const formData = new FormData();
//   imagePreview.innerHTML = '';
//   uploadedImagePaths = [];

//   files.forEach(file => formData.append('images[]', file));

//   fetch('/admin/upload.php', {
//     method: 'POST',
//     body: formData
//   })
//     .then(res => res.json())
//     .then(paths => {
//       uploadedImagePaths = paths;
//       paths.forEach(src => {
//         const img = document.createElement('img');
//         img.src = src;
//         img.alt = 'Превью';
//         img.style.width = '80px';
//         img.style.border = '1px solid #ccc';
//         imagePreview.appendChild(img);
//       });
//     })
//     .catch(err => {
//       console.error('Ошибка загрузки файлов:', err);
//       alert('Ошибка загрузки изображений');
//     });
// });

// function loadCarsFromServer() {
//   fetch('/data/manualCars.json')
//     .then(res => res.json())
//     .then(data => {
//       cars = Array.isArray(data) ? data : [];
//       renderCars();
//     })
//     .catch(err => {
//       console.warn('⚠️ Не удалось загрузить машины с сервера:', err);
//     });
// }

// loadCarsFromServer();



const form = document.getElementById('carForm');
const carList = document.getElementById('carList');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const saveBtn = form.querySelector('button[type="submit"]');

let cars = [];
let uploadedImagePaths = [];
let isUploading = false;

function renderCars() {
  carList.innerHTML = '';
  cars.forEach((car, index) => {
    const item = document.createElement('div');
    item.className = 'car-item';

    const imgs = (car.images || []).map(src => `<img src="${src}" alt="Фото" width="100">`).join('');

    item.innerHTML = `
      <div style="display:flex; gap:12px;">${imgs}</div>
      <div>
        <strong>${car.brand} ${car.model}</strong><br>
        ${car.year}, ${car.transmission}, ${car.fuel}, ${car.mileage} км<br>
        <em>${car.price}</em>
        <p>${car.description}</p>
      </div>
      <button class="delete-btn" data-index="${index}">Удалить</button>
    `;

    carList.appendChild(item);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = e.target.dataset.index;
      cars.splice(i, 1);
      saveCarsToServer(cars);
      renderCars();
    });
  });
}

function saveCarsToServer(cars) {
  fetch('/admin/save-cars.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cars)
  })
    .then(res => res.text())
    .then(msg => {
      console.log('✅ Сохранено на сервере:', msg);
    })
    .catch(err => {
      console.error('❌ Ошибка при сохранении:', err);
      alert('Ошибка при сохранении на сервер');
    });
}

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    if (isUploading) {
      alert('Пожалуйста, дождитесь завершения загрузки фотографий');
      return;
    }

    const car = {
      brand: form.brand.value.trim(),
      model: form.model.value.trim(),
      year: form.year.value,
      transmission: form.transmission.value,
      fuel: form.fuel.value,
      mileage: form.mileage.value,
      equipment: form.equipment.value.trim(),
      description: form.description.value.trim(),
      images: [...uploadedImagePaths], // массив ссылок
      price: form.price.value.trim()
    };

    cars.push(car);
    saveCarsToServer(cars);
    renderCars();
    form.reset();
    imagePreview.innerHTML = '';
    uploadedImagePaths = [];
  });
}

// Загрузка изображений
imageUpload.addEventListener('change', () => {
  const files = [...imageUpload.files];
  const formData = new FormData();
  imagePreview.innerHTML = '';
  uploadedImagePaths = [];
  isUploading = true;
  saveBtn.disabled = true;

  // Показать лоадер
  const loader = document.createElement('div');
  loader.textContent = 'Загрузка изображений...';
  loader.style.padding = '10px';
  loader.style.color = '#fff';
  imagePreview.appendChild(loader);

  files.forEach(file => formData.append('images[]', file));

  fetch('/admin/upload.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(paths => {
      uploadedImagePaths = paths;
      imagePreview.innerHTML = '';
      paths.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Превью';
        img.style.width = '80px';
        img.style.border = '1px solid #ccc';
        imagePreview.appendChild(img);
      });
    })
    .catch(err => {
      console.error('Ошибка загрузки файлов:', err);
      alert('Ошибка загрузки изображений');
    })
    .finally(() => {
      isUploading = false;
      saveBtn.disabled = false;
    });
});

function loadCarsFromServer() {
  fetch('/data/manualCars.json')
    .then(res => res.json())
    .then(data => {
      cars = Array.isArray(data) ? data : [];
      renderCars();
    })
    .catch(err => {
      console.warn('⚠️ Не удалось загрузить машины с сервера:', err);
    });
}

loadCarsFromServer();
