import { supabase } from '../database.js';
import { hashPassword, comparePassword, signToken } from '../modules/auth.js';

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
    const { data: existing, error: existErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);
    if (existErr) return res.status(500).json({ error: 'Internal Server Error' });
    if (existing && existing.length) {
      return res.status(400).json({ error: 'email already in use' });
    }
    const password_hash = await hashPassword(password);
    const { data: inserted, error: insErr } = await supabase
      .from('users')
      .insert([{ name, email, password_hash, role, department, year }])
      .select('id, email, role')
      .single();
    if (insErr) return res.status(500).json({ error: 'Internal Server Error' });
    const user = inserted;
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
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, password_hash')
      .eq('email', email)
      .limit(1);
    if (error) return res.status(500).json({ error: 'Internal Server Error' });
    if (!users || !users.length) return res.status(401).json({ error: 'Invalid credentialsA' });

    const user = users[0];
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

    const patch = {};
    if (typeof name === 'string' && name.trim().length) patch.name = name;
    if (typeof department === 'string' && department.trim().length) patch.department = department;
    if (year !== undefined && year !== null) patch.year = year;

    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Invalid password' });
      }
      patch.password_hash = await hashPassword(password);
    }

    if (!Object.keys(patch).length){
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', userId)
      .select('id, name, email, role, department, year')
      .single();
    if (error) return res.status(500).json({ error: 'Internal Server Error' });
    if (!data) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: data });
  }
  catch(err){
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export { signup, login ,update };
