// Helpers
function rad2degr(rad) { return rad * 180 / Math.PI; }
function degr2rad(degr) { return degr * Math.PI / 180; }

// adopted from https://github.com/gabmontes/fast-haversine
const R = 6378137; // m
const PI_360 = Math.PI / 360;

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = degr2rad(lat2-lat1);
  const dLon = degr2rad(lon2-lon1);
  lat1 = degr2rad(lat1);
  lat2 = degr2rad(lat2);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

// via https://stackoverflow.com/a/30033564
/**
 * @param latLngInDeg array of arrays with latitude and longtitude
 *   pairs in degrees. e.g. [[latitude1, longtitude1], [latitude2
 *   [longtitude2] ...]
 *
 * @return array with the center latitude longtitude pairs in 
 *   degrees.
 */
function getLatLngCenter(latLngInDegr) {
  var LATIDX = 0;
  var LNGIDX = 1;
  var sumX = 0;
  var sumY = 0;
  var sumZ = 0;

  for (var i=0; i<latLngInDegr.length; i++) {
      var lat = degr2rad(latLngInDegr[i][LATIDX]);
      var lng = degr2rad(latLngInDegr[i][LNGIDX]);
      // sum of cartesian coordinates
      sumX += Math.cos(lat) * Math.cos(lng);
      sumY += Math.cos(lat) * Math.sin(lng);
      sumZ += Math.sin(lat);
  }

  var avgX = sumX / latLngInDegr.length;
  var avgY = sumY / latLngInDegr.length;
  var avgZ = sumZ / latLngInDegr.length;

  // convert average x, y, z coordinate to latitude and longtitude
  var lng = Math.atan2(avgY, avgX);
  var hyp = Math.sqrt(avgX * avgX + avgY * avgY);
  var lat = Math.atan2(avgZ, hyp);

  return ([rad2degr(lat), rad2degr(lng)]);
}

function loadScript (file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `/js/${file}`;
    script.onload = resolve;
    script.onerror = reject;
    if (document.head.lastChild.src !== script.src) {
      document.head.appendChild(script);
    }
    else {
      resolve();
    }
  })
}
// Find nearest doener
function success(position) {
  let minimumDistance = 100000;
  let url = '/';
  entries.forEach(entry => {
    entry.locations.forEach(location => {
      const result = distance(position.coords.latitude, position.coords.longitude, location.lat, location.lon);
      if (result < minimumDistance) {
        minimumDistance = result;
        url = `/${entry.city}/${location.name}/`;
      }
    });
  });
  if (window.location.pathname != url) {
    alert(`Der nächste Döner ist nur ${minimumDistance.toFixed(1)} km von dir entfernt. Du wirst nun dorthin weitergeleitet.`);
    window.location = url;
  }
  else {
    alert(`Super, du befindest dich bereits beim Döner in deiner Nähe. Er ist nur ${minimumDistance.toFixed(1)} km von dir entfernt.`);
  }
}

function error() {
  alert('Standortabfrage nicht erfolgreich');
}

function getLocation() {
  // We might need permission for this
  navigator.geolocation.getCurrentPosition(success, error);

  // Don't forget to clean up
  overlay.parentNode.removeChild(overlay);
}

let overlay;
const entries = [];
const findButton = document.getElementById('find-btn');
if (findButton) {
  findButton.onclick = function () {
    if (navigator.geolocation) {
      // Create overlay with loader as upcoming task may take a while
      overlay = document.createElement('div');
      overlay.className = 'overlay';
      const loader = document.createElement('div');
      loader.className = 'loader';
      overlay.appendChild(loader);
      document.body.appendChild(overlay);
  
      if (!entries.length) {
        // Get data
        fetch('/index.json')
        .then(blob => blob.json())
        .then(data => entries.push(...data))
        .then(() => getLocation());
      }
      else {
        getLocation();
      }
    } else {
      alert('Geolocation wird von deinem Browser nicht unterstützt.');
    }
  };
}
// Filter input
function startFilter() {
  const regex = new RegExp(this.value, 'gi');
  const entries = document.querySelectorAll('li');
  entries.forEach(entry => {
    if (!entry.textContent.match(regex)) {
      entry.style.display = 'none';
    }
    else {
      entry.style.display = 'list-item';
    }
  });
}
const input = document.querySelector('input');
if (input) {
  input.addEventListener('keyup', startFilter);
  input.addEventListener('keypress', event => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  });
}
// Map
// multiple markers with clickable popups
// via http://harrywood.co.uk/maps/examples/openlayers/marker-popups.view.html
function buildMap () {
  const map = new OpenLayers.Map('map');
  map.addLayer(new OpenLayers.Layer.OSM());
  const vectorLayer = new OpenLayers.Layer.Vector('Overlay');
  map.addLayer(vectorLayer);

  const epsg4326 = new OpenLayers.Projection('EPSG:4326'); // WGS 1984 projection
  const projectTo = map.getProjectionObject(); // The map projection (Spherical Mercator)

  const locations = Array.from(document.querySelectorAll('li > a[data-lat]'));

  const array = [];
  locations.forEach(location => {
    array.push([location.dataset.lat, location.dataset.lon]);

    // Define markers as "features" of the vector layer:
    var feature = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.Point(location.dataset.lon, location.dataset.lat).transform(epsg4326, projectTo),
      {
        description: `<a href="${location.href}">${location.textContent}</a>`
      },
      {
        externalGraphic: '/img/marker.png',
        graphicHeight: 44,
        graphicWidth: 20,
        graphicXOffset: -10,
        graphicYOffset: -44
      }
    );
    vectorLayer.addFeatures(feature);
  });
  const center = getLatLngCenter(array);

  const lonLat = new OpenLayers.LonLat(center[1], center[0]).transform(epsg4326, projectTo);
  const count = locations.length;
  let zoom = 15;
  if (count > 100) {
    zoom = 11;
  }
  else if (count > 25) {
    zoom = 12;
  }
  else if (count > 10) {
    zoom = 13;
  }
  else if (count > 5) {
    zoom = 14;
  }
  // Finally set center
  map.setCenter(lonLat, zoom);

  // Add a selector control to the vectorLayer with popup functions
  const controls = {
    selector: new OpenLayers.Control.SelectFeature(vectorLayer, { onSelect: createPopup, onUnselect: destroyPopup })
  };

  function createPopup(feature) {
    feature.popup = new OpenLayers.Popup.FramedCloud("pop",
      feature.geometry.getBounds().getCenterLonLat(),
      null,
      feature.attributes.description,
      null,
      true,
      function() {
        controls['selector'].unselectAll();
      }
    );
    //feature.popup.closeOnMove = true;
    map.addPopup(feature.popup);
  }
  
  function destroyPopup(feature) {
    feature.popup.destroy();
    feature.popup = null;
  }

  map.addControl(controls['selector']);
  controls['selector'].activate();
}
const mapButton = document.querySelector('#map button');
if (mapButton) {
  mapButton.onclick = function () {
    loadScript('OpenLayers.js')
    .then(() => {
      mapButton.style.display = 'none';
      const sibling = mapButton.nextElementSibling;
      if (sibling) {
        // Pages have an addition button
        sibling.style.display = 'none';
      }
      mapButton.parentNode.classList.remove('is-overlay');
      buildMap();
    });
  };
}
