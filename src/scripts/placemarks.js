import { placemarks, setPlacemarks, map, isSidebarOpen, setIsSidebarOpen, setIsPlacingMarker, setCurrentRating, editingPlaceObj, setEditingPlaceObj } from './app.js';
import { getPresetByTag, clearForm, toggleSidebar } from './utils.js';
import { showMarkerModal } from './modals.js';
import { updateRatingDisplay } from './sidebar.js';
import { currentRating } from './app.js';

export function addPlaceWithData(coords) {
  const name = document.getElementById('place-name').value.trim();
  const description = document.getElementById('place-description').value.trim();
  const tag = document.getElementById('place-tag').value;
  const photoInput = document.getElementById('place-photo');
  
  let photoData = 'images/place.png';

  const addMarker = () => {
    addPlacemark(coords, name, description, tag, photoData, currentRating);
    setIsPlacingMarker(false);
    document.getElementById('sidebar').classList.add('hidden');
    document.getElementById('sidebar').classList.remove('slide-down');
    setIsSidebarOpen(false);
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

export function addPlacemark(coords, name, description, tag, photoData, rating) {
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

export function savePlacemarksToStorage() {
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

export function loadPlacemarksFromStorage() {
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

export function openSidebarWithMarkerData(placeObj) {
  document.getElementById('place-name').value = placeObj.name;
  document.getElementById('place-description').value = placeObj.description;
  document.getElementById('place-tag').value = placeObj.tag;
  setCurrentRating(placeObj.rating);
  updateRatingDisplay(placeObj.rating);
  setEditingPlaceObj(placeObj);
  const pickBtn = document.getElementById('pick-on-map-btn');
  pickBtn.textContent = 'Сохранить';
  const uploadLabel = document.getElementById('upload-label');
  uploadLabel.textContent = placeObj.photoData ? 'Изменить фото' : 'Добавить фото';
  if (!isSidebarOpen) {
    toggleSidebar();
  }
}