const db = require('../database');
const { insertDynamic, selectAll } = require('../modules/dbUtil');

async function listClubs(req, res) {
  try {
    const rows = await selectAll('clubs');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// List clubs plus the requesting user's membership status if authenticated
async function listClubsWithStatus(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const { rows } = await db.query(
      `SELECT c.*, uc.status AS membership_status
       FROM clubs c
       LEFT JOIN user_clubs uc
         ON uc.club_id = c.id AND uc.user_id = $1
       ORDER BY c.id ASC`,
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

//can be created only by role===admin
async function createClub(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const body = req.body || {};
    const inserted = await insertDynamic('clubs', body);
    // Add creator as club admin in user_clubs
    try {
      if (inserted && inserted.id) {
        await db.query(
          'INSERT INTO user_clubs (user_id, club_id, role, status) VALUES ($1, $2, $3, $4)',
          [req.user.userId, inserted.id, 'admin', 'approved']
        );
      }
    } catch (e) {
      // Ignore linkage failure; primary response still succeeds
    }
    return res.status(201).json(inserted);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 1) User joins a club
async function joinClub(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const clubId = req.params.clubId;
    if (!clubId) return res.status(400).json({ error: 'clubId is required' });

    // Prevent duplicates
    const exists = await db.query(
      'SELECT 1 FROM user_clubs WHERE user_id = $1 AND club_id = $2 LIMIT 1',
      [userId, clubId]
    );
    if (exists.rows.length) {
      return res.status(200).json({ ok: true, message: 'Already requested or member' });
    }

    await db.query(
      'INSERT INTO user_clubs (user_id, club_id, role, status) VALUES ($1, $2, $3, $4)',
      [userId, clubId, 'member', 'pending']
    );
    return res.status(201).json({ ok: true, message: 'Join request submitted' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 2) Admin fetches pending requests for a club
async function getPendingRequests(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const clubId = req.params.clubId;

    if (!clubId) return res.status(400).json({ error: 'clubId is required' });
    // Verify requester is admin of the club
    const adminCheck = await db.query(
      "SELECT 1 FROM user_clubs WHERE user_id = $1 AND club_id = $2 AND role = 'admin' AND status = 'approved' LIMIT 1",
      [userId, clubId]
    );
    
    if (!adminCheck.rows.length) return res.status(403).json({ error: 'Forbidden' });

    const { rows } = await db.query(
      `SELECT  uc.user_id AS id, uc.status, u.name, u.email
       FROM user_clubs uc
       JOIN users u ON u.id = uc.user_id
       WHERE uc.club_id = $1 AND uc.status = 'pending'
       ORDER BY uc.user_id DESC`,
      [clubId]
    );
    return res.json(rows);
  } 
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 3) Admin approves or rejects a user_clubs request
async function updateUserClubStatus(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const adminUserId = req.user.userId;
    const clubId = req.params.clubId;
    const targetUserId = req.params.userId;
    const { status } = req.body || {};

    const allowed = ['approved', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify requester is approved admin of the club
    const adminCheck = await db.query(
      "SELECT 1 FROM user_clubs WHERE user_id = $1 AND club_id = $2 AND role = 'admin' AND status = 'approved' LIMIT 1",
      [adminUserId, clubId]
    );
    if (!adminCheck.rows.length) return res.status(403).json({ error: 'Forbidden' });

    // Update only status for the composite key
    const upd = await db.query(
      'UPDATE user_clubs SET status = $1 WHERE user_id = $2 AND club_id = $3',
      [status, targetUserId, clubId]
    );
    if (upd.rowCount === 0) return res.status(404).json({ error: 'Request not found' });

    return res.json({ ok: true, message: 'Status updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 4) List approved members for a club (only club admin allowed)
async function getClubMembers(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const clubId = req.params.clubId;
    if (!clubId) return res.status(400).json({ error: 'clubId is required' });

    const adminCheck = await db.query(
      "SELECT 1 FROM user_clubs WHERE user_id = $1 AND club_id = $2 AND role = 'admin' AND status = 'approved' LIMIT 1",
      [userId, clubId]
    );
    if (!adminCheck.rows.length) return res.status(403).json({ error: 'Forbidden' });

    const { rows } = await db.query(
      `SELECT uc.user_id, uc.role, u.name, u.email
       FROM user_clubs uc
       JOIN users u ON u.id = uc.user_id
       WHERE uc.club_id = $1 AND uc.status = 'approved'
       ORDER BY u.name ASC`,
      [clubId]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


// New: update status and return the updated row
async function updateUserClubStatusV2(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const adminUserId = req.user.userId;
    const clubId = req.params.clubId;
    const targetUserId = req.params.userId;
    const { status } = req.body || {};

    const allowed = ['approved', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const adminCheck = await db.query(
      "SELECT 1 FROM user_clubs WHERE user_id = $1 AND club_id = $2 AND role = 'admin' AND status = 'approved' LIMIT 1",
      [adminUserId, clubId]
    );
    if (!adminCheck.rows.length) return res.status(403).json({ error: 'Forbidden' });

    const { rows } = await db.query(
      'UPDATE user_clubs SET status = $1 WHERE user_id = $2 AND club_id = $3 RETURNING user_id AS id, club_id, role, status',
      [status, targetUserId, clubId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { listClubs, listClubsWithStatus, createClub, joinClub, getPendingRequests, updateUserClubStatus, getClubMembers, updateUserClubStatusV2};
