import { initMap } from './map.js';
import { setupSidebar } from './sidebar.js';
import { setupModals } from './modals.js';
import { setupFilters } from './filters.js';
import { showAlert } from './utils.js';

export let map;
export let placemarks = [];
export let isSidebarOpen = false;
export let isPlacingMarker = false;
export let floatingFlagActive = false;
export let currentRating = 0;
export let editingPlaceObj = null;

document.addEventListener('DOMContentLoaded', () => {
  ymaps.ready(() => {
    initMap();
    setupSidebar();
    setupModals();
    setupFilters();

    ['login-btn', 'register-btn', 'login-btn-modal', 'register-btn-modal', 'share-map-btn', 'share-map-btn-modal'].forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        showAlert('next updates');
      });
    });
  });
});

export function setMap(newMap) { map = newMap; }
export function setPlacemarks(newPlacemarks) { placemarks = newPlacemarks; }
export function setIsSidebarOpen(value) { isSidebarOpen = value; }
export function setIsPlacingMarker(value) { isPlacingMarker = value; }
export function setFloatingFlagActive(value) { floatingFlagActive = value; }
export function setCurrentRating(value) { currentRating = value; }
export function setEditingPlaceObj(value) { editingPlaceObj = value; }