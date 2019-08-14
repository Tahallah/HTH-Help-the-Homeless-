"use strict"

function initMap() {
    var myLatLng = {lat: 37.3382, lng: -121.8863};
    var secondharvest = {lat: 37.292954, lng: -121.877384};
    var homefirst = {lat: 37.330080, lng: -121.882916}
    var family = {lat: 37.368077, lng: -121.868410}
    var imgArr = [];
    imgArr[0] = 'res/cafe-512.png';
    imgArr[1] = 'res/residence-512.png';
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: myLatLng,
        mapTypeid: 'roadmap'

    });
    new AutocompleteDirectionsHandler(map);

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    input.value = 'homeless shelter';
//document.dispatchEvent('places_changed');
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            
            
            var mk1 =new google.maps.Marker({
                map: map,
                icon: imgArr[1],
                title: place.name,
                position: place.geometry.location
            }) ; 
            
                        mk1.addListener('click', function() {
                        var infowindow = new google.maps.InfoWindow({
                        content: this.title
                        });
                    infowindow.open(map, this);
                        console.log(marker);
                    });

            
            markers.push(mk1);

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    var infoWindow = new google.maps.InfoWindow;
    var locations = [];

    locations[0] = {position: {lat: 37.3382, lng: -121.8863}, map: map};
    locations[1] = {
        position: {lat: 37.292954, lng: -121.877384},
        map: map,
        icon: imgArr[0],
        title: 'Second Harvest Food Bank'
    };
    locations[2] = {
        position: {lat: 37.330080, lng: -121.882916},
        map: map,
        icon: imgArr[1],
        title: 'Home First Sobrato House Youth Center'
    };
    locations[3] = {
        position: {lat: 37.368077, lng: -121.868410},
        map: map,
        icon: imgArr[1],
        title: 'Family Supportive Housing'
    };

    let marker;
    for (let i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker(locations[i]);
        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });


    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }


    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }
}
   /**
     * @constructor
     */
    function AutocompleteDirectionsHandler(map) {
        this.map = map;
        this.originPlaceId = null;
        this.destinationPlaceId = null;
        this.travelMode = 'WALKING';
        this.directionsService = new google.maps.DirectionsService;
        this.directionsDisplay = new google.maps.DirectionsRenderer;
        this.directionsDisplay.setMap(map);

        var originInput = document.getElementById('origin-input');
        var destinationInput = document.getElementById('destination-input');
        var modeSelector = document.getElementById('mode-selector');

        var originAutocomplete = new google.maps.places.Autocomplete(originInput);
        // Specify just the place data fields that you need.
        originAutocomplete.setFields(['place_id']);

        var destinationAutocomplete =
            new google.maps.places.Autocomplete(destinationInput);
        // Specify just the place data fields that you need.
        destinationAutocomplete.setFields(['place_id']);

        this.setupClickListener('changemode-walking', 'WALKING');
        this.setupClickListener('changemode-transit', 'TRANSIT');
        this.setupClickListener('changemode-driving', 'DRIVING');

        this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
        this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
            destinationInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
    }
    // Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
    AutocompleteDirectionsHandler.prototype.setupClickListener = function(
        id, mode) {
        var radioButton = document.getElementById(id);
        var me = this;

        radioButton.addEventListener('click', function() {
            me.travelMode = mode;
            me.route();
        });
    };

    AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(
        autocomplete, mode) {
        var me = this;
        autocomplete.bindTo('bounds', this.map);

        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();

            if (!place.place_id) {
                window.alert('Please select an option from the dropdown list.');
                return;
            }
            if (mode === 'ORIG') {
                me.originPlaceId = place.place_id;
            } else {
                me.destinationPlaceId = place.place_id;
            }
            me.route();
        });
    };
    AutocompleteDirectionsHandler.prototype.route = function() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }
        var me = this;

        this.directionsService.route(
            {
                origin: {'placeId': this.originPlaceId},
                destination: {'placeId': this.destinationPlaceId},
                travelMode: this.travelMode
            },
            function(response, status) {
                if (status === 'OK') {
                    me.directionsDisplay.setDirections(response);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
    } 