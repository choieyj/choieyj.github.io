// Initialize vars
let access_token = null;
let user_id = null;
let artistsdisplayed = false;
let time_range = 'short_term';
let time_range_display = 'last 4 weeks';
let limit = '20';
let topArtists = [];

// Authorization. Key from spotify api website, must send a waypoint through their settings
function authorize() {
  const client_id = 'dbc874061f684f23a2e2679152122b50';
  const redirect_uri = "https://choieyj.github.io/";
  const scopes = 'user-top-read';

  const d = new Date();
  let date = [d.getMonth() + 1, d.getDate(), d.getFullYear()];
  date = date.join('/');

  let url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&scope=' + encodeURIComponent(scopes);
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
  window.location = url;
}

function getHashValue(key) {
  if (typeof key !== 'string') key = '';
  else key = key.toLowerCase();

  const keyAndHash = location.hash.match(new RegExp(key + '=([^&]*)'));
  return keyAndHash ? keyAndHash[1] : '';
}

function updateRange() {
  time_range = $('input[name=time]:checked', '#timeForm').val();
  switch (time_range) {
    case 'short_term': time_range_display = 'last 4 weeks'; break;
    case 'medium_term': time_range_display = 'last 6 months'; break;
    case 'long_term': time_range_display = 'all time'; break;
  }
}

function refresh() {
  if (artistsdisplayed) {
    getTopArtists();
  }
}

function checkWidth() {
  if (window.innerWidth < 1200) {
    $('html, body').animate({ scrollTop: $("#results-container").offset().top }, 500);
  }
}

function getUserId() {
  if (access_token) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + access_token },
      success: function(response) {
        user_id = response.id;
      },
      error: (jqXHR) => { ifError(jqXHR.status); },
    });
  } else {
    alert('Please log in to Spotify.');
  }
}

function getTopArtists() {
  $('#artist-button').addClass("loading");
  if (access_token) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/top/artists',
      data: { limit: 5, time_range: time_range },
      headers: { 'Authorization': 'Bearer ' + access_token },
      success: function(response) {
        $('#artist-button').removeClass("loading");
        $('#results').empty();
        $('#results-header').html('<h2>Top 5 Artists</h2>');

        let resultsHtml = '';
        let summaryList = '<h3>Artist List:</h3><ol>';
        topArtists = [];

        response.items.forEach((item, i) => {
          const name = item.name;
          const url = item.external_urls.spotify;
          const image = item.images[1]?.url || '';
          topArtists.push(name);

          resultsHtml += `
            <div class="column wide artist item">
              <a href="${url}" target="_blank">
                <img src="${image}">
              </a>
              <h4 class="title">${i + 1}. ${name}</h4>
            </div>
          `;
          summaryList += `<li>${name}</li>`;
        });

        summaryList += '</ol>';
        $('#results').html(resultsHtml);
        $('#artist-summary').html(summaryList);
        artistsdisplayed = true;
        checkWidth();
        console.log("Top 5 artists:", topArtists);
      },
      error: function(jqXHR) {
        ifError(jqXHR.status);
      },
    });
  } else {
    alert('Please log in to Spotify.');
  }
}

function ifError(error) {
  retryLogin();
  disableControls();
  let errorMessage;
  switch (error) {
    case 401: errorMessage = 'Unauthorized. Please log in to Spotify.'; break;
    case 429: errorMessage = 'Too many requests. Please try again later.'; break;
    default: errorMessage = 'Unable to authorize through Spotify Web API. Please try logging in again.';
  }
  alert(errorMessage);
}

function retryLogin() {
  $('#instructions').css('display', 'block');
  $('#login').css('display', 'block');
}

$(document).ready(function() {
  initialize();
  access_token = getHashValue('access_token');

  function enableControls() {
    $('#instructions').css('display', 'none');
    $('#login').css('display', 'none');
    $('#button-segment').removeClass("disabled");
    $('#timeForm').removeClass("disabled");
    $('#numForm').removeClass("disabled");
  }

  function disableControls() {
    $('#button-segment').addClass("disabled");
    $('#artist-button').addClass("disabled");
    $('#timeForm').addClass("disabled");
    $('#numForm').addClass("disabled");
  }

  function initialize() {
    $('#timeForm input').on('change', function() {
      updateRange();
      refresh();
    });
    const slider = document.getElementById("numResponses");
    slider.oninput = function() {
      limit = $('#numResponses').val().toString();
      $('#number').html("Number of results: " + limit);
    }
    $('#numResponses').on('change', refresh);
  }

  if (access_token) {
    getUserId();
    enableControls();
  } else {
    disableControls();
  }
});
