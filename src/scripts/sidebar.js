import { toggleSidebar, clearForm, getPresetByTag, showFloatingFlag } from './utils.js';
import { addPlaceWithData, savePlacemarksToStorage } from './placemarks.js';
import { setIsPlacingMarker, setFloatingFlagActive, setCurrentRating, editingPlaceObj, setEditingPlaceObj, setIsSidebarOpen, currentRating } from './app.js';

export function setupSidebar() {
  const pickOnMapBtn = document.getElementById('pick-on-map-btn');
  const tagWrapper  = document.getElementById('place-tag-wrapper');
  const tagSelected = document.getElementById('place-tag-selected');
  const tagOptions  = document.getElementById('place-tag-options');
  const tagInput    = document.getElementById('place-tag');
  if (!pickOnMapBtn) {
    console.error('Кнопка "pick-on-map-btn" не найдена в DOM');
    return;
  }

  tagSelected.addEventListener('click', () => {
    tagOptions.classList.toggle('hidden');
  });

  tagOptions.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      tagSelected.textContent = li.textContent;
      tagInput.value          = li.dataset.value;

      tagOptions.querySelectorAll('li').forEach(x => x.classList.remove('active'));
      li.classList.add('active');

      tagOptions.classList.add('hidden');
    });
  });

  document.addEventListener('click', (e) => {
    if (!tagWrapper.contains(e.target)) {
      tagOptions.classList.add('hidden');
    }
  });

  document.getElementById('add-place-btn').addEventListener('click', toggleSidebar);
  document.getElementById('cancel-place-btn').addEventListener('click', toggleSidebar);

  pickOnMapBtn.addEventListener('click', () => {
    console.log('Кнопка "Указать на карте" нажата, editingPlaceObj:', editingPlaceObj); // Отладка
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
        savePlacemarksToStorage();
      }
    } else {
      setIsPlacingMarker(true);
      setFloatingFlagActive(true);
      showFloatingFlag();
      document.getElementById('map').classList.add('flag-cursor');
      console.log('Режим размещения метки активирован');

      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('slide-down');
      }
    }
  });

  const stars = document.querySelectorAll('#rating-container .star');
  if (!stars.length) {
    console.error('Звездочки рейтинга не найдены в DOM');
    return;
  }
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const ratingValue = parseInt(star.getAttribute('data-value'));
      setCurrentRating(ratingValue);
      updateRatingDisplay(ratingValue);
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

  document.getElementById('place-photo').addEventListener('change', function() {
    const uploadLabel = document.getElementById('upload-label');
    uploadLabel.textContent = (this.files && this.files[0])
      ? "Фото добавлено 👌"
      : "Добавить фото";
  });

  document.getElementById('return-arrow').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('slide-down');
  });
}

export function updateRatingDisplay(ratingVal) {
  document.querySelectorAll('#rating-container .star').forEach(star => {
    const starVal = parseInt(star.getAttribute('data-value'));
    star.textContent = starVal <= ratingVal ? '★' : '☆';
  });
}