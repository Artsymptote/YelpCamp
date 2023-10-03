mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map", // container ID
	style: "mapbox://styles/mapbox/light-v10", // style URL
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 10, // starting zoom
});

//adapted from https://github.com/mapbox/mapbox-gl-js/issues/8982#:~:text=Author-,Emixam23,-commented%20on%20Feb
map.once("render", () => {
	map.resize();
});

// Set marker options.
const marker = new mapboxgl.Marker({
	color: "#7F00FF",
})
	.setLngLat(campground.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 }).setHTML(
			`<h6>${campground.title}</h6><p>${campground.location}</p>`,
		),
	)
	.addTo(map);
