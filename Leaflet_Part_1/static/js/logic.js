// Build a function to create the earthquake map
function createMap(earthquakes) {

    // Create the tile layer for the map background
    let worldmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    // Create a baseMaps object to hold the worldmap layer
    let baseMaps = {
      "World Map": worldmap
    };
  
    // Create an overlayMaps object to hold the earthquakes layer
    let earthquakesLayer = new L.LayerGroup();
    let overlayMaps = {
      "Earthquakes": earthquakesLayer
    };

    // Create the map object with options
    let map = L.map("map", {
        center: [20, 0],
        zoom: 2,
        layers: [worldmap, earthquakesLayer]
    });

    // Create a layer control, pass it baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map); // Add the layer control to the map

    // Create function to adjust marker color based on depth
    function getColor(depth) {
        return depth >= 90 ? '#660000' :
               depth >= 70 ? '#b30000' :
               depth >= 50 ? '#cc0000' :
               depth >= 30 ? '#ff3300' :
               depth >= 10 ? '#ff6600' :
               '#ffcc66';
    }

    // Function to get radius based on magnitude
    function getRadius(magnitude) {
        return magnitude >= 7.5 ? magnitude * 50000 :
               magnitude >= 6.5 ? magnitude * 45000 :
               magnitude >= 5.5 ? magnitude * 40000 :
               magnitude >= 4.5 ? magnitude * 30000 :
               magnitude >= 3.5 ? magnitude * 15000 :
               magnitude >= 2.5 ? magnitude * 10000 :
               magnitude >= 1.5 ? magnitude * 5000 :
               magnitude * 1000;
    }

    // Loop through the earthquakes and create markers
    earthquakes.forEach(earthquake => {
        let coords = earthquake.geometry.coordinates;
        let lat = coords[1];
        let lng = coords[0];
        let depth = coords[2];
        let mag = earthquake.properties.mag;

        // Create a circle marker for the earthquake
        let marker = L.circle([lat, lng], {
            fillOpacity: 0.75,
            color: getColor(depth),
            fillColor: getColor(depth),
            radius: getRadius(mag)
        }).bindPopup(`
            <h3>${earthquake.properties.place}</h3>
            <hr>
            <p>Magnitude: ${mag}</p>
            <p>Depth: ${depth} km</p>
            <p>Time: ${new Date(earthquake.properties.time)}</p>
        `);

        // Add the marker to the earthquakes layer
        earthquakesLayer.addLayer(marker);
    });

    // Add a legend to the map
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [-10, 10, 30, 50, 70, 90];
        let labels = [];
    
        div.style.backgroundColor = 'white';
        div.style.border = '1px solid black';
        div.style.padding = '10px';

        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(depths[i]) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }

        return div;
};

legend.addTo(map);
}
// Perform an API call to the USGS API to get the earthquake information. Call createMap when it completes.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(function(data) {
    console.log('Data from USGS:', data);
    createMap(data.features);
});