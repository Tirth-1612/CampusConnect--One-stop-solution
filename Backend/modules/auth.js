const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const HASH_ROUNDS = 10;

async function hashPassword(plain) {
  if (typeof plain !== 'string' || plain.length < 6) {
    throw new Error('Invalid password');
  }
  return bcrypt.hash(plain, HASH_ROUNDS);
}

async function comparePassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT secret not configured');
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT secret not configured');
  return jwt.verify(token, secret);
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
};
