import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const clientId = 'dbc874061f684f23a2e2679152122b50';
const redirect = "https://choieyj.github.io/tool";
const AUTHORIZE = "https://accounts.spotify.com/authorize";

const supabaseUrl = 'https://elvempcvrbivdsxsxqjg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdmVtcGN2cmJpdmRzeHN4cWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Mzc3MjksImV4cCI6MjA2MzIxMzcyOX0.7Dza0Hkct2WD7WfAQ125phszFlPgSMBFd1V5VkN8V-s';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const loginBtn = document.getElementById('loginBtn');
const artistBtn = document.getElementById('artistBtn');
const artistList = document.getElementById('artistList');
const output = document.getElementById('output');
const TICKETMASTER_KEY = '9W4IAiuiI9Oipich4R4AivG8IGyu8ERf';

window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    output.style.display = 'block';
    output.textContent = "⏳ Exchanging code for token...";
    try {
      const { data, error } = await supabase.functions.invoke('get-token', {
        body: { code }
      });

      if (error) {
        output.textContent = "❌ Error:\n" + JSON.stringify(error, null, 2);
      } else {
        output.textContent = "✅ Token Received.";
        loginBtn.style.display = 'none';
        artistBtn.style.display = 'inline-block';
        window.accessToken = data.access_token;
      }
    } catch (err) {
      output.textContent = "💥 Unexpected error:\n" + err.message;
    }
  }
};

loginBtn.onclick = () => {
  const url = `${AUTHORIZE}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&scope=user-read-email user-read-playback-state user-top-read&show_dialog=true`;
  window.location.href = url;
};

artistBtn.onclick = async () => {
  output.style.display = 'block';
  output.textContent = "🎧 Fetching your top artists...";

  try {
    const { data, error } = await supabase.functions.invoke('get-top-artists', {
      body: { access_token: window.accessToken }
    });

    if (error) {
      output.textContent = "❌ Error fetching artists:\n" + JSON.stringify(error, null, 2);
    } else {
      output.style.display = 'none';
      artistList.style.display = 'grid';
      artistList.innerHTML = '';

      window.topArtistNames = data.items.map(item => item.name);

      data.items.forEach((artist, index) => {
        const card = document.createElement('div');
        card.className = 'artist-card';

        const img = document.createElement('img');
        img.src = artist.images[1]?.url || artist.images[0]?.url || '';
        img.alt = artist.name;
        img.style.objectFit = 'cover';
        img.style.height = '160px';

        const name = document.createElement('h3');
        name.textContent = `${index + 1}. ${artist.name}`;

        card.appendChild(img);
        card.appendChild(name);
        artistList.appendChild(card);
      });

      artistBtn.style.display = 'none';

      const userLocation = await getUserLocation();
      if (userLocation) {
        const { lat, lon } = userLocation;
        await showConcerts(window.topArtistNames, lat, lon);
      }
    }
  } catch (err) {
    output.style.display = 'block';
    output.textContent = "💥 Unexpected error:\n" + err.message;
  }
};

async function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return resolve(null);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      () => {
        alert("Could not get location. Please allow location access.");
        resolve(null);
      }
    );
  });
}

async function showConcerts(artists, lat, lon) {
  const resultDiv = document.getElementById('results');
  resultDiv.innerHTML = '';

  for (const artist of artists) {
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_KEY}&keyword=${encodeURIComponent(artist)}&latlong=${lat},${lon}&radius=100&unit=miles`;

    try {
      const res = await fetch(tmUrl);
      const data = await res.json();
      const events = data._embedded?.events || [];

      const section = document.createElement('section');
      section.innerHTML = `<h2>${artist}</h2>`;

      if (events.length === 0) {
        section.innerHTML += `<p>No upcoming concerts found nearby.</p>`;
      } else {
        events.forEach(event => {
          const el = document.createElement('div');
          el.className = 'concert-item';
          el.innerHTML = `
            <p><strong>${event.name}</strong></p>
            <p>${event.dates.start.localDate} @ ${event._embedded.venues[0].name}</p>
            <a href="${event.url}" target="_blank">Buy Tickets</a>
            <hr/>
          `;
          section.appendChild(el);
        });
      }

      resultDiv.appendChild(section);
    } catch (err) {
      console.error(`Error fetching concerts for ${artist}:`, err);
    }
  }
}
