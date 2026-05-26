const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'db.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const defaultData = {
  areas: [
    { id: 1, nombre: 'Sales', descripcion: '', color: '#6366f1', creado_en: new Date().toISOString() },
    { id: 2, nombre: 'Operations', descripcion: '', color: '#f59e0b', creado_en: new Date().toISOString() },
    { id: 3, nombre: 'Tech', descripcion: '', color: '#3b82f6', creado_en: new Date().toISOString() },
    { id: 4, nombre: 'Product', descripcion: '', color: '#10b981', creado_en: new Date().toISOString() },
    { id: 5, nombre: 'Finance', descripcion: '', color: '#ec4899', creado_en: new Date().toISOString() },
    { id: 6, nombre: 'Compliance', descripcion: '', color: '#8b5cf6', creado_en: new Date().toISOString() }
  ],
  problemas: [
    { id: 1, area_id: 1, titulo: 'El CRM no deja cerrar una oportunidad', descripcion: 'Al intentar marcar una oportunidad como ganada o perdida, el botón no responde o da error de validación.', solucion: 'Verificar que todos los campos obligatorios estén completos (valor estimado, fecha de cierre y contacto principal). Si el problema persiste, cerrar sesión, limpiar caché del navegador y volver a intentarlo. Contactar a Tech si continúa.', tags: 'crm,oportunidad,cierre,ventas', vistas: 0, creado_en: new Date().toISOString() },
    { id: 2, area_id: 2, titulo: 'Cómo solicitar un proveedor nuevo', descripcion: 'Necesito contratar un proveedor que no está en el sistema y no sé cuál es el proceso de alta.', solucion: 'Completar el formulario de "Alta de Proveedor" disponible en la intranet > Operaciones > Proveedores. Adjuntar: razón social, CUIT, datos bancarios y contacto comercial. El área de Compras aprueba en 3-5 días hábiles.', tags: 'proveedor,alta,compras,operaciones', vistas: 0, creado_en: new Date().toISOString() },
    { id: 3, area_id: 3, titulo: 'Cómo solicitar acceso a un repositorio', descripcion: 'Soy nuevo en el equipo y no tengo acceso al repositorio de código del proyecto.', solucion: 'Pedirle al tech lead de tu equipo que te agregue al repositorio en GitHub/GitLab con el rol correspondiente (developer o maintainer). Si no sabés quién es el tech lead, consultarlo con RRHH o tu manager.', tags: 'github,repositorio,acceso,codigo', vistas: 0, creado_en: new Date().toISOString() },
    { id: 4, area_id: 4, titulo: 'Cómo reportar un bug desde el campo', descripcion: 'El equipo de ventas/ops reporta un problema en el producto y no sé cómo documentarlo correctamente.', solucion: 'Usar el canal de Slack #bug-reports o cargar un ticket en Jira > Proyecto correspondiente > Tipo: Bug. Incluir: descripción del problema, pasos para reproducirlo, capturas de pantalla y entorno (staging/producción). Product triagea en 24hs.', tags: 'bug,jira,reporte,producto', vistas: 0, creado_en: new Date().toISOString() },
    { id: 5, area_id: 5, titulo: 'Cómo cargar un gasto de representación', descripcion: 'Tuve gastos con clientes (almuerzo, evento) y necesito reembolso pero no sé el proceso.', solucion: 'Ingresar al sistema de gastos > Nueva liquidación > Tipo: Representación. Adjuntar factura a nombre de la empresa, indicar el cliente y el motivo. Monto máximo sin aprobación previa: USD 150. Aprobación del manager requerida para montos mayores.', tags: 'gasto,representacion,reembolso,liquidacion', vistas: 0, creado_en: new Date().toISOString() },
    { id: 6, area_id: 6, titulo: 'Dónde firmar el acuerdo de confidencialidad', descripcion: 'Me dijeron que tengo que firmar un NDA pero no sé dónde encontrar el documento ni cómo proceder.', solucion: 'El NDA se firma digitalmente a través de DocuSign. Revisar el mail recibido al ingreso con asunto "Documentación de onboarding". Si no lo recibiste, contactar a compliance@empresa.com indicando nombre completo y fecha de inicio.', tags: 'nda,confidencialidad,firma,onboarding', vistas: 0, creado_en: new Date().toISOString() }
  ],
  nextAreaId: 7,
  nextProblemaId: 7
};

function load() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    return JSON.parse(JSON.stringify(defaultData));
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function save(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
