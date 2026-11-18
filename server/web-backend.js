'use strict';
/**
 * Backend del sitio de Dushi (capa entre el navegador y VELARIS).
 *
 * - Guarda las credenciales de VELARIS (nunca llegan al navegador).
 * - Mantiene en caché el catálogo y las existencias para no pasar del límite de 120 solicitudes/min.
 * - Expone al sitio una API pequeña: /api/catalogo, /api/stock, /api/reservas, /api/pedidos.
 * - Sirve los archivos estáticos del sitio (index.html, assets/…).
 *
 * Variables de entorno: ver .env.example
 */
const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// Si no vienen variables de entorno, se leen de server/.env (que no se sube al repo).
if (!process.env.VELARIS_URL && fs.existsSync(path.join(__dirname, '.env'))) {
  for (const l of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && m[2] && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const PORT = Number(process.env.PORT || 4000);
const VELARIS_URL = (process.env.VELARIS_URL || 'http://127.0.0.1:4010').replace(/\/$/, '');
const CLIENT_ID = process.env.VELARIS_CLIENT_ID || 'dushi-web-test';
const CLIENT_SECRET = process.env.VELARIS_CLIENT_SECRET || 'secreto-de-prueba-no-usar-en-produccion';
const SIGN = process.env.VELARIS_SIGN === '1';
// Dos formas de hablar con VELARIS:
//  'catalogo'  = la API real (developers.velarisapp.com): solo lectura de productos y categorías.
//  'propuesta' = la API de la propuesta del 31/10 (la que imita velaris-mock.js), con reservas y tickets.
const MODO = process.env.VELARIS_API || (/(^|\.)velarisapp\.com$/i.test(new URL(VELARIS_URL).hostname) ? 'catalogo' : 'propuesta');
const CATALOG_TTL_MS = Number(process.env.CATALOG_TTL_MS || 5 * 60 * 1000);
const STOCK_POLL_MS = Number(process.env.STOCK_POLL_MS || 30 * 1000);
const SITE_ROOT = path.resolve(__dirname, '..');
const META = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-meta.json'), 'utf8'));

/* ================= cliente VELARIS ================= */
let token = null; let tokenExp = 0;
async function obtenerToken(forzar = false) {
  if (!forzar && token && Date.now() < tokenExp - 30000) return token;
  const r = await fetch(VELARIS_URL + (MODO === 'catalogo' ? '/api/oauth/token' : '/api/v1/auth/token'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
  });
  if (!r.ok) throw Object.assign(new Error('No se pudo autenticar con VELARIS'), { status: 502 });
  const j = await r.json();
  token = j.accessToken || j.access_token; tokenExp = Date.now() + (j.expiresIn || j.expires_in) * 1000;
  return token;
}
async function velaris(metodo, ruta, { body, idem, query } = {}, reintento = true) {
  const url = new URL(VELARIS_URL + '/api/v1' + ruta);
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v);
  const raw = body === undefined ? undefined : JSON.stringify(body);
  const headers = { Authorization: 'Bearer ' + (await obtenerToken()) };
  if (raw !== undefined) headers['Content-Type'] = 'application/json';
  if (idem) headers['Idempotency-Key'] = idem;
  if (SIGN && raw) headers['X-Signature'] = crypto.createHmac('sha256', CLIENT_SECRET).update(raw).digest('hex');
  let r;
  try { r = await fetch(url, { method: metodo, headers, body: raw, signal: AbortSignal.timeout(8000) }); }
  catch (e) { throw Object.assign(new Error('VELARIS no responde'), { status: 503, causa: e }); }
  if (r.status === 401 && reintento) { await obtenerToken(true); return velaris(metodo, ruta, { body, idem, query }, false); }
  const txt = await r.text(); let j = null;
  try { j = txt ? JSON.parse(txt) : null; } catch { /* sin JSON */ }
  if (!r.ok) throw Object.assign(new Error(j?.error?.mensaje || j?.error?.message || `VELARIS respondió ${r.status}`), { status: r.status, detalle: j?.error });
  return j;
}

/* ================= caché de catálogo y stock ================= */
const cache = { productos: new Map(), stock: new Map(), catalogoEn: 0, ultimoCambio: null, error: null };

async function cargarCatalogo() {
  const todos = []; let page = 1; let total = Infinity;
  while (todos.length < total) {
    const j = await velaris('GET', '/productos', { query: { page, pageSize: 100 } });
    total = j.total; todos.push(...j.items); page += 1;
    if (!j.items.length) break;
  }
  cache.productos = new Map(todos.map((p) => [p.sku, p]));
  cache.catalogoEn = Date.now();
  await cargarStockCompleto();
}
async function cargarStockCompleto() {
  const skus = [...cache.productos.keys()];
  if (!skus.length) return;
  const desde = new Date().toISOString();
  for (let i = 0; i < skus.length; i += 50) {
    const j = await velaris('GET', '/existencias', { query: { skus: skus.slice(i, i + 50).join(',') } });
    for (const e of j.items) cache.stock.set(e.sku, e);
  }
  cache.ultimoCambio = desde;
}
async function sondearCambios() {
  if (!cache.ultimoCambio) return cargarStockCompleto();
  const j = await velaris('GET', '/existencias/cambios', { query: { desde: cache.ultimoCambio } });
  for (const e of j.items) cache.stock.set(e.sku, e);
  cache.ultimoCambio = j.hasta;
}
async function refrescarSkus(skus) {
  const lista = [...new Set(skus)]; if (!lista.length) return;
  const j = await velaris('GET', '/existencias', { query: { skus: lista.join(',') } });
  for (const e of j.items) cache.stock.set(e.sku, e);
}
/* ----- API real de catálogo ----- */
const PLAN = { PLAYA: 'playa', 'MONTAÑA': 'montana', VIAJE: 'viaje' };
const GENERO = { HOMBRE: 'hombre', MUJER: 'mujer', 'NIÑA': 'ninos', 'NIÑO': 'ninos', FAMILIA: 'familia' };
const urlImagen = (i) => (typeof i === 'string' ? i : i?.url || null);
function normalizar(p) {
  const attr = (v, pref) => v.attributes?.find((a) => a.name.startsWith(pref))?.value || null;
  const variantes = (p.variants || []).map((v) => ({ codigo: v.sku, talla: attr(v, 'TALLA'), color: attr(v, 'COLOR'), genero: attr(v, 'GENERO'), disponible: !!v.available }));
  const generos = [...new Set(variantes.map((v) => GENERO[v.genero]).filter(Boolean))];
  const plan = PLAN[p.category?.code];
  return {
    id: p.id, sku: p.sku, nombre: p.name, marca: p.brand?.name || '', categoria: p.category?.name || '',
    precio: p.price?.amount, precioAnterior: null, disponible: !!p.available, variantes,
    planes: plan ? [plan] : [], generos: generos.length ? generos : ['all'],
    imagen: urlImagen(p.images?.[0]) || urlImagen(p.variants?.find((v) => v.images?.length)?.images[0]),
  };
}
async function paginasCatalogo(query, cadaProducto) {
  let cursor = null; let j;
  do {
    j = await velaris('GET', '/catalog/products', { query: { limit: 500, ...query, ...(cursor ? { cursor } : {}) } });
    j.data.forEach(cadaProducto); cursor = j.nextCursor;
  } while (j.hasMore && cursor);
  return j.serverTime;
}
async function cargarCatalogoReal() {
  const nuevo = new Map();
  cache.ultimoCambio = await paginasCatalogo({}, (p) => { if (p.status === 'active') nuevo.set(p.sku, normalizar(p)); });
  cache.productos = nuevo; cache.catalogoEn = Date.now();
}
async function sondearCambiosReal() {
  // updatedSince trae también lo que se desactivó o borró: eso se quita del sitio.
  cache.ultimoCambio = await paginasCatalogo({ updatedSince: cache.ultimoCambio }, (p) => {
    if (p.status === 'active') cache.productos.set(p.sku, normalizar(p)); else cache.productos.delete(p.sku);
  }) || cache.ultimoCambio;
}
function vistaProductoReal(p) {
  const m = META[p.sku] || {};
  const tallas = [...new Set(p.variantes.map((v) => v.talla).filter((t) => t && !/^(UNI|MULTI)TALLA$/.test(t)))];
  return {
    sku: p.sku, nombre: p.nombre, marca: p.marca, categoria: p.categoria,
    precio: p.precio, precioAnterior: null, descuentoPct: 0,
    disponible: p.disponible, tallas, variantes: p.variantes.map((v) => ({ codigo: v.codigo, talla: v.talla, color: v.color, disponible: v.disponible })),
    imagen: p.imagen || m.imagen || null, bg: m.bg || '#F3E6CF', planes: p.planes, generos: p.generos,
    etiqueta: m.etiqueta || null, etiquetaSol: !!m.etiquetaSol,
  };
}

async function mantener() {
  try {
    if (MODO === 'catalogo') {
      if (!cache.productos.size || Date.now() - cache.catalogoEn > CATALOG_TTL_MS) await cargarCatalogoReal();
      else await sondearCambiosReal();
    } else if (!cache.productos.size || Date.now() - cache.catalogoEn > CATALOG_TTL_MS) await cargarCatalogo();
    else await sondearCambios();
    cache.error = null;
  } catch (e) { cache.error = e.message; console.warn('[backend] caché no actualizada:', e.message); }
}

function vistaProducto(p) {
  if (MODO === 'catalogo') return vistaProductoReal(p);
  const m = META[p.sku] || {};
  const st = cache.stock.get(p.sku);
  const vars = p.variantes.map((v) => ({ codigo: v.codigo, talla: v.talla, color: v.color, disponible: st?.variantes.find((x) => x.codigo === v.codigo)?.disponible ?? 0 }));
  const desc = p.precioAnterior && p.precioAnterior > p.precio ? Math.floor((1 - p.precio / p.precioAnterior) * 100) : 0;
  const tallas = [...new Set(p.variantes.map((v) => v.talla).filter((t) => t && t !== 'Única'))];
  return {
    sku: p.sku, nombre: p.nombre, marca: p.marca, categoria: p.categoria,
    precio: p.precio, precioAnterior: p.precioAnterior, descuentoPct: desc,
    disponible: st ? st.disponible : 0, tallas, variantes: vars,
    imagen: m.imagen || null, bg: m.bg || '#F3E6CF', planes: m.planes || [], generos: m.generos || ['all'],
    etiqueta: desc ? `−${desc}%` : (m.etiqueta || null), etiquetaSol: desc ? true : !!m.etiquetaSol,
  };
}

/* ================= API pública del sitio ================= */
const ventanasIP = new Map();
function limiteIP(ip, max = 60) {
  const t = Date.now(); const a = (ventanasIP.get(ip) || []).filter((x) => t - x < 60000); a.push(t); ventanasIP.set(ip, a);
  return a.length > max;
}
const json = (res, status, body, extra = {}) => {
  const t = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(t), 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(t);
};
async function cuerpo(req) {
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > 50000) throw Object.assign(new Error('Cuerpo muy grande'), { status: 413 }); }
  try { return raw ? JSON.parse(raw) : {}; } catch { throw Object.assign(new Error('JSON inválido'), { status: 400 }); }
}
function erroresVelaris(res, e) {
  if (e.status && e.status < 500 && e.status !== 401 && e.status !== 403) return json(res, e.status === 409 || e.status === 422 || e.status === 404 ? e.status : 400, { error: e.detalle || { mensaje: e.message } });
  console.error('[backend]', e.message);
  return json(res, 502, { error: { codigo: 'INVENTARIO_NO_DISPONIBLE', mensaje: 'No pudimos consultar el inventario. Intenta de nuevo en un momento.' } });
}
const itemsLimpios = (items) => {
  if (!Array.isArray(items) || !items.length || items.length > 30) return null;
  const out = [];
  for (const i of items) {
    const cantidad = Number(i?.cantidad);
    if (typeof i?.sku !== 'string' || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) return null;
    out.push({ sku: i.sku, ...(typeof i.variante === 'string' ? { variante: i.variante } : {}), cantidad });
  }
  return out;
};

