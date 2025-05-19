import { openSidebarWithMarkerData } from './placemarks.js';
import { placemarks, setPlacemarks, map } from './app.js';
import { savePlacemarksToStorage } from './placemarks.js';

export function setupModals() {
  document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('info-modal').classList.add('hidden');
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

  document.addEventListener('click', () => {
    profileDropdown.classList.add('hidden');
  });
}

export function showMarkerModal(placeObj) {
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
    setPlacemarks(placemarks.filter(obj => obj !== placeObj));
    savePlacemarksToStorage();
    modal.classList.add('hidden');
  };

  modal.classList.remove('hidden');
}