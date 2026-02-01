const db = require('../database');

async function getUsersCount(req, res){
  try{
    const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM users');
    return res.json({ count: rows[0]?.count || 0 });
  } catch(err){
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getUsersCount };
