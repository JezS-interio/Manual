const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const db = require('./db');

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
app.get('/api/areas', async (req, res) => {
  try {
    const areas = await db.getAreas();
    res.json(areas);
  } catch (e) { res.status(500).json({ error: 'Error al obtener áreas' }); }
});

app.post('/api/areas', requireAuth, async (req, res) => {
  const { nombre, descripcion, color } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    // Verificar unicidad
    const existentes = await db.getAreas();
    if (existentes.find(a => a.nombre.toLowerCase() === nombre.toLowerCase()))
      return res.status(400).json({ error: 'El área ya existe' });
    const newArea = await db.addArea({ nombre, descripcion, color });
    res.json(newArea);
  } catch (e) { res.status(500).json({ error: 'Error al crear área' }); }
});

app.delete('/api/areas/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.deleteArea(id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Error al borrar área' }); }
});

// ─── PROBLEMAS ───────────────────────────────────────────
app.get('/api/problemas', async (req, res) => {
  const { area_id, buscar } = req.query;
  try {
    const problemas = await db.getProblemas({ area_id, buscar: buscar ? norm(buscar) : undefined });
    res.json(problemas);
  } catch (e) { res.status(500).json({ error: 'Error al obtener problemas' }); }
});

app.get('/api/problemas/:id', async (req, res) => {
  try {
    const p = await db.getProblema(Number(req.params.id));
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    res.json(p);
  } catch (e) { res.status(500).json({ error: 'Error al obtener problema' }); }
});

// Registrar visita (llamado por separado desde el cliente)
app.post('/api/problemas/:id/vista', async (req, res) => {
  try {
    const vistas = await db.registrarVista(Number(req.params.id));
    res.json({ vistas });
  } catch (e) { res.status(500).json({ error: 'Error al registrar vista' }); }
});

app.post('/api/problemas', requireAuth, async (req, res) => {
  const { area_id, titulo, descripcion, solucion, tags } = req.body;
  if (!area_id || !titulo || !descripcion || !solucion) return res.status(400).json({ error: 'Faltan campos requeridos' });
  try {
    const nuevo = await db.addProblema({ area_id: Number(area_id), titulo, descripcion, solucion, tags });
    res.json(nuevo);
  } catch (e) { res.status(500).json({ error: 'Error al crear problema' }); }
});

app.put('/api/problemas/:id', requireAuth, async (req, res) => {
  const { titulo, descripcion, solucion, tags } = req.body;
  try {
    await db.updateProblema(Number(req.params.id), { titulo, descripcion, solucion, tags });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Error al actualizar problema' }); }
});

app.delete('/api/problemas/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteProblema(Number(req.params.id));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Error al borrar problema' }); }
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
