import { supabase } from '../database.js';

async function insertDynamic(table, data) {
  const { data: inserted, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return inserted;
}

async function selectAll(table, filters = {}) {
  let query = supabase.from(table).select('*');
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) query = query.eq(k, v);
  });
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export { insertDynamic, selectAll };
