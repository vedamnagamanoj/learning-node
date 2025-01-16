/* eslint-disable */

export const displayMap = (locations) => {
  const map = new maplibregl.Map({
    container: 'map', // container id
    style:
      'https://api.maptiler.com/maps/dataviz/style.json?key=Dts8SoqZ4IkXOU4A6RzS', // style URL
    // center: [-118.11, 34.11], // starting position [lng, lat]
    zoom: 1, // starting zoom
    // interactive: false,
    scrollZoom: false,
  });

  // const marker = new maplibregl.Marker().setLngLat([-118.11, 34.11]).addTo(map);

  const bounds = new maplibregl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add the marker
    new maplibregl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new maplibregl.Popup({
      offset: 40,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day: ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 }, // Optional: add padding
    maxZoom: 10, // Optional: limit zoom level
  });
};
