// Script de migración de JSON a PostgreSQL (Neon)
const fs = require('fs');
const { Client } = require('pg');

const db = JSON.parse(fs.readFileSync('./data/db.json', 'utf8'));

const connectionString = 'postgresql://neondb_owner:npg_0tWiKRL5DheI@ep-royal-shape-aq7fn6od-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Limpiar tablas
    await client.query('DELETE FROM problemas');
    await client.query('DELETE FROM areas');

    // Insertar áreas
    for (const area of db.areas) {
      await client.query(
        'INSERT INTO areas (id, nombre, descripcion, color, creado_en) VALUES ($1, $2, $3, $4, $5)',
        [area.id, area.nombre, area.descripcion, area.color, area.creado_en]
      );
    }
    // Ajustar secuencia de IDs
    await client.query('SELECT setval(pg_get_serial_sequence(\'areas\', \'id\'), (SELECT MAX(id) FROM areas))');

    // Insertar problemas
    for (const p of db.problemas) {
      await client.query(
        'INSERT INTO problemas (id, area_id, titulo, descripcion, solucion, tags, vistas, creado_en) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [p.id, p.area_id, p.titulo, p.descripcion, p.solucion, p.tags, p.vistas, p.creado_en]
      );
    }
    await client.query('SELECT setval(pg_get_serial_sequence(\'problemas\', \'id\'), (SELECT MAX(id) FROM problemas))');

    console.log('Migración completada con éxito.');
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error('Error en migración:', err); process.exit(1); });
