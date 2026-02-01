import { supabase } from '../database.js';

const VALID_TYPES = ['announcement', 'event'];

async function saveItem(req, res) {
  try {
    const userId = req.user?.userId;
    const { item_id, item_type } = req.body || {};
    if (!userId || !item_id || !item_type || !VALID_TYPES.includes(item_type)) {
      return res.status(400).json({ ok: false, error: 'Invalid input' });
    }

    // 1) Verify target exists in appropriate table
    const targetTable = item_type === 'announcement' ? 'announcements' : 'events';
    const { data: target, error: targetErr } = await supabase
      .from(targetTable)
      .select('id')
      .eq('id', item_id)
      .limit(1);
    if (targetErr) return res.status(500).json({ ok:false, error: targetErr.message });
    if (!target || !target.length) return res.status(400).json({ ok:false, error: 'Target item does not exist' });

    // 2) Check duplicate for this user and item (regardless of type per contract)
    const { data: dup, error: dupErr } = await supabase
      .from('saved_items')
      .select('user_id')
      .eq('user_id', userId)
      .eq('item_id', item_id)
      .limit(1);
    if (dupErr) return res.status(500).json({ ok:false, error: dupErr.message });
    if (dup && dup.length) return res.json({ ok: true, saved: false });

    // 3) Insert
    const { error: insErr } = await supabase
      .from('saved_items')
      .insert([{ user_id: userId, item_id, item_type }]);
    if (insErr) return res.status(500).json({ ok:false, error: insErr.message });
    return res.json({ ok: true, saved: true });

  } catch (err) {
    console.error('saveItem failed:', err);
    return res.status(500).json({ ok: false });
  }
}


async function listSaved(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { data, error } = await supabase
      .from('saved_items')
      .select('user_id,item_id,item_type,saved_at')
      .eq('user_id', req.user.userId)
      .order('saved_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err) {
    console.error('listSaved error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

export { saveItem, listSaved };

// Saved announcements with join
async function listSavedAnnouncements(req, res){
  try{
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { data: saved, error: savedErr } = await supabase
      .from('saved_items')
      .select('item_id')
      .eq('user_id', req.user.userId)
      .eq('item_type', 'announcement')
      .order('saved_at', { ascending: false });
    if (savedErr) return res.status(500).json({ error: savedErr.message });
    const ids = (saved || []).map(r => r.item_id);
    if (!ids.length) return res.json([]);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .in('id', ids);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch(err){
    console.error('listSavedAnnouncements error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

// Saved events with join
async function listSavedEvents(req, res){
  try{
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { data: saved, error: savedErr } = await supabase
      .from('saved_items')
      .select('item_id')
      .eq('user_id', req.user.userId)
      .eq('item_type', 'event')
      .order('saved_at', { ascending: false });
    if (savedErr) return res.status(500).json({ error: savedErr.message });
    const ids = (saved || []).map(r => r.item_id);
    if (!ids.length) return res.json([]);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', ids);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch(err){
    console.error('listSavedEvents error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

export { listSavedAnnouncements, listSavedEvents };
