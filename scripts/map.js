import { addPlaceWithData } from './placemarks.js';
import { setMap, setFloatingFlagActive, floatingFlagActive } from './app.js';
import { loadPlacemarksFromStorage } from './placemarks.js';
import { showFloatingFlag, hideFloatingFlag, updateFloatingFlagPosition } from './utils.js';

export function initMap() {
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
  const map = new ymaps.Map("map", {
    center: centerCoords,
    zoom: 17,
    controls: ['zoomControl']
  });

  map.controls.remove('zoomControl');

  map.events.add('click', (e) => {
    if (floatingFlagActive) {
      const coords = e.get('coords');
      setFloatingFlagActive(false);
      hideFloatingFlag();
      addPlaceWithData(coords);
    }
  });

  map.events.add('mousemove', (e) => {
    if (floatingFlagActive) {
      updateFloatingFlagPosition(e);
    }
  });

  setMap(map);
  loadPlacemarksFromStorage();
}