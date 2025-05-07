import { setIsPlacingMarker, setFloatingFlagActive, setEditingPlaceObj, isSidebarOpen, setIsSidebarOpen } from './app.js';

export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden');
  setIsSidebarOpen(!isSidebarOpen);
  if (!isSidebarOpen) {
    setIsPlacingMarker(false);
    setFloatingFlagActive(false);
    hideFloatingFlag();
    clearForm();
    document.getElementById('map').classList.remove('flag-cursor');
    setEditingPlaceObj(null);
    document.getElementById('pick-on-map-btn').textContent = 'Указать на карте';
  }
}

export function clearForm() {
  document.getElementById('place-name').value = '';
  document.getElementById('place-description').value = '';
  document.getElementById('place-tag').value = '';
  document.getElementById('place-photo').value = '';
  document.getElementById('upload-label').textContent = "Добавить фото";
  document.querySelectorAll('#rating-container .star').forEach(star => {
    star.textContent = '☆';
  });
  setIsPlacingMarker(false);
  setFloatingFlagActive(false);
  hideFloatingFlag();
}

export function showFloatingFlag() {
  document.getElementById('floating-flag').classList.remove('hidden');
}

export function hideFloatingFlag() {
  document.getElementById('floating-flag').classList.add('hidden');
}

export function updateFloatingFlagPosition(e) {
  const flag = document.getElementById('floating-flag');
  const mapRect = document.getElementById('map').getBoundingClientRect();
  flag.style.left = (e.clientX - mapRect.left + 3) + 'px';
  flag.style.top = (e.clientY - mapRect.top - 20) + 'px';
}

export function getPresetByTag(tag) {
  switch (tag) {
    case 'architecture': return 'islands#lightBlueLeisureIcon';
    case 'bar': return 'islands#pinkBarIcon';
    case 'winery': return 'islands#violetBarIcon';
    case 'other': return 'islands#blackGovernmentIcon';
    case 'history': return 'islands#nightLeisureIcon';
    case 'cafe': return 'islands#darkOrangeFoodIcon';
    case 'club': return 'islands#redBarIcon';
    case 'picnic': return 'islands#oliveVegetationIcon';
    case 'cuisine': return 'islands#darkBlueFoodIcon';
    case 'museum': return 'islands#brownLeisureIcon';
    case 'park': return 'islands#greenVegetationIcon';
    case 'beach': return 'islands#yellowBeachIcon';
    case 'restaurant': return 'islands#blueFoodIcon';
    case 'theater': return 'islands#orangeTheaterIcon';
    case 'photo': return 'islands#darkGreenObservationIcon';
    default: return 'islands#grayGovernmentIcon';
  }
}

export function showAlert(message) {
  alert(message);
}