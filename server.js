const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { load, save } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const APP_USER = process.env.APP_USER || 'admin';
const APP_PASSWORD = process.env.APP_PASSWORD || 'empresa2024';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ─── AUTH MIDDLEWARE ──────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesión inválida' });
  }
}

// ─── AUTH ROUTES ──────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== APP_USER || password !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  // Expira en 2 horas
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 2 * 60 * 60 * 1000 // 2 horas
  });
  res.json({ ok: true, username });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? 'none' : 'lax' });
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ user: null });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded.username });
  } catch {
    res.json({ user: null });
  }
});

// Normaliza texto: minúsculas + sin tildes
function norm(str) {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// ─── ÁREAS ───────────────────────────────────────────────
app.get('/api/areas', (req, res) => {
  const data = load();
  const areas = data.areas.map(a => ({
    ...a,
    total_problemas: data.problemas.filter(p => p.area_id === a.id).length
  })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  res.json(areas);
});

app.post('/api/areas', requireAuth, (req, res) => {
  const { nombre, descripcion, color } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  const data = load();
  if (data.areas.find(a => a.nombre.toLowerCase() === nombre.toLowerCase()))
    return res.status(400).json({ error: 'El área ya existe' });
  const newArea = { id: data.nextAreaId, nombre, descripcion: descripcion || '', color: color || '#6366f1', creado_en: new Date().toISOString() };
  data.areas.push(newArea);
  data.nextAreaId++;
  save(data);
  res.json(newArea);
});

app.delete('/api/areas/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const data = load();
  data.problemas = data.problemas.filter(p => p.area_id !== id);
  data.areas = data.areas.filter(a => a.id !== id);
  save(data);
  res.json({ ok: true });
});

// ─── PROBLEMAS ───────────────────────────────────────────
app.get('/api/problemas', (req, res) => {
  const { area_id, buscar } = req.query;
  const data = load();
  let problemas = data.problemas.map(p => {
    const area = data.areas.find(a => a.id === p.area_id) || {};
    return { ...p, area_nombre: area.nombre, area_color: area.color, area_icono: area.icono };
  });
  if (area_id) problemas = problemas.filter(p => p.area_id === Number(area_id));
  if (buscar) {
    const q = norm(buscar);
    problemas = problemas.filter(p =>
      norm(p.titulo).includes(q) ||
      norm(p.descripcion).includes(q) ||
      norm(p.solucion).includes(q) ||
      norm(p.tags).includes(q) ||
      norm(p.area_nombre).includes(q)
    );
  }
  problemas.sort((a, b) => b.vistas - a.vistas || new Date(b.creado_en) - new Date(a.creado_en));
  res.json(problemas);
});

app.get('/api/problemas/:id', (req, res) => {
  const data = load();
  const p = data.problemas.find(p => p.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  const area = data.areas.find(a => a.id === p.area_id) || {};
  res.json({ ...p, area_nombre: area.nombre, area_color: area.color, area_icono: area.icono });
});

// Registrar visita (llamado por separado desde el cliente)
app.post('/api/problemas/:id/vista', (req, res) => {
  const data = load();
  const p = data.problemas.find(p => p.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  p.vistas = (p.vistas || 0) + 1;
  save(data);
  res.json({ vistas: p.vistas });
});

app.post('/api/problemas', requireAuth, (req, res) => {
  const { area_id, titulo, descripcion, solucion, tags } = req.body;
  if (!area_id || !titulo || !descripcion || !solucion) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const data = load();
  const newProblema = { id: data.nextProblemaId, area_id: Number(area_id), titulo, descripcion, solucion, tags: tags || '', vistas: 0, creado_en: new Date().toISOString() };
  data.problemas.push(newProblema);
  data.nextProblemaId++;
  save(data);
  res.json(newProblema);
});

app.put('/api/problemas/:id', requireAuth, (req, res) => {
  const { titulo, descripcion, solucion, tags } = req.body;
  const data = load();
  const p = data.problemas.find(p => p.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  Object.assign(p, { titulo, descripcion, solucion, tags: tags || '' });
  save(data);
  res.json({ ok: true });
});

app.delete('/api/problemas/:id', requireAuth, (req, res) => {
  const data = load();
  data.problemas = data.problemas.filter(p => p.id !== Number(req.params.id));
  save(data);
  res.json({ ok: true });
});

// ─── SERVIR FRONTEND EN PRODUCCIÓN ───────────────────────
const clientBuild = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

// En Vercel (serverless) no se llama listen
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`👤 Usuario: ${APP_USER}`);
    console.log(`   (configurar con APP_USER, APP_PASSWORD, JWT_SECRET)\n`);
  });
}

module.exports = app;
