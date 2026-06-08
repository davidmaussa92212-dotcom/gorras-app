import { useState, useEffect, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────
const C = {
  bg: "#0a0a0b",
  surface: "#111114",
  card: "#16161a",
  border: "#2a2a30",
  borderHover: "#3d3d47",
  accent: "#f0c040",
  accentDim: "#f0c04022",
  accentText: "#f0c040",
  green: "#22c55e",
  greenDim: "#22c55e18",
  red: "#ef4444",
  redDim: "#ef444418",
  blue: "#60a5fa",
  blueDim: "#60a5fa18",
  textPrimary: "#f0eff4",
  textSecondary: "#9191a0",
  textTertiary: "#55555f",
};

const BRANDS = [
  { id: "newera", name: "New Era", flag: "🇺🇸", color: "#60a5fa", site: "neweracap.com", saleUrl: "https://www.neweracap.com/collections/all-sale" },
  { id: "hugoboss", name: "Hugo Boss", flag: "🇩🇪", color: "#f0c040", site: "hugoboss.com", saleUrl: "https://www.hugoboss.com/us/sale-men-caps/" },
  { id: "lids", name: "Lids", flag: "🇺🇸", color: "#f97316", site: "lids.com", saleUrl: "https://www.lids.com/sale" },
  { id: "hatclub", name: "Hat Club", flag: "🇺🇸", color: "#a78bfa", site: "hatclub.com", saleUrl: "https://www.hatclub.com/collections/sale" },
  { id: "zalando", name: "Zalando ES", flag: "🇪🇸", color: "#f472b6", site: "zalando.es", saleUrl: "https://www.zalando.es/gorras-y-sombreros-hombre/" },
];

// ─── Backend API call (Vercel) ────────────────────────────────────
// Esta función reemplaza la llamada directa a Claude y ahora se conecta a tu api/chat.js
async function preguntarAlBackend(prompt, onChunk) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta: prompt }),
    });
    const data = await res.json();
    const text = data.respuesta || "No se recibió respuesta del servidor.";
    onChunk(text);
    return text;
  } catch (error) {
    console.error("Error conectando al backend:", error);
    const errText = "Hubo un error al conectar con tu servidor en Vercel.";
    onChunk(errText);
    return errText;
  }
}

