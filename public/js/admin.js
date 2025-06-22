const form = document.getElementById('carForm');
const carList = document.getElementById('carList');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const saveBtn = form.querySelector('button[type="submit"]');
const cancelEditBtn = document.getElementById('cancelEditBtn');

let cars = [];
let uploadedImagePaths = [];
let isUploading = false;
let editingIndex = null;

function renderCars() {
  carList.innerHTML = '';
  cars.forEach((car, index) => {
    const item = document.createElement('div');
    item.className = 'car-item';
    item.style.border = '1px solid #ccc';
    item.style.padding = '10px';
    item.style.borderRadius = '8px';
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.gap = '8px';

    const imgs = (car.images || []).map(src => `
      <img src="${src}" alt="Фото" width="100" style="border:1px solid #ccc; border-radius:4px;">
    `).join('');

    item.innerHTML = `
      <div style="display:flex; gap:8px; flex-wrap:wrap;">${imgs}</div>
      <div>
        <strong style="font-size:16px;">${car.brand} ${car.model}</strong><br>
        ${car.year}, ${car.transmission}, ${car.fuel}, ${car.mileage} км<br>
        <em>${car.price}</em>
        <p>${car.description}</p>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="edit-btn" data-index="${index}">✏️ Редактировать</button>
        <button class="delete-btn" data-index="${index}">🗑️ Удалить</button>
      </div>
    `;

    carList.appendChild(item);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = e.target.dataset.index;
      const car = cars[i];

      // Удаление всех фото с сервера
      if (Array.isArray(car.images)) {
        car.images.forEach(src => {
          fetch('/admin/delete-image.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: src })
          })
            .then(res => res.json())
            .then(data => {
              if (data.status === 'success') {
                console.log('🗑️ Фото удалено:', src);
              } else {
                console.warn('⚠️ Ошибка при удалении фото:', data.message);
              }
            })
            .catch(err => {
              console.error('❌ Ошибка при удалении фото:', err);
            });
        });
      }

      // Удаление самой карточки
      cars.splice(i, 1);
      saveCarsToServer(cars);
      renderCars();
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = e.target.dataset.index;
      const car = cars[i];
      editingIndex = i;

      form.brand.value = car.brand;
      form.model.value = car.model;
      form.year.value = car.year;
      form.transmission.value = car.transmission;
      form.fuel.value = car.fuel;
      form.mileage.value = car.mileage;
      form.equipment.value = car.equipment;
      form.description.value = car.description;
      form.price.value = car.price;

      uploadedImagePaths = [...car.images];
      imagePreview.innerHTML = '';
      uploadedImagePaths.forEach(src => {
        const imgWrapper = document.createElement('div');
        imgWrapper.style.position = 'relative';
        imgWrapper.style.display = 'inline-block';
        imgWrapper.style.marginRight = '8px';
        imgWrapper.innerHTML = `
          <img src="${src}" style="width:80px; border:1px solid #ccc; border-radius:4px;">
          <button class="remove-photo" data-src="${src}" style="
            position:absolute;
            top:0;
            right:0;
            background:red;
            color:#fff;
            border:none;
            font-size:12px;
            padding:2px 5px;
            border-radius:0 4px 0 4px;
            cursor:pointer;
          ">×</button>
        `;
        imagePreview.appendChild(imgWrapper);
      });

      enableRemovePhotoButtons();
      cancelEditBtn.style.display = 'inline-block';
    });
  });

  cancelEditBtn.style.display = 'none';
}

function enableRemovePhotoButtons() {
  document.querySelectorAll('.remove-photo').forEach(btn => {
    btn.addEventListener('click', e => {
      const srcToRemove = e.target.dataset.src;
      uploadedImagePaths = uploadedImagePaths.filter(s => s !== srcToRemove);
      e.target.parentElement.remove();

      fetch('/admin/delete-image.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: srcToRemove })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            console.log('🗑️ Файл удалён с сервера:', srcToRemove);
          } else {
            console.warn('⚠️ Не удалось удалить файл:', data.message);
          }
        })
        .catch(err => {
          console.error('❌ Ошибка при удалении файла:', err);
        });
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
    images: [...uploadedImagePaths],
    price: form.price.value.trim()
  };

  if (editingIndex !== null) {
    cars[editingIndex] = car;
    editingIndex = null;
  } else {
    cars.push(car);
  }

  saveCarsToServer(cars);
  renderCars();
  form.reset();
  imagePreview.innerHTML = '';
  uploadedImagePaths = [];
  cancelEditBtn.style.display = 'none';
});

cancelEditBtn.addEventListener('click', () => {
  editingIndex = null;
  form.reset();
  imagePreview.innerHTML = '';
  uploadedImagePaths = [];
  cancelEditBtn.style.display = 'none';
});

imageUpload.addEventListener('change', () => {
  const files = [...imageUpload.files];
  const formData = new FormData();
  imagePreview.innerHTML = '';
  uploadedImagePaths = [];
  isUploading = true;
  saveBtn.disabled = true;

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
        const imgWrapper = document.createElement('div');
        imgWrapper.style.position = 'relative';
        imgWrapper.style.display = 'inline-block';
        imgWrapper.style.marginRight = '8px';
        imgWrapper.innerHTML = `
          <img src="${src}" style="width:80px; border:1px solid #ccc; border-radius:4px;">
          <button class="remove-photo" data-src="${src}" style="
            position:absolute;
            top:0;
            right:0;
            background:red;
            color:#fff;
            border:none;
            font-size:12px;
            padding:2px 5px;
            border-radius:0 4px 0 4px;
            cursor:pointer;
          ">×</button>
        `;
        imagePreview.appendChild(imgWrapper);
      });
      enableRemovePhotoButtons();
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

