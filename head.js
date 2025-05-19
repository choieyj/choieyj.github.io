function authorize() {
    // Example using Authorization Code Flow
    const clientId = 'dbc874061f684f23a2e2679152122b50';
    const redirectUri = 'https://choieyj.github.io/';

    // Construct the authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}`;

    // Redirect the user to the authorization URL
    window.location.href = authUrl;

    // After the user is redirected back with the authorization code
    // Extract the code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Exchange the code for an access token (on the server-side)
        // Example using fetch API
        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + '00097a3c51a241198ea2ab59c190ffa7') //Use your client secret
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirectUri
            })
        })
            .then(response => response.json())
            .then(data => {
                const accessToken = data.access_token;
                const result = fetch('https://api.spotify.com/v1/me/top/artists?limit=5', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer  ' + token
                    }
                });

                data = result.json();
                console.log(data)
                console.log('Access Token:', accessToken);
                
                return data;
            })
            .catch(error => {
                console.error('Error exchanging code for token:', error);
            });
    }
}
