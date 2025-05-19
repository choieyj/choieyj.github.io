var clientId = 'dbc874061f684f23a2e2679152122b50';
var clientSecret = '00097a3c51a241198ea2ab59c190ffa7';

var redirect = "https://choieyj.github.io/";

const AUTHORIZE = "https://accounts.spotify.com/authorize"

const TOKEN = "https://accounts.spotify.com/api/token"
const ARTISTS = "https://accounts.spotify.com/v1/me/top/artists?&limit=5"

const list = document.getElementById('list');

function authorize() {
    let url = AUTHORIZE;
    url += "?client_id=" + clientId;
    url += "&response_type=code";
    url += "&redirect_uri=" +encodeURI(redirect);
    url += "&show_dialog=true";
    url += "&scope=user-read-email user-read-playback-state user-top-read";
    window.location.href = url;
}

function onPageLoad() {
    if (window.location.search.length > 0) {
        handleRedirect();
    } else {
        getArtists();
    }
}

function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect)
}

function getCode() {
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code');
    }
    return code;
}

function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body+= "&code=" + code;
    body+= "&redirect_uri=" +encodeURI(redirect);
    body+= "&client_id=" + clientId;
    body+= "&client_secret=" + clientSecret;
    callAuthApi(body);
}

function callAuthApi(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientId + ":" + clientSecret));
    xhr.send(body);
    xhr.onload = handleAuthResponse;
}

function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body+= "&refresh_token=" + refresh_token;
    body+="&client_id=" + clientId;
    callAuthApi(body);
}

function handleAuthResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        getArtists();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function artistList(data) {
    removeItem();
    AudioParam.classList.remove('hide');
    for (i=0; i < data.items.length; i++) {
        const list_item = document.createElement('div');
        const list_text = document.createElement('div');
        const artist = document.createElement('div');
        const ref = document.createElement('a');
        const link = document.createTextNode('Link to Spotify');
        ref.appendChild(link);
        ref.title = "Link To Spotify";
        ref.href = data.items[i].external_urls.spotify;

        list_item.classList.add("list-item");
        list_text.classList.add("list-text");
        artist.classList.add("artist");
        ref.classList.add("links");
        ref.setAttribute('target', 'blank');

        artist.appendChild(span);

        list_text.appendChild(artist);
        list_text.appendChild(ref);
        list_text.appendChild(list_text);
    }
}
