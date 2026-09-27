import '../motion/travel.css';

export function createTravelMap() {
  const atlas = document.querySelector('[data-travel-map]');
  if (!atlas) return;
  const map = atlas.querySelector('.world-map');
  const picker = atlas.querySelector('#travel-country');
  const name = atlas.querySelector('[data-country-name]');
  const status = atlas.querySelector('[data-country-status]');
  const countries = new Map([...map.querySelectorAll('[data-country]')].map(country => [country.dataset.country, country]));
  let inspected = null;
  let selected = null;

  function inspect(country) {
    if (inspected === country) return;
    inspected?.classList.remove('is-inspected');
    inspected = country;
    country?.classList.add('is-inspected');
    name.textContent = country?.dataset.name || 'The world is open.';
    status.textContent = country ? (country.dataset.visited === 'true' ? 'Visited · part of my story.' : 'Not marked in my travel log yet.') : 'Hover or tap a country to take a look.';
  }

  picker.disabled = false;
  picker.addEventListener('change', () => {
    selected = countries.get(picker.value) || null;
    inspect(selected);
  });
  map.addEventListener('pointerover', event => {
    const country = event.target.closest('[data-country]');
    if (country) inspect(country);
  });
  map.addEventListener('pointerleave', () => inspect(selected));
  map.addEventListener('click', event => {
    selected = event.target.closest('[data-country]');
    picker.value = selected?.dataset.country || '';
    inspect(selected);
  });
}
