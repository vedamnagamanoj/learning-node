/* eslint-disable */

console.log('This is from mapbox client side');

const locations = JSON.parse(
  document.getElementById('map').dataset['locations'],
);
console.log(locations);

const map = new maplibregl.Map({
  container: 'map', // container id
  style: 'https://demotiles.maplibre.org/style.json', // style URL
  center: [0, 0], // starting position [lng, lat]
  zoom: 1, // starting zoom
});
