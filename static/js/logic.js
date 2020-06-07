// blank out map so it can be replace if needed.
var container = L.DomUtil.get('map'); if(container != null){ container._leaflet_id = null; }

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
console.log("queryUrl\n", queryUrl);

// Create a function to determine the radius size based on the magnitude of the earthquake
function radiusSize(magnitude) {
    return magnitude * 20000;
}

// Create a function to determine the different colors of the circles based on the magnitude of the earthquake
function getColor(magnitude){
    return magnitude > 5 ? "#FF4233":
    magnitude  > 4 ? "#FF9C33":
    magnitude > 3 ? "#FFC133":
    magnitude > 2 ? "#FFE033":
    magnitude > 1 ? "#2ECC71":
                    "#145A32";
}

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
        createFeatures(data.features);
    });

// Define a function we want to run once for each feature in the features array
function createFeatures(earthquakeData) {
    
    // Give each feature a popup describing the place, time, and magnitude of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + "Place: " + feature.properties.place +
        "</h3><hr><p>" + "Time: " + new Date(feature.properties.time) + "</p>" +
        "<br><p>" + "Magnitude: " + feature.properties.mag + "</p>");
    }
    
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
 
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(earthquakeFeature, latlng) {
        return L.circle(latlng, {
            radius: radiusSize(earthquakeFeature.properties.mag),
            color: getColor(earthquakeFeature.properties.mag),
            fillOpacity: 0.3,
            weight: 2
            });
        },
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}


function createMap(earthquakes) {

    var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18, 
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    })       
    
    var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18, 
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    })   
    
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };
    
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };
    
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });
    
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //Create a legend on the bottom right
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        magnitudes = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
            magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }

    return div;
    };

    legend.addTo(myMap);

}