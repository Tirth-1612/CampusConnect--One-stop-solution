import { apiGet, apiPost } from './client';
import { storage, TOKEN_KEY } from '../utils/storage';

function ensureToken(token){
  return token || storage.get(TOKEN_KEY);
}

export async function listSaved(token){
  const res = await apiGet(`/api/saved/listSavedItem`, ensureToken(token));
  return res.ok ? (res.data || []) : [];
}

export async function saveItem(token, item_id, item_type){
  const res = await apiPost(`/api/saved/saveItem`, { item_id, item_type }, ensureToken(token));
  if (!res.ok) {
    console.log(res);
    return false;
  }
  // If backend returns { ok: true, saved: false } for duplicates, treat as already-saved
  if (typeof res.data?.saved !== 'undefined') {return !!res.data.saved;}
  return true;
}

export async function listSavedAnnouncements(token){
  const res = await apiGet(`/api/saved/announcements`, ensureToken(token));
  return res.ok ? (res.data || []) : [];
}

export async function listSavedEvents(token){
  const res = await apiGet(`/api/saved/events`, ensureToken(token));
  return res.ok ? (res.data || []) : [];
}
