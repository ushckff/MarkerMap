let map;
let isSidebarOpen = false;
let isPlacingMarker = false;
let placemarks = [];
let currentRating = 0;
let floatingFlagActive = false;
let editingPlaceObj = null;

// api
ymaps.ready(initMap);

function initMap() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      createMap([lat, lng]);
    },
    (err) => {
      console.warn('Геопозиция не получена, fallback Москва', err);
      createMap([55.7558, 37.6173]);
    }
  );
}

function createMap(centerCoords) {
  map = new ymaps.Map("map", {
    center: centerCoords,
    zoom: 17,
    controls: ['zoomControl']
  });

  map.events.add('click', (e) => {
    if (floatingFlagActive) {
      const coords = e.get('coords');
      floatingFlagActive = false;
      hideFloatingFlag();
      addPlaceWithData(coords);
    }
  });

  loadPlacemarksFromStorage();
}

// Работа с метками
function addPlaceWithData(coords) {
  const name = document.getElementById('place-name').value.trim();
  const description = document.getElementById('place-description').value.trim();
  const tag = document.getElementById('place-tag').value;
  const photoInput = document.getElementById('place-photo');
  
  let photoData = '/images/place.png';

  const addMarker = () => {
    addPlacemark(coords, name, description, tag, photoData, currentRating);
    isPlacingMarker = false;
    toggleSidebar();
    clearForm();
  };

  if (photoInput.files && photoInput.files[0]) {
    const file = photoInput.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      photoData = ev.target.result;
      addMarker();
    };
    reader.readAsDataURL(file);
  } else {
    addMarker();
  }
}

function addPlacemark(coords, name, description, tag, photoData, rating) {
  ymaps.geocode(coords)
    .then(res => {
      const firstGeoObject = res.geoObjects.get(0);
      const address = firstGeoObject ? firstGeoObject.getAddressLine() : 'Адрес не найден';

      const placemark = new ymaps.Placemark(
        coords,
        {},
        {
          preset: getPresetByTag(tag),
          iconShape: {
            type: 'rectangle',
            coordinates: [[-15, -42], [15, 0]]
          }
        }
      );

      map.geoObjects.add(placemark);

      const placeObj = {
        placemark,
        tag,
        name,
        description,
        coords,
        photoData,
        rating,
        address
      };

      placemarks.push(placeObj);
      savePlacemarksToStorage();

      placemark.events.add('click', () => {
        showMarkerModal(placeObj);
      });
    })
    .catch(() => {
      alert('Не удалось определить адрес для метки.');
    });
}

// Сохранение и загрузка меток из localStorage
function savePlacemarksToStorage() {
  const simplified = placemarks.map(p => ({
    coords: p.coords,
    name: p.name,
    description: p.description,
    tag: p.tag,
    photoData: p.photoData,
    rating: p.rating,
    address: p.address
  }));
  localStorage.setItem('placemarks', JSON.stringify(simplified));
}

function loadPlacemarksFromStorage() {
  const data = localStorage.getItem('placemarks');
  if (!data) return;
  const saved = JSON.parse(data);
  saved.forEach(place => {
    addPlacemark(
      place.coords,
      place.name,
      place.description,
      place.tag,
      place.photoData,
      place.rating,
      place.address
    );
  });
}

// Модальное окно метки
function showMarkerModal(placeObj) {
  const modal = document.getElementById('info-modal');
  document.getElementById('modal-title').textContent = placeObj.name || 'Без названия';
  document.getElementById('modal-description').textContent = placeObj.description || '';
  document.getElementById('modal-rating').textContent = placeObj.rating
    ? `Оценка: ${'★'.repeat(placeObj.rating)}${'☆'.repeat(5 - placeObj.rating)}`
    : '';
  document.getElementById('modal-address').textContent = placeObj.address || 'Адрес не найден';

  const photoEl = document.getElementById('modal-photo');
  if (placeObj.photoData) {
    photoEl.src = placeObj.photoData;
    photoEl.classList.remove('hidden');
  } else {
    photoEl.classList.add('hidden');
  }

  document.getElementById('edit-marker-btn').onclick = function () {
    openSidebarWithMarkerData(placeObj);
    modal.classList.add('hidden');
  };

  document.getElementById('delete-marker-btn').onclick = function () {
    map.geoObjects.remove(placeObj.placemark);
    placemarks = placemarks.filter(obj => obj !== placeObj);
    modal.classList.add('hidden');
  };

  modal.classList.remove('hidden');
}

