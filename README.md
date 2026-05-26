# Manual Empresa — Base de Conocimiento

App web interna para gestionar problemas y soluciones por área.

## Instalación

```bash
# 1. Instalar dependencias del servidor
npm install

# 2. Instalar dependencias del frontend
cd client && npm install && cd ..
```

## Desarrollo (dos terminales)

**Terminal 1 — Backend:**
```bash
npm start
# Servidor en http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
# App en http://localhost:5173
```

## Producción (una sola URL)

```bash
# Compilar frontend
npm run build

# Iniciar servidor (sirve todo en :3001)
npm start
```

## Contraseña de administrador

Por defecto: **`empresa2024`**

Para cambiarla, setear la variable de entorno antes de iniciar:
```bash
# Windows
set ADMIN_PASSWORD=miContraseña
npm start

# Linux/Mac
ADMIN_PASSWORD=miContraseña npm start
```

## Funcionalidades

- Ver áreas/departamentos
- Ver problemas por área
- Búsqueda global
- Agregar nuevas áreas (con contraseña)
- Agregar problemas con título, descripción, solución y etiquetas (con contraseña)
- Eliminar problemas (con contraseña)
- Contador de vistas por problema
