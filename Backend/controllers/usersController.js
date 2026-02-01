const db = require('../database');
const { hashPassword, comparePassword, signToken } = require('../modules/auth');

//req : name,email,password,role,department,year
async function signup(req, res) {
  try {
    const {name,department,year, email, password, role } = req.body || {};
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password, and role are required' });
    }
    const allowedRoles = ['student', 'club', 'faculty', 'admin'];/////////////////remove admin
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'invalid role' });
    }
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(400).json({ error: 'email already in use' });
    }
    const password_hash = await hashPassword(password);
    const insert = await db.query(
      'INSERT INTO users (name, email, password_hash, role,department,year) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role',
      [name,email, password_hash, role,department,year]
    );
    const user = insert.rows[0];
    const token = signToken({ userId: user.id, role: user.role });
    return res.status(201).json({ token, user });
  } 
  catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

//req : email,password,role
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const q = await db.query('SELECT id, email, role, password_hash FROM users WHERE email = $1', [email]);
    if (!q.rows.length) return res.status(401).json({ error: 'Invalid credentialsA' });

    const user = q.rows[0];
    const ok = await comparePassword(password, user.password_hash);

    if (!ok) {return res.status(401).json({ error: 'Invalid credentialsB' });}

    const token = signToken({ userId: user.id, role: user.role });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } 
  
  catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

//can update dept,name and year only
async function update(req,res){
  try{
    if(!req.user || !req.user.userId){
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.userId;
    const { name, department, year, password } = req.body || {};

    const updates = [];
    const values = [];

    if (typeof name === 'string' && name.trim().length){
      updates.push('name = $' + (values.length + 1));
      values.push(name);
    }
    if (typeof department === 'string' && department.trim().length){
      updates.push('department = $' + (values.length + 1));
      values.push(department);
    }
    if (year !== undefined && year !== null){
      updates.push('year = $' + (values.length + 1));
      values.push(year);
    }

    // Optional password update (hash before saving)
    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Invalid password' });
      }
      const password_hash = await hashPassword(password);
      updates.push('password_hash = $' + (values.length + 1));
      values.push(password_hash);
    }

    if (updates.length === 0){
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const setClause = updates.join(', ');
    const q = `UPDATE users SET ${setClause} WHERE id = $${values.length + 1} RETURNING id, name, email, role, department, year`;
    values.push(userId);

    const result = await db.query(q, values);
    if (!result.rows.length){
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  }
  catch(err){
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { signup, login ,update};
