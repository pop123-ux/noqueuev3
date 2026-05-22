/**
 * Google Drive Client — Token Model (in-memory only)
 * Uses Google Identity Services token model.
 * Access tokens kept in memory. No refresh token in localStorage.
 * 
 * Requires: VITE_GOOGLE_CLIENT_ID env var
 */

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const API_BASE = 'https://www.googleapis.com/';

// In-memory token store — cleared on page reload (intentional)
let _accessToken = null;
let _tokenExpiry = null;

export function getStoredToken() {
  if (_accessToken && _tokenExpiry && Date.now() < _tokenExpiry) return _accessToken;
  return null;
}

export function setToken(token, expiresIn = 3600) {
  _accessToken = token;
  _tokenExpiry = Date.now() + (expiresIn - 60) * 1000;
}

export function clearToken() {
  _accessToken = null;
  _tokenExpiry = null;
}

export function isTokenValid() {
  return !!(getStoredToken());
}

/**
 * Request a new access token via Google Identity Services (popup).
 * Returns the access token string.
 */
export function requestAccessToken() {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID not configured. Set it in app secrets.'));
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services not loaded. Ensure the GIS script is in index.html.'));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        setToken(response.access_token, parseInt(response.expires_in || '3600'));
        resolve(response.access_token);
      },
    });

    client.requestToken();
  });
}

/**
 * Ensure we have a valid token, requesting one if not.
 */
async function ensureToken() {
  const existing = getStoredToken();
  if (existing) return existing;
  return requestAccessToken();
}

/**
 * Create or find the NoQueue Documents folder.
 * Returns folder ID.
 */
export async function getOrCreateFolder(folderName = 'NoQueue Documents', parentId = null) {
  const token = await ensureToken();

  // Search for existing folder
  const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false${parentId ? ` and '${parentId}' in parents` : ''}`;
  const searchRes = await fetch(`${API_BASE}drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const searchData = await searchRes.json();

  if (searchData.files?.length > 0) return searchData.files[0].id;

  // Create folder
  const createRes = await fetch(`${API_BASE}drive/v3/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  const folder = await createRes.json();
  return folder.id;
}

/**
 * Upload a PDF blob to Google Drive using multipart upload.
 * Returns { id, webViewLink, webContentLink }
 */
export async function uploadFileToDrive({ blob, fileName, folderId, existingFileId = null }) {
  const token = await ensureToken();

  const metadata = {
    name: fileName,
    mimeType: 'application/pdf',
    ...(folderId ? { parents: [folderId] } : {}),
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob, fileName);

  let url = `${API_BASE}upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink`;
  let method = 'POST';

  // Update existing file (remove parents from metadata for update)
  if (existingFileId) {
    url = `${API_BASE}upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,webViewLink,webContentLink`;
    method = 'PATCH';
    delete metadata.parents;
  }

  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Drive upload failed');
  }

  return res.json();
}

/**
 * Open a Drive file in a new tab.
 */
export function openInDrive(webViewLink) {
  if (webViewLink) window.open(webViewLink, '_blank');
}