/** Pasarela de pago SIMULADA. Se reemplaza por la integración real (p. ej. Banco Agrícola). */
async function cobrar(monto) { return { aprobado: true, tipo: 'tarjeta-simulada', referencia: 'SIM-' + crypto.randomBytes(4).toString('hex').toUpperCase(), monto }; }
let secuencia = 0;

async function api(req, res, url) {
  const ip = req.socket.remoteAddress || '-';
  const p = url.pathname;
  if (req.method === 'GET' && p === '/api/salud') return json(res, 200, { ok: true, velaris: cache.error ? 'con problemas' : 'ok', productos: cache.productos.size, catalogoEn: cache.catalogoEn ? new Date(cache.catalogoEn).toISOString() : null });
  if (req.method === 'GET' && p === '/api/catalogo') {
    if (!cache.productos.size) await mantener();
    if (!cache.productos.size) return json(res, 503, { error: { codigo: 'SIN_CATALOGO', mensaje: 'El catálogo no está disponible por ahora.' } });
    return json(res, 200, { actualizado: new Date(cache.catalogoEn).toISOString(), desactualizado: !!cache.error, productos: [...cache.productos.values()].map(vistaProducto) }, { 'Cache-Control': 'public, max-age=15' });
  }
  if (req.method === 'GET' && p === '/api/stock') {
    const out = {};
    for (const pr of cache.productos.values()) { const v = vistaProducto(pr); out[pr.sku] = { disponible: v.disponible, variantes: Object.fromEntries(v.variantes.map((x) => [x.codigo, x.disponible])) }; }
    return json(res, 200, { actualizado: new Date().toISOString(), stock: out }, { 'Cache-Control': 'no-cache' });
  }
  if (limiteIP(ip)) return json(res, 429, { error: { codigo: 'DEMASIADAS_SOLICITUDES', mensaje: 'Demasiadas solicitudes. Espera un minuto.' } }, { 'Retry-After': '60' });

  // La API real de VELARIS es solo de catálogo: todavía no permite apartar ni vender.
  if (MODO === 'catalogo' && /^\/api\/(reservas|pedidos)(\/|$)/.test(p)) return json(res, 501, { error: { codigo: 'COMPRA_NO_DISPONIBLE', mensaje: 'La compra en línea todavía no está disponible.' } });
  try {
    if (req.method === 'POST' && p === '/api/reservas') {
      const b = await cuerpo(req); const items = itemsLimpios(b.items);
      if (!items) return json(res, 400, { error: { mensaje: 'items inválidos' } });
      const r = await velaris('POST', '/reservas', { body: { items, referencia: 'web' }, idem: crypto.randomUUID() });
      refrescarSkus(items.map((i) => i.sku)).catch(() => {});
      return json(res, 201, { id: r.id, vence: r.vence, items: r.items });
    }
    let m;
    if (req.method === 'DELETE' && (m = p.match(/^\/api\/reservas\/(RES-[A-F0-9]+)$/))) {
      const r = await velaris('DELETE', `/reservas/${m[1]}`, { idem: crypto.randomUUID() });
      refrescarSkus([...cache.productos.keys()]).catch(() => {});
      return json(res, 200, r);
    }
    if (req.method === 'POST' && p === '/api/pedidos') {
      const b = await cuerpo(req); const lineas = itemsLimpios(b.lineas);
      const c = b.cliente || {};
      if (!lineas) return json(res, 400, { error: { mensaje: 'lineas inválidas' } });
      if (typeof c.nombre !== 'string' || !c.nombre.trim() || typeof c.correo !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.correo)) return json(res, 400, { error: { mensaje: 'Nombre y correo válidos son obligatorios.' } });
      // El precio lo manda VELARIS: el navegador nunca decide cuánto cuesta algo.
      const conPrecio = lineas.map((l) => { const pr = cache.productos.get(l.sku); return pr ? { ...l, precioUnitario: pr.precio } : null; });
      if (conPrecio.includes(null)) return json(res, 404, { error: { codigo: 'SKU_NO_EXISTE', mensaje: 'Un producto del carrito ya no existe.' } });
      const total = Math.round(conPrecio.reduce((a, l) => a + l.precioUnitario * l.cantidad, 0) * 100) / 100;
      const pago = await cobrar(total);
      if (!pago.aprobado) return json(res, 402, { error: { codigo: 'PAGO_RECHAZADO', mensaje: 'El pago no fue aprobado.' } });
      const numeroPedido = `WEB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(++secuencia).padStart(4, '0')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const t = await velaris('POST', '/tickets', {
        idem: typeof b.claveOrden === 'string' && b.claveOrden.length >= 8 ? 'orden-' + b.claveOrden : crypto.randomUUID(),
        body: { numeroPedido, reservaId: b.reservaId, cliente: { nombre: c.nombre.trim().slice(0, 120), correo: c.correo.trim().slice(0, 120) }, lineas: conPrecio, formaPago: { tipo: pago.tipo, referencia: pago.referencia } },
      });
      refrescarSkus(lineas.map((l) => l.sku)).catch(() => {});
      return json(res, 201, { numeroPedido: t.numeroPedido, estado: t.estado, total: t.total });
    }
    if (req.method === 'GET' && (m = p.match(/^\/api\/pedidos\/([\w-]+)$/))) {
      const t = await velaris('GET', `/tickets/${encodeURIComponent(m[1])}`);
      return json(res, 200, { numeroPedido: t.numeroPedido, estado: t.estado, total: t.total });
    }
  } catch (e) { return erroresVelaris(res, e); }
  return json(res, 404, { error: { mensaje: 'No existe esa ruta' } });
}

/* ================= archivos estáticos ================= */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function estatico(req, res, url) {
  let rel = decodeURIComponent(url.pathname); if (rel === '/') rel = '/index.html';
  const abs = path.resolve(SITE_ROOT, '.' + rel);
  const dentro = abs.startsWith(SITE_ROOT + path.sep) && !abs.startsWith(path.join(SITE_ROOT, 'server') + path.sep) && !abs.includes(path.sep + '.');
  const ext = path.extname(abs).toLowerCase();
  if (!dentro || !MIME[ext] || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('No encontrado'); }
  const size = fs.statSync(abs).size; const range = req.headers.range;
  if (range && ext === '.mp4') {
    const [a, b] = range.replace(/bytes=/, '').split('-'); const ini = Number(a) || 0; const fin = b ? Number(b) : size - 1;
    res.writeHead(206, { 'Content-Type': MIME[ext], 'Content-Range': `bytes ${ini}-${fin}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': fin - ini + 1 });
    return fs.createReadStream(abs, { start: ini, end: fin }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': MIME[ext], 'Content-Length': size, 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300' });
  fs.createReadStream(abs).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    return estatico(req, res, url);
  } catch (e) {
    console.error('[backend]', e);
    if (!res.headersSent) json(res, e.status || 500, { error: { mensaje: e.status ? e.message : 'Error interno' } });
  }
});

if (require.main === module) {
  server.listen(PORT, '127.0.0.1', async () => {
    console.log(`Sitio Dushi en http://127.0.0.1:${PORT}  ·  VELARIS: ${VELARIS_URL} (${MODO})`);
    await mantener();
    setInterval(mantener, STOCK_POLL_MS).unref();
  });
}
module.exports = { server, mantener, cache };
