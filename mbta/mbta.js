var myLat = 0;
var myLng = 0;
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
        zoom: 13, // The larger the zoom number, the bigger the zoom
        center: me,
        mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var marker;
var infowindow = new google.maps.InfoWindow();

var stations = {"South Station":     [42.352271,   -71.05524200000001],
                "Andrew":            [42.330154,   -71.057655],
                "Porter Square":     [42.3884,     -71.11914899999999],
                "Harvard Square":    [42.373362,   -71.118956],
                "JFK/UMass":         [42.320685,   -71.052391],
                "Savin Hill":        [42.31129,    -71.053331],
                "Park Street":       [42.35639457, -71.0624242],
                "Broadway":          [42.342622,   -71.056967],
                "North Quincy":      [42.275275,   -71.029583],
                "Shawmut":           [42.29312583, -71.06573796000001],
                "Davis":             [42.39674,    -71.121815],
                "Alewife":           [42.395428,   -71.142483],
                "Kendall/MIT":       [42.36249079, -71.08617653],
                "Charles/MGH":       [42.361166,   -71.070628],
                "Downtown Crossing": [42.355518,   -71.060225],
                "Quincy Center":     [42.251809,   -71.005409],
                "Quincy Adams":      [42.233391,   -71.007153],
                "Ashmont":           [42.284652,   -71.06448899999999],
                "Wollaston":         [42.2665139,  -71.0203369],
                "Fields Corner":     [42.300093,   -71.061667],
                "Central Square":    [42.365486,   -71.103802],
                "Braintree":         [ 42.2078543,  -71.0011385]};

function init()
{
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        getMyLocation();
}

function getMyLocation() {
        if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
                navigator.geolocation.getCurrentPosition(function(position) {
                        myLat = position.coords.latitude;
                        myLng = position.coords.longitude;
                        renderMap();
                });
        }
        else {
                alert("Geolocation is not supported by your web browser.  What a shame!");
        }
}

function renderMap()
{
        me = new google.maps.LatLng(myLat, myLng);
        
        // Update map and go there...
        map.panTo(me);

        renderMarkers();
        renderRedLine();
        renderClosestPath();
}

// Renders markers for your location and each T station
function renderMarkers() {
        // Renders your location
        marker = new google.maps.Marker({
                title: "You Are Here",
                position: me,
                map: map
        });

        google.maps.event.addListener(marker, 'click', (function() {
                return function() {
                        infowindow.setContent(this.title);
                        infowindow.open(map, this);
                }
              })(marker));

        // Renders T stations
        for (var station in stations) {
                marker = new google.maps.Marker({
                        title: station,
                        position: {lat: stations[station][0], lng: stations[station][1]},
                        icon: "corgi.png",
                        map: map
                });

                google.maps.event.addListener(marker, 'click', (function() {
                        return function() {
                                infowindow.setContent(this.title);
                                infowindow.open(map, this);
                        }
                      })(marker));
        }
}

// Renders the Red Line
function renderRedLine() {
        // Sets stations on each branch
        var path1_stations = ["Alewife", "Davis", "Porter Square", "Harvard Square", "Central Square",
                              "Kendall/MIT", "Charles/MGH", "Park Street", "Downtown Crossing", "South Station",
                              "Broadway", "Andrew", "JFK/UMass", "Savin Hill", "Fields Corner",
                              "Shawmut", "Ashmont"]
        var path2_stations = ["JFK/UMass", "North Quincy", "Wollaston", "Quincy Center", "Quincy Adams", "Braintree"]

        var path1 = []
        var path2 = []

        // Pushes latitude and longitude of each station onto its respective path(s)
        path1_stations.forEach(function(station, k) {
                path1.push({lat: stations[station][0], lng: stations[station][1]});
        });

        path2_stations.forEach(function(station, k) {
                path2.push({lat: stations[station][0], lng: stations[station][1]});
        });

        // Builds red line branches from given paths
        var branch1 = new google.maps.Polyline({
                  path: path1,
                  geodesic: true,
                  strokeColor: '#FF0000',
                  strokeOpacity: 1.0,
                  strokeWeight: 2
        });

        var branch2 = new google.maps.Polyline({
                  path: path2,
                  geodesic: true,
                  strokeColor: '#FF0000',
                  strokeOpacity: 1.0,
                  strokeWeight: 2
        });

        // Sets map to render Red Line
        branch1.setMap(map);
        branch2.setMap(map);
}

// Finds closest Red Line station and renders a path from your location to it
function renderClosestPath() {
        // Defaults to Davis Square station
        var closest = "Davis";
        for (var station in stations) {
                if (findDistance(station) < findDistance(closest)) {
                        closest = station;
                }
        }
        var path = [me, {lat: stations[closest][0], lng: stations[closest][1]}];
        var line = new google.maps.Polyline({
                  path: path,
                  geodesic: true,
                  strokeColor: '#0000FF',
                  strokeOpacity: 1.0,
                  strokeWeight: 2
        });
        line.setMap(map);
}

function findDistance(station) {
        stationLocation = new google.maps.LatLng(stations[station][0], stations[station][1]);
        return google.maps.geometry.spherical.computeDistanceBetween(me, stationLocation);
}