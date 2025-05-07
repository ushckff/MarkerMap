import { placemarks } from './app.js';

export function setupFilters() {
  const filterBtn = document.getElementById('filter-btn');
  const filterDropdown = document.getElementById('filter-dropdown');
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const profileDropdown = document.getElementById('profile-dropdown');
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
  });
}

function filterPlacemarks(tag) {
  placemarks.forEach(item => {
    if (tag === 'all') {
      item.placemark.options.set('visible', true);
    } else {
      item.placemark.options.set('visible', item.tag === tag);
    }
  });
}