
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: camp.geometry.coordinates, // starting position [lng, lat]
zoom: 12 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

const popup = new mapboxgl.Popup({offset : 25})
    .setHTML(
        `<h6>${camp.title}</h6><p>${camp.location}</p>`
    )

const marker = new mapboxgl.Marker()
    .setLngLat(camp.geometry.coordinates)
    .setPopup(popup)
    .addTo(map)

map.addControl(new mapboxgl.FullscreenControl());