function openSidebarWithMarkerData(placeObj) {
  document.getElementById('place-name').value = placeObj.name;
  document.getElementById('place-description').value = placeObj.description;
  document.getElementById('place-tag').value = placeObj.tag;
  currentRating = placeObj.rating;
  updateRatingDisplay(currentRating);
  editingPlaceObj = placeObj;
  const pickBtn = document.getElementById('pick-on-map-btn');
  pickBtn.textContent = 'Сохранить';
  const uploadLabel = document.getElementById('upload-label');
  uploadLabel.textContent = placeObj.photoData ? 'Изменить фото' : 'Добавить фото';
  if (!isSidebarOpen) {
    toggleSidebar();
  }
}

document.getElementById('close-modal-btn').addEventListener('click', () => {
  document.getElementById('info-modal').classList.add('hidden');
});

// Получение пресета по тегу
function getPresetByTag(tag) {
  switch (tag) {
    case 'architecture':
      return 'islands#lightBlueLeisureIcon';
    case 'bar':
      return 'islands#pinkBarIcon';
    case 'winery':
      return 'islands#violetBarIcon';
    case 'other':
      return 'islands#blackGovernmentIcon';
    case 'history':
      return 'islands#nightLeisureIcon';
    case 'cafe':
      return 'islands#darkOrangeFoodIcon';
    case 'club':
      return 'islands#redBarIcon';
    case 'picnic':
      return 'islands#oliveVegetationIcon';
    case 'cuisine':
      return 'islands#darkBlueFoodIcon';
    case 'museum':
      return 'islands#brownLeisureIcon';
    case 'park':
      return 'islands#greenVegetationIcon';
    case 'beach':
      return 'islands#yellowBeachIcon';
    case 'restaurant':
      return 'islands#blueFoodIcon';
    case 'theater':
      return 'islands#orangeTheaterIcon';
    case 'photo':
      return 'islands#darkGreenObservationIcon';
    default:
      return 'islands#grayGovernmentIcon';
  }
}

// Управление боковой панелью и формой
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden');
  isSidebarOpen = !isSidebarOpen;
  if (!isSidebarOpen) {
    isPlacingMarker = false;
    floatingFlagActive = false;
    hideFloatingFlag();
    clearForm();
    document.getElementById('map').classList.remove('flag-cursor');
    editingPlaceObj = null;
    document.getElementById('pick-on-map-btn').textContent = 'Указать на карте';
  }
}

function clearForm() {
  document.getElementById('place-name').value = '';
  document.getElementById('place-description').value = '';
  document.getElementById('place-tag').value = '';
  document.getElementById('place-photo').value = '';
  document.getElementById('upload-label').textContent = "Добавить фото";
  currentRating = 0;
  updateRatingDisplay(currentRating);
}

// флажок
function showFloatingFlag() {
  document.getElementById('floating-flag').classList.remove('hidden');
}

function hideFloatingFlag() {
  document.getElementById('floating-flag').classList.add('hidden');
}

function updateFloatingFlagPosition(e) {
  const flag = document.getElementById('floating-flag');
  const mapRect = document.getElementById('map').getBoundingClientRect();
  flag.style.left = (e.clientX - mapRect.left + 3) + 'px';
  flag.style.top = (e.clientY - mapRect.top - 20) + 'px';
}

