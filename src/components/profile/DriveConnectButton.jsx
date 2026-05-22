import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Loader2, CheckCircle2, ExternalLink, LogOut } from 'lucide-react';
import { requestAccessToken, clearToken, isTokenValid } from '@/lib/google/driveClient';
import { base44 } from '@/api/base44Client';

export default function DriveConnectButton({ userId, onConnectionChange }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState(null);
  const [error, setError] = useState(null);

  // Check client id configured
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Check if token is still valid in memory
    setConnected(isTokenValid());
  }, []);

  const handleConnect = async () => {
    if (!clientId) {
      setError('Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID in app secrets.');
      return;
    }
    setConnecting(true);
    setError(null);
    const token = await requestAccessToken();
    // Optionally get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).catch(() => null);

    setConnected(true);
    setConnectedEmail(userRes?.email || null);
    setConnecting(false);

    // Persist connection metadata (no token)
    await base44.entities.GoogleDriveConnection.create({
      user_id: userId,
      connected_email: userRes?.email || '',
      is_connected: true,
      auth_mode: 'token',
      scopes: 'https://www.googleapis.com/auth/drive.file',
      last_sync_at: new Date().toISOString(),
    });

    onConnectionChange?.({ connected: true, email: userRes?.email });
  };

  const handleDisconnect = async () => {
    clearToken();
    setConnected(false);
    setConnectedEmail(null);
    onConnectionChange?.({ connected: false });
  };

  if (!clientId) {
    return (
      <div className="rounded-xl bg-warning/8 border border-warning/20 p-4">
        <p className="text-xs text-warning font-semibold mb-1">Google Drive not configured</p>
        <p className="text-[11px] text-slate-400">
          Add <code className="text-primary">VITE_GOOGLE_CLIENT_ID</code> in app secrets to enable Google Drive upload.
        </p>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="rounded-xl bg-success/8 border border-success/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <div>
            <p className="text-xs font-semibold text-white">Google Drive connected</p>
            {connectedEmail && <p className="text-[11px] text-slate-400">{connectedEmail}</p>}
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-destructive transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600/10 text-blue-400 text-sm font-semibold hover:bg-blue-600/20 transition-colors border border-blue-500/20 disabled:opacity-50"
      >
        {connecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Cloud className="w-4 h-4" />
        )}
        {connecting ? 'Connecting to Drive…' : 'Connect Google Drive'}
      </button>
      {error && <p className="text-[11px] text-destructive text-center">{error}</p>}
      <p className="text-[10px] text-slate-600 text-center">
        Only accesses files created by this app (drive.file scope). No access to other Drive files.
      </p>
    </div>
  );
}