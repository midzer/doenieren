function success(position) {
  let minimumDistance = 100000;
  let url = '/';
  locations.forEach(location => {
    const distance = calcDistance(position.coords.latitude, position.coords.longitude, location.lat, location.lon);
    if (distance < minimumDistance) {
      minimumDistance = distance;
      url = location.url;
    }
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

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

let overlay;
const locations = [];
const button = document.getElementById('find-btn');
button.onclick = function () {
  if (navigator.geolocation) {
    // Create overlay with loader as upcoming task may take a while
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    const loader = document.createElement('div');
    loader.className = 'loader';
    overlay.appendChild(loader);
    console.log(overlay);
    document.body.appendChild(overlay);

    if (!locations.length) {
      // Get data
      fetch('/index.json')
      .then(blob => blob.json())
      .then(data => locations.push(...data))
      .then(() => getLocation());
    }
    else {
      getLocation();
    }
  } else {
    alert('Geolocation wird von deinem Browser nicht unterstützt.');
  }
};
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
