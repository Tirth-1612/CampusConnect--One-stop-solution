const db = require('../database');

const VALID_TYPES = ['announcement', 'event'];

async function saveItem(req, res) {
  try {
    const userId = req.user?.userId;
    const { item_id, item_type } = req.body;

    if (!userId || !item_id || !item_type) {
      return res.status(400).json({ ok: false });
    }

    // 1️⃣ Verify item exists
    let existsQuery;
    if (item_type === 'announcement') {
      existsQuery = 'SELECT 1 FROM announcements WHERE id = $1';
    } else if (item_type === 'event') {
      existsQuery = 'SELECT 1 FROM events WHERE id = $1';
    } else {
      return res.status(400).json({ ok: false });
    }

    const itemExists = await db.query(existsQuery, [item_id]);
    if (itemExists.rowCount === 0) {
      return res.status(400).json({ ok: false });
    }

    // 2️⃣ Prevent duplicate saves
    const alreadySaved = await db.query(
      `SELECT 1 FROM saved_items WHERE user_id = $1 AND item_id = $2`,
      [userId, item_id]
    );

    if (alreadySaved.rowCount > 0) {
      return res.json({ ok: true, saved: false });
    }

    // 3️⃣ Safe insert (NO FK violation possible)
    await db.query(
      `INSERT INTO saved_items (user_id, item_id, item_type)
       VALUES ($1, $2, $3)`,
      [userId, item_id, item_type]
    );

    return res.json({ ok: true, saved: true });

  } catch (err) {
    console.error('saveItem failed:', err);
    return res.status(500).json({ ok: false });
  }
}


async function listSaved(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { rows } = await db.query(
      'SELECT user_id, item_id, item_type, saved_at FROM saved_items WHERE user_id = $1 ORDER BY saved_at DESC',
      [req.user.userId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('listSaved error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

module.exports = { saveItem, listSaved };

// Saved announcements with join
async function listSavedAnnouncements(req, res){
  try{
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { rows } = await db.query(
      `SELECT a.*
       FROM saved_items si
       JOIN announcements a ON a.id = si.item_id
       WHERE si.user_id = $1 AND si.item_type = 'announcement'
       ORDER BY si.saved_at DESC`,
      [req.user.userId]
    );
    return res.json(rows);
  } catch(err){
    console.error('listSavedAnnouncements error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

// Saved events with join
async function listSavedEvents(req, res){
  try{
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { rows } = await db.query(
      `SELECT e.*
       FROM saved_items si
       JOIN events e ON e.id = si.item_id
       WHERE si.user_id = $1 AND si.item_type = 'event'
       ORDER BY si.saved_at DESC`,
      [req.user.userId]
    );
    return res.json(rows);
  } catch(err){
    console.error('listSavedEvents error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

module.exports.listSavedAnnouncements = listSavedAnnouncements;
module.exports.listSavedEvents = listSavedEvents;
