import type { GoogleUser } from '../types';

// IMPORTANT: To enable Google Drive integration, you must obtain a Google Client ID
// from the Google Cloud Console (https://console.cloud.google.com/) and replace the
// placeholder value below.
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// FIX: Changed type annotation from 'google.accounts.oauth2.TokenClient' to 'any' to resolve "Cannot find namespace 'google'" error.
let tokenClient: any | null = null;
let onAuthChangeCallback: ((user: GoogleUser | null) => void) | null = null;

export const initGoogleAuth = (callback: (user: GoogleUser | null) => void) => {
    onAuthChangeCallback = callback;
    
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        console.warn('Google Drive feature is disabled. Please provide a valid GOOGLE_CLIENT_ID in services/googleAuthService.ts');
        // Let the AuthProvider know that auth is "ready" but there is no user
        onAuthChangeCallback(null);
        return;
    }
    
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => gapi.load('client', initGapiClient);
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = initGisClient;
    document.body.appendChild(gisScript);
};

const initGapiClient = () => {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).catch(console.error);
};

const initGisClient = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse) => {
            if (tokenResponse.error) {
                console.error('Google Auth Error:', tokenResponse.error);
                onAuthChangeCallback?.(null);
                return;
            }
            gapi.client.setToken(tokenResponse);
            fetchUserInfo();
        },
    });
};

const fetchUserInfo = async () => {
    try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${gapi.client.getToken().access_token}`
            }
        });
        if (!res.ok) throw new Error('Failed to fetch user info');
        const profile = await res.json();
        const user: GoogleUser = {
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
        };
        onAuthChangeCallback?.(user);
    } catch (error) {
        console.error("Error fetching user info:", error);
        onAuthChangeCallback?.(null);
    }
};

export const signIn = () => {
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        alert("Google Drive integration is not configured. A developer needs to provide a Google Client ID.");
        return;
    }
    
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        console.error("Google Auth client not initialized.");
    }
};

export const signOut = () => {
    const token = gapi.client.getToken();
    if (token) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
            onAuthChangeCallback?.(null);
        });
    }
};
