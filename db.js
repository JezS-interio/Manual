const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Áreas
async function getAreas() {
  const res = await pool.query('SELECT *, (SELECT COUNT(*) FROM problemas WHERE area_id = areas.id) AS total_problemas FROM areas ORDER BY nombre');
  return res.rows;
}

async function addArea({ nombre, descripcion, color }) {
  const res = await pool.query(
    'INSERT INTO areas (nombre, descripcion, color) VALUES ($1, $2, $3) RETURNING *',
    [nombre, descripcion || '', color || '#6366f1']
  );
  return res.rows[0];
}

async function deleteArea(id) {
  await pool.query('DELETE FROM areas WHERE id = $1', [id]);
}

// Problemas
async function getProblemas({ area_id, buscar } = {}) {
  let q = 'SELECT p.*, a.nombre AS area_nombre, a.color AS area_color FROM problemas p JOIN areas a ON p.area_id = a.id';
  const conds = [];
  const params = [];
  if (area_id) { params.push(area_id); conds.push(`p.area_id = $${params.length}`); }
  if (buscar) {
    // Usar unaccent para ignorar tildes y lower para ignorar mayúsculas
    params.push(`%${buscar.toLowerCase()}%`);
    conds.push(`(
      unaccent(lower(p.titulo)) LIKE unaccent($${params.length}) OR
      unaccent(lower(p.descripcion)) LIKE unaccent($${params.length}) OR
      unaccent(lower(p.solucion)) LIKE unaccent($${params.length}) OR
      unaccent(lower(p.tags)) LIKE unaccent($${params.length}) OR
      unaccent(lower(a.nombre)) LIKE unaccent($${params.length})
    )`);
  }
  if (conds.length) q += ' WHERE ' + conds.join(' AND ');
  q += ' ORDER BY p.vistas DESC, p.creado_en DESC';
  const res = await pool.query(q, params);
  return res.rows;
}

async function getProblema(id) {
  const res = await pool.query(
    'SELECT p.*, a.nombre AS area_nombre, a.color AS area_color FROM problemas p JOIN areas a ON p.area_id = a.id WHERE p.id = $1',
    [id]
  );
  return res.rows[0];
}

async function addProblema({ area_id, titulo, descripcion, solucion, tags }) {
  const res = await pool.query(
    'INSERT INTO problemas (area_id, titulo, descripcion, solucion, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [area_id, titulo, descripcion, solucion, tags || '']
  );
  return res.rows[0];
}

async function updateProblema(id, { titulo, descripcion, solucion, tags }) {
  await pool.query(
    'UPDATE problemas SET titulo=$1, descripcion=$2, solucion=$3, tags=$4 WHERE id=$5',
    [titulo, descripcion, solucion, tags || '', id]
  );
}

async function deleteProblema(id) {
  await pool.query('DELETE FROM problemas WHERE id = $1', [id]);
}

async function registrarVista(id) {
  const res = await pool.query('UPDATE problemas SET vistas = vistas + 1 WHERE id = $1 RETURNING vistas', [id]);
  return res.rows[0]?.vistas || 0;
}

module.exports = {
  getAreas,
  addArea,
  deleteArea,
  getProblemas,
  getProblema,
  addProblema,
  updateProblema,
  deleteProblema,
  registrarVista,
  pool
};
