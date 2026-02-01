const db = require('../database');

async function getTableColumns(table) {
  const q = `SELECT column_name FROM information_schema.columns WHERE table_name = $1`;
  const { rows } = await db.query(q, [table]);
  return rows.map(r => r.column_name);
}

async function insertDynamic(table, data) {
  const cols = await getTableColumns(table);
  const keys = Object.keys(data).filter(k => cols.includes(k));
  if (keys.length === 0) throw new Error('No valid columns to insert');
  const placeholders = keys.map((_, i) => `$${i + 1}`);
  const values = keys.map(k => data[k]);
  const q = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`;
  const { rows } = await db.query(q, values);
  return rows[0];
}

async function selectAll(table, filters = {}) {
  const cols = await getTableColumns(table);
  const keys = Object.keys(filters).filter(k => cols.includes(k) && filters[k] !== undefined && filters[k] !== null);
  const where = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
  const values = keys.map(k => filters[k]);
  const q = `SELECT * FROM ${table}${keys.length ? ' WHERE ' + where : ''} ORDER BY created_at DESC`;
  const { rows } = await db.query(q, values);
  return rows;
}

module.exports = { getTableColumns, insertDynamic, selectAll };
