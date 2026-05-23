/**
 * Vault → Google Drive auto-sync helper.
 * Uploads a GovDocument's file to "NoQueue Documents/{Type}" on the user's
 * Drive, then patches the entity with Drive metadata so the UI can show
 * sync status and open-in-Drive links.
 */
import { base44 } from '@/api/base44Client';
import { uploadFileToDrive, getOrCreateFolder, isTokenValid, requestAccessToken } from '@/lib/google/driveClient';
import { DOC_TYPES } from '@/components/vault/DocumentCard';

const ROOT_FOLDER = 'NoQueue Documents';

function safeFileName(doc) {
  const meta = DOC_TYPES[doc.document_type] || DOC_TYPES.other;
  const base = (doc.document_title || meta.label || 'document').replace(/[^\w\-\u00C0-\u017F ]+/g, '').slice(0, 80);
  const date = new Date(doc.created_date || Date.now()).toISOString().slice(0, 10);
  return `${date} — ${base}.pdf`;
}

export async function syncVaultDocToDrive(doc, { silent = false } = {}) {
  if (!doc?.id || !doc?.file_url) return null;
  if (doc.google_drive_file_id) return { id: doc.google_drive_file_id, webViewLink: doc.google_drive_web_view_link };
  if (silent && !isTokenValid()) return null;

  try {
    await base44.entities.GovDocument.update(doc.id, { drive_upload_status: 'uploading' });

    if (!isTokenValid()) await requestAccessToken();

    const rootId = await getOrCreateFolder(ROOT_FOLDER);
    const typeLabel = (DOC_TYPES[doc.document_type] || DOC_TYPES.other).label;
    const subId = await getOrCreateFolder(typeLabel, rootId);

    const fileRes = await fetch(doc.file_url);
    if (!fileRes.ok) throw new Error('Could not fetch source file');
    const blob = await fileRes.blob();

    const uploaded = await uploadFileToDrive({
      blob,
      fileName: safeFileName(doc),
      folderId: subId,
    });

    await base44.entities.GovDocument.update(doc.id, {
      drive_upload_status: 'uploaded',
      google_drive_file_id: uploaded.id,
      google_drive_web_view_link: uploaded.webViewLink,
    });

    return uploaded;
  } catch (err) {
    console.warn('Vault → Drive sync failed:', err);
    try {
      await base44.entities.GovDocument.update(doc.id, { drive_upload_status: 'error' });
    } catch {}
    return null;
  }
}

export async function syncAllPendingToDrive(docs) {
  const pending = (docs || []).filter(
    d => d.file_url && d.drive_upload_status !== 'uploaded' && !d.google_drive_file_id
  );
  const results = [];
  for (const d of pending) {
    results.push(await syncVaultDocToDrive(d, { silent: false }));
  }
  return results.filter(Boolean).length;
}