// DOM
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-place-btn').addEventListener('click', toggleSidebar);
  document.getElementById('cancel-place-btn').addEventListener('click', toggleSidebar);

  document.getElementById('pick-on-map-btn').addEventListener('click', () => {
    if (editingPlaceObj) {
      const newName = document.getElementById('place-name').value.trim();
      const newDescription = document.getElementById('place-description').value.trim();
      const newTag = document.getElementById('place-tag').value;
      const photoInput = document.getElementById('place-photo');
  
      editingPlaceObj.name = newName;
      editingPlaceObj.description = newDescription;
      editingPlaceObj.tag = newTag;
      editingPlaceObj.rating = currentRating;
      editingPlaceObj.placemark.options.set('preset', getPresetByTag(newTag));
  
      if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          editingPlaceObj.photoData = e.target.result;
          finishEdit();
        };
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        finishEdit();
      }
  
      function finishEdit() {
        toggleSidebar();
        clearForm();
      }
  
    } else {
      isPlacingMarker = true;
      floatingFlagActive = true;
      showFloatingFlag();
      document.getElementById('map').classList.add('flag-cursor');
    }
  });
  
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.getElementById('profile-dropdown');
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const filterDropdown = document.getElementById('filter-dropdown');
    if (!filterDropdown.classList.contains('hidden')) {
      filterDropdown.classList.add('hidden');
    }
    profileDropdown.classList.toggle('hidden');
  });

  const filterBtn = document.getElementById('filter-btn');
  const filterDropdown = document.getElementById('filter-dropdown');
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!profileDropdown.classList.contains('hidden')) {
      profileDropdown.classList.add('hidden');
    }
    filterDropdown.classList.toggle('hidden');
  });

  document.querySelectorAll('#filter-dropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const value = item.getAttribute('data-value');
      document.querySelectorAll('#filter-dropdown .dropdown-item').forEach(el => {
        el.classList.remove('active');
      });
      item.classList.add('active');
      filterDropdown.classList.add('hidden');
      filterPlacemarks(value);
    });
  });

  document.addEventListener('click', () => {
    filterDropdown.classList.add('hidden');
    profileDropdown.classList.add('hidden');
  });

  const stars = document.querySelectorAll('#rating-container .star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.getAttribute('data-value'));
      updateRatingDisplay(currentRating);
    });
    star.addEventListener('mouseover', () => {
      const hoverVal = parseInt(star.getAttribute('data-value'));
      updateRatingDisplay(hoverVal);
    });
    star.addEventListener('mouseout', () => {
      updateRatingDisplay(currentRating);
    });
  });

  const textarea = document.getElementById('place-description');
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });

  document.getElementById('map').addEventListener('mousemove', (e) => {
    if (floatingFlagActive) {
      updateFloatingFlagPosition(e);
    }
  });

  document.getElementById('place-photo').addEventListener('change', function() {
    const uploadLabel = document.getElementById('upload-label');
    uploadLabel.textContent = (this.files && this.files[0])
      ? "Фото добавлено 👌"
      : "Добавить фото";
  });

  document.getElementById('login-btn').addEventListener('click', () => {
    alert('🔧 Будет реализовано в ближайшем будущем');
  });

  document.getElementById('register-btn').addEventListener('click', () => {
    alert('🔧 Будет реализовано в ближайшем будущем');
  });

  document.getElementById('login-btn-modal').addEventListener('click', () => {
    alert('🔧 Будет реализовано в ближайшем будущем');
  });

  document.getElementById('register-btn-modal').addEventListener('click', () => {
    alert('🔧 Будет реализовано в ближайшем будущем');
  });

  document.getElementById('share-map-btn').addEventListener('click', () => {
    alert('🔧 Будет реализовано в ближайшем будущем');
  });
  
  document.getElementById('share-map-btn-modal').addEventListener('click', () => {
    alert('🔧 Будет реализовано в ближайшем будущем');
  });
});

// Обновление отображения рейтинга
function updateRatingDisplay(ratingVal) {
  document.querySelectorAll('#rating-container .star').forEach(star => {
    const starVal = parseInt(star.getAttribute('data-value'));
    star.textContent = starVal <= ratingVal ? '★' : '☆';
  });
}

// Фильтрация меток по тегу
function filterPlacemarks(tag) {
  placemarks.forEach(item => {
    if (tag === 'all') {
      item.placemark.options.set('visible', true);
    } else {
      item.placemark.options.set('visible', item.tag === tag);
    }
  });
}