// ─── Shared styles ────────────────────────────────────────────────
const s = {
  app: {
    minHeight: "100vh",
    background: C.bg,
    color: C.textPrimary,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    padding: "0",
  },
  header: {
    padding: "24px 20px 0",
    borderBottom: `1px solid ${C.border}`,
    background: C.surface,
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  logoIcon: {
    width: 34,
    height: 34,
    background: C.accent,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  logoText: {
    fontSize: 17,
    fontWeight: 700,
    color: C.textPrimary,
    letterSpacing: "-0.3px",
  },
  logoSub: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
  nav: { display: "flex", gap: 0, overflowX: "auto" },
  navBtn: (active) => ({
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 500,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: active ? C.accentText : C.textSecondary,
    borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
    whiteSpace: "nowrap",
    transition: "color .15s",
  }),
  main: { padding: "20px 16px", maxWidth: 800, margin: "0 auto" },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "16px",
    marginBottom: 12,
  },
  badge: (color) => ({
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 20,
    background: color + "22",
    color: color,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  }),
  btn: (variant = "primary") => ({
    padding: "10px 18px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: variant === "primary" ? C.accent : C.border,
    color: variant === "primary" ? "#0a0a0b" : C.textPrimary,
    transition: "opacity .15s",
  }),
  input: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: C.textPrimary,
    outline: "none",
    width: "100%",
  },
  label: { fontSize: 11, color: C.textSecondary, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" },
  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" },
  statCard: (color) => ({
    flex: "1 1 120px",
    background: color + "12",
    border: `1px solid ${color}30`,
    borderRadius: 10,
    padding: "12px 14px",
  }),
  statLabel: { fontSize: 10, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em" },
  statVal: (color) => ({ fontSize: 20, fontWeight: 700, color, marginTop: 4 }),
  streamBox: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: 14,
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 1.7,
    minHeight: 80,
    whiteSpace: "pre-wrap",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: C.textTertiary,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 12,
  },
  chip: (color, active) => ({
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    border: `1px solid ${active ? color : C.border}`,
    background: active ? color + "22" : "transparent",
    color: active ? color : C.textSecondary,
    transition: "all .15s",
  }),
};

// ─── Tab: Precios en Tiempo Real ──────────────────────────────────
function TabPrecios() {
  const [selected, setSelected] = useState("newera");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [lastFetch, setLastFetch] = useState(null);

  const brand = BRANDS.find(b => b.id === selected);

  // Nueva función para llamar a api/descuentos.js en Vercel
  async function actualizarScraper() {
    try {
      const respuesta = await fetch('/api/descuentos', { method: 'POST' });
      const datos = await respuesta.json();
      alert(datos.mensaje);
    } catch (error) {
      alert('Error al intentar buscar descuentos en segundo plano.');
    }
  }

  async function buscar() {
    setLoading(true);
    setResult("");
    const prompt = `Busca AHORA en ${brand.saleUrl} y en Google los mejores descuentos actuales de gorras ${brand.name}. 
Necesito:
1. Los 4-6 modelos con mayor descuento (nombre, precio original, precio con descuento, % de ahorro)
2. Tipos de gorras más populares en venta (59FIFTY, 9FIFTY, 9FORTY, etc. según la marca)
3. ¿Hay alguna promoción especial activa hoy?
4. Precio mínimo y máximo actual en el sale

Responde en español, de forma concisa con bullets. Incluye los precios en USD o EUR según corresponda. Fecha de hoy: ${new Date().toLocaleDateString('es-CO')}.`;
    await preguntarAlBackend(prompt, (txt) => setResult(txt));
    setLoading(false);
    setLastFetch(new Date().toLocaleTimeString('es-CO'));
  }

  return (
    <div>
      <div style={{ ...s.card, marginBottom: 16 }}>
        <p style={{ ...s.sectionTitle }}>Selecciona la marca</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {BRANDS.map(b => (
            <button key={b.id} style={s.chip(b.color, selected === b.id)} onClick={() => { setSelected(b.id); setResult(""); }}>
              {b.flag} {b.name}
            </button>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{brand.flag} {brand.name}</div>
            <div style={{ fontSize: 11, color: C.textSecondary }}>{brand.site}</div>
          </div>
          <a href={brand.saleUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: C.blue, textDecoration: "none" }}>
            Ver tienda →
          </a>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={s.btn("primary")} onClick={buscar} disabled={loading}>
            {loading ? "⏳ Buscando en BD..." : "🔍 Buscar descuentos guardados"}
          </button>
          
          <button style={s.btn("secondary")} onClick={actualizarScraper}>
            🔄 Actualizar Scraper Oculto
          </button>
        </div>

        {lastFetch && (
          <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 8 }}>
            Última búsqueda: {lastFetch}
          </div>
        )}

        {(loading || result) && (
          <div style={s.streamBox}>
            {loading && !result ? (
              <span style={{ color: C.accent }}>● Conectando con Vercel...</span>
            ) : result}
          </div>
        )}
      </div>

      <div style={s.card}>
        <p style={s.sectionTitle}>Links directos a sales activos</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "New Era — Todo el sale (hasta 45% off)", url: "https://www.neweracap.com/collections/all-sale" },
            { label: "New Era — 59FIFTY Fitted sale", url: "https://www.neweracap.com/collections/59fifty-sale" },
            { label: "New Era — 9FIFTY Snapback sale", url: "https://www.neweracap.com/collections/9fifty-sale" },
            { label: "New Era — Warehouse outlet", url: "https://warehouse.neweracap.com" },
            { label: "Hugo Boss — Gorras hombre en sale", url: "https://www.hugoboss.com/us/sale-men-caps/" },
            { label: "Hugo Boss — Sale general hasta 40% off", url: "https://www.hugoboss.com/us/sale-men-all-styles/" },
            { label: "Lids — Sale general", url: "https://www.lids.com/sale" },
            { label: "Hat Club — Sale fitted", url: "https://www.hatclub.com/collections/sale" },
          ].map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: C.blue, textDecoration: "none", padding: "8px 12px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Calculadora de Margen ───────────────────────────────────
function TabCalculadora() {
  const [form, setForm] = useState({ usd: 28, trm: 4100, envio: 5, arancel: 15, venta: 170000, unidades: 10 });
  const [aiTip, setAiTip] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const f = (v) => Math.round(v).toLocaleString("es-CO");
  const costoUSD = Number(form.usd) + Number(form.envio);
  const costoCOP = costoUSD * Number(form.trm);
  const arancelCOP = costoCOP * (Number(form.arancel) / 100);
  const total = costoCOP + arancelCOP;
  const ganUnit = Number(form.venta) - total;
  const margen = total > 0 ? (ganUnit / Number(form.venta)) * 100 : 0;
  const roi = total > 0 ? (ganUnit / total) * 100 : 0;
  const ganTotal = ganUnit * Number(form.unidades);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function getTip() {
    setLoadingAi(true);
    setAiTip("");
    const prompt = `Soy un revendedor de gorras originales (New Era, Hugo Boss) en Medellín, Colombia.
Análisis de mi compra:
- Precio de compra: $${form.usd} USD por gorra
- TRM: $${form.trm} COP/USD  
- Costo envío: $${form.envio} USD/gorra
- Arancel: ${form.arancel}%
- Precio venta: $${f(form.venta)} COP
- Margen bruto: ${margen.toFixed(1)}%
- ROI: ${roi.toFixed(1)}%
- Ganancia total (${form.unidades} gorras): $${f(ganTotal)} COP

Dame en 3 bullets cortos: (1) si este margen es bueno o mejorable para este negocio en Colombia, (2) un consejo para mejorar el margen, (3) el precio de venta óptimo sugerido para Medellín. Sé muy directo y concreto.`;
    await preguntarAlBackend(prompt, setAiTip);
    setLoadingAi(false);
  }

  const isGood = margen > 40;

  return (
    <div>
      <div style={s.card}>
        <p style={s.sectionTitle}>Datos de la compra</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { key: "usd", label: "Precio USD (con dcto.)", prefix: "$", suffix: "USD" },
            { key: "trm", label: "TRM hoy (COP/USD)", prefix: "$" },
            { key: "envio", label: "Envío casillero (USD/ud)", prefix: "$", suffix: "USD" },
            { key: "arancel", label: "Arancel estimado", suffix: "%" },
            { key: "venta", label: "Precio venta Medellín", prefix: "$", suffix: "COP" },
            { key: "unidades", label: "Unidades a comprar", suffix: "uds" },
          ].map(({ key, label, suffix }) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <input style={s.input} type="number" value={form[key]} onChange={set(key)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={s.statCard(C.accent)}>
          <div style={s.statLabel}>Costo total/ud</div>
          <div style={s.statVal(C.accent)}>${f(total)}</div>
          <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 2 }}>COP</div>
        </div>
        <div style={s.statCard(isGood ? C.green : C.red)}>
          <div style={s.statLabel}>Margen bruto</div>
          <div style={s.statVal(isGood ? C.green : C.red)}>{margen.toFixed(1)}%</div>
          <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 2 }}>{isGood ? "✓ Bueno" : "Mejorar"}</div>
        </div>
        <div style={s.statCard(C.blue)}>
          <div style={s.statLabel}>ROI</div>
          <div style={s.statVal(C.blue)}>{roi.toFixed(1)}%</div>
        </div>
        <div style={s.statCard(C.green)}>
          <div style={s.statLabel}>Ganancia total</div>
          <div style={s.statVal(C.green)}>${f(ganTotal)}</div>
          <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 2 }}>{form.unidades} gorras</div>
        </div>
      </div>

      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ ...s.sectionTitle, margin: 0 }}>💡 Análisis con IA</p>
          <button style={s.btn("primary")} onClick={getTip} disabled={loadingAi}>
            {loadingAi ? "Analizando..." : "Analizar margen"}
          </button>
        </div>
        {(loadingAi || aiTip) && (
          <div style={s.streamBox}>
            {loadingAi && !aiTip ? <span style={{ color: C.accent }}>● Analizando tu negocio...</span> : aiTip}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Inventario ──────────────────────────────────────────────
function TabInventario() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gorras_inv") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ nombre: "", marca: "New Era", costo: "", precio: "", stock: "" });
  const [aiConsejo, setAiConsejo] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const save = (data) => { setItems(data); localStorage.setItem("gorras_inv", JSON.stringify(data)); };

  function agregar() {
    if (!form.nombre || !form.costo || !form.precio || !form.stock) return;
    save([...items, { ...form, id: Date.now(), vendidas: 0 }]);
    setForm({ nombre: "", marca: "New Era", costo: "", precio: "", stock: "" });
  }

  function vender(id) {
    save(items.map(it => it.id === id && it.stock > it.vendidas
      ? { ...it, vendidas: it.vendidas + 1 } : it));
  }

  function eliminar(id) { save(items.filter(it => it.id !== id)); }

  const f = (v) => Math.round(v).toLocaleString("es-CO");

  const totalInvertido = items.reduce((s, it) => s + it.costo * it.stock, 0);
  const totalVendido = items.reduce((s, it) => s + it.precio * it.vendidas, 0);
  const ganancia = items.reduce((s, it) => s + (it.precio - it.costo) * it.vendidas, 0);

  async function pedirConsejo() {
    if (items.length === 0) return;
    setLoadingAi(true);
    setAiConsejo("");
    const resumen = items.map(it => `${it.nombre} (${it.marca}): stock=${it.stock}, vendidas=${it.vendidas}, costo=$${f(it.costo)}, precio=$${f(it.precio)}`).join("; ");
    const prompt = `Soy revendedor de gorras en Medellín. Mi inventario actual: ${resumen}. Total invertido: $${f(totalInvertido)} COP. Ganancia hasta ahora: $${f(ganancia)} COP. Dame 2 consejos muy concretos sobre qué hacer con este inventario para maximizar mis ganancias esta semana.`;
    await preguntarAlBackend(prompt, setAiConsejo);
    setLoadingAi(false);
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={s.statCard(C.accent)}>
          <div style={s.statLabel}>Invertido</div>
          <div style={s.statVal(C.accent)}>${f(totalInvertido)}</div>
        </div>
        <div style={s.statCard(C.green)}>
          <div style={s.statLabel}>Ganancia</div>
          <div style={s.statVal(C.green)}>${f(ganancia)}</div>
        </div>
        <div style={s.statCard(C.blue)}>
          <div style={s.statLabel}>Vendido</div>
          <div style={s.statVal(C.blue)}>${f(totalVendido)}</div>
        </div>
      </div>

      <div style={s.card}>
        <p style={s.sectionTitle}>Agregar gorra al inventario</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={s.label}>Nombre / modelo</label>
            <input style={s.input} value={form.nombre} onChange={set("nombre")} placeholder="Ej: NY Yankees 59FIFTY azul" />
          </div>
          <div>
            <label style={s.label}>Marca</label>
            <select style={s.input} value={form.marca} onChange={set("marca")}>
              {BRANDS.map(b => <option key={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Costo (COP)</label>
            <input style={s.input} type="number" value={form.costo} onChange={set("costo")} placeholder="120000" />
          </div>
          <div>
            <label style={s.label}>Precio venta (COP)</label>
            <input style={s.input} type="number" value={form.precio} onChange={set("precio")} placeholder="180000" />
          </div>
          <div>
            <label style={s.label}>Unidades</label>
            <input style={s.input} type="number" value={form.stock} onChange={set("stock")} placeholder="10" />
          </div>
        </div>
        <button style={s.btn("primary")} onClick={agregar}>+ Agregar al inventario</button>
      </div>

      {items.length > 0 && (
        <>
          <div style={{ marginBottom: 8 }}>
            {items.map(it => {
              const gan = (it.precio - it.costo) * it.vendidas;
              const restantes = it.stock - it.vendidas;
              return (
                <div key={it.id} style={{ ...s.card, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{it.nombre}</span>
                        <span style={s.badge(BRANDS.find(b => b.name === it.marca)?.color || C.accent)}>{it.marca}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textSecondary }}>
                        Costo: ${f(it.costo)} · Venta: ${f(it.precio)} · Margen: {(((it.precio - it.costo) / it.precio) * 100).toFixed(0)}%
                      </div>
                      <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
                        Vendidas: {it.vendidas}/{it.stock} · Restantes: {restantes} · Ganado: <span style={{ color: C.green }}>${f(gan)}</span>
                      </div>
                      <div style={{ marginTop: 8, height: 4, background: C.border, borderRadius: 2 }}>
                        <div style={{ height: 4, background: C.green, borderRadius: 2, width: `${(it.vendidas / it.stock) * 100}%`, transition: "width .3s" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                      <button style={{ ...s.btn("primary"), padding: "6px 12px", fontSize: 12 }} onClick={() => vender(it.id)} disabled={restantes === 0}>
                        ✓ Venta
                      </button>
                      <button style={{ ...s.btn("secondary"), padding: "6px 10px", fontSize: 12 }} onClick={() => eliminar(it.id)}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ ...s.sectionTitle, margin: 0 }}>💡 Consejo IA para tu inventario</p>
              <button style={s.btn("primary")} onClick={pedirConsejo} disabled={loadingAi}>
                {loadingAi ? "Analizando..." : "Pedir consejo"}
              </button>
            </div>
            {(loadingAi || aiConsejo) && (
              <div style={s.streamBox}>
                {loadingAi && !aiConsejo ? <span style={{ color: C.accent }}>● Analizando tu inventario...</span> : aiConsejo}
              </div>
            )}
          </div>
        </>
      )}

      {items.length === 0 && (
        <div style={{ ...s.card, textAlign: "center", color: C.textTertiary, padding: 40 }}>
          🧢 Agrega tu primera gorra al inventario
        </div>
      )}
    </div>
  );
}

// ─── Tab: Asesor IA ───────────────────────────────────────────────
function TabAsesor() {
  const [msgs, setMsgs] = useState([
    { role: "ai", text: "¡Hola! Soy tu asesor de negocio de gorras. Puedo ayudarte con precios, estrategias, importación desde USA o España, cómo negociar con proveedores, o cualquier duda de tu negocio. ¿Qué necesitas hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function enviar() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    const prompt = `Eres un asesor experto en el negocio de gorras originales (New Era, Hugo Boss, Lids) en Colombia, específicamente en Medellín. El usuario es un emprendedor que quiere ser revendedor y distribuidor mayorista de gorras originales importadas desde USA y España, enfocado en adolescentes. Responde de forma concisa, práctica y en español colombiano. Pregunta: ${userMsg}`;
    await preguntarAlBackend(prompt, (txt) => {
      setMsgs(m => {
        const last = m[m.length - 1];
        if (last?.role === "ai-stream") return [...m.slice(0, -1), { role: "ai-stream", text: txt }];
        return [...m, { role: "ai-stream", text: txt }];
      });
    });
    setMsgs(m => {
      const last = m[m.length - 1];
      return [...m.slice(0, -1), { role: "ai", text: last.text }];
    });
    setLoading(false);
  }

  const SUGERIDAS = ["¿Cuáles gorras se venden más en Medellín?", "¿Cómo negocio con New Era para ser distribuidor?", "¿Cuánto puedo ganar al mes?", "¿Cómo identifico una gorra original?"];

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%",
            background: m.role === "user" ? C.accent : C.card,
            color: m.role === "user" ? "#0a0a0b" : C.textPrimary,
            borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            padding: "10px 14px",
            fontSize: 13,
            lineHeight: 1.6,
            border: `1px solid ${m.role === "user" ? C.accent : C.border}`,
            whiteSpace: "pre-wrap",
          }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", color: C.accent, fontSize: 13, padding: "8px 14px" }}>
            ● Pensando...
          </div>
        )}
      </div>

      {msgs.length === 1 && (
        <div style={{ marginBottom: 12 }}>
          <p style={s.sectionTitle}>Preguntas frecuentes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SUGERIDAS.map((q, i) => (
              <button key={i} style={{ ...s.btn("secondary"), textAlign: "left", fontSize: 12 }}
                onClick={() => { setInput(q); }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, position: "sticky", bottom: 16 }}>
        <input
          style={{ ...s.input, flex: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && enviar()}
          placeholder="Escribe tu pregunta..."
        />
        <button style={s.btn("primary")} onClick={enviar} disabled={loading || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────
const TABS = [
  { id: "precios", label: "🔍 Precios", comp: TabPrecios },
  { id: "calc", label: "📊 Margen", comp: TabCalculadora },
  { id: "inv", label: "📦 Inventario", comp: TabInventario },
  { id: "asesor", label: "🤖 Asesor IA", comp: TabAsesor },
];

export default function App() {
  const [tab, setTab] = useState("precios");
  const Comp = TABS.find(t => t.id === tab)?.comp || TabPrecios;

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🧢</div>
          <div>
            <div style={s.logoText}>CapTracker</div>
            <div style={s.logoSub}>Tu negocio de gorras · Medellín</div>
          </div>
        </div>
        <div style={s.nav}>
          {TABS.map(t => (
            <button key={t.id} style={s.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={s.main}>
        <Comp />
      </div>
    </div>
  );
}
