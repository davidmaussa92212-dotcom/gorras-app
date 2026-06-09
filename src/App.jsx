import { useState } from "react";

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
  red: "#ef4444",
  blue: "#60a5fa",
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

// ─── Traductor Visual ─────────────────────────────────────────────
function formatearTexto(texto) {
  if (!texto) return "";
  let html = texto
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div style="margin: 10px 0;"><img src="$2" alt="$1" style="max-width: 140px; border-radius: 8px; border: 1px solid #2a2a30; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"/></div>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="display: inline-block; margin-top: 5px; color: #0a0a0b; background-color: #f0c040; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px;">$1 🛒</a>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f0eff4; font-size: 14px;">$1</strong>')
    .replace(/\n/g, '<br/>');
  return html;
}

// ─── Backend API call ─────────────────────────────────────────────
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
    const errText = "Hubo un error al conectar con tu servidor en Vercel.";
    onChunk(errText);
    return errText;
  }
}

// ─── Shared styles ────────────────────────────────────────────────
const s = {
  app: { minHeight: "100vh", background: C.bg, color: C.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif", padding: "0" },
  header: { padding: "24px 20px 0", borderBottom: `1px solid ${C.border}`, background: C.surface, position: "sticky", top: 0, zIndex: 50 },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  logoIcon: { width: 34, height: 34, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  logoText: { fontSize: 17, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.3px" },
  logoSub: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
  nav: { display: "flex", gap: 0, overflowX: "auto" },
  navBtn: (active) => ({ padding: "10px 16px", fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer", color: active ? C.accentText : C.textSecondary, borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent", whiteSpace: "nowrap", transition: "color .15s" }),
  main: { padding: "20px 16px", maxWidth: 800, margin: "0 auto" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px", marginBottom: 12 },
  btn: (variant = "primary") => ({ padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: variant === "primary" ? C.accent : C.border, color: variant === "primary" ? "#0a0a0b" : C.textPrimary }),
  input: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.textPrimary, outline: "none", width: "100%" },
  label: { fontSize: 11, color: C.textSecondary, marginBottom: 4, display: "block", textTransform: "uppercase" },
  statCard: (color) => ({ flex: "1 1 120px", background: color + "12", border: `1px solid ${color}30`, borderRadius: 10, padding: "12px 14px" }),
  statLabel: { fontSize: 10, color: C.textSecondary, textTransform: "uppercase" },
  statVal: (color) => ({ fontSize: 20, fontWeight: 700, color, marginTop: 4 }),
  streamBox: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, fontSize: 13, color: C.textSecondary, lineHeight: 1.7, minHeight: 80, marginTop: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 600, color: C.textTertiary, textTransform: "uppercase", marginBottom: 12 },
  chip: (color, active) => ({ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${active ? color : C.border}`, background: active ? color + "22" : "transparent", color: active ? color : C.textSecondary }),
};

// ─── Tab 1: Precios ───────────────────────────────────────────────
function TabPrecios() {
  const [selected, setSelected] = useState("newera");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const brand = BRANDS.find(b => b.id === selected);

  async function actualizarScraper() {
    alert("Función en construcción: Aquí conectaremos el Scraper para bajar las fotos de hoy.");
  }

  async function buscar() {
    setLoading(true);
    setResult("");
    
    const prompt = `Eres un sistema automático. Ignora saludos. Genera una lista de 3 gorras marca ${brand.name} que suelan estar en descuento. 
    Usa ESTRICTAMENTE este formato para cada gorra:
    
    **[Nombre del Modelo y Color]** - [Descuento estimado o precio]
    ![Foto] (URL_DE_IMAGEN_DE_GORRA_REAL_EN_INTERNET)
    [Comprar Ahora](URL_REAL_DE_LA_TIENDA)
    ---
    Asegúrate de que las URLs de las imágenes terminen en .jpg o .png de gorras de esa marca.`;
    
    await preguntarAlBackend(prompt, (txt) => setResult(txt));
    setLoading(false);
  }

  return (
    <div>
      <div style={s.card}>
        <p style={s.sectionTitle}>Selecciona la marca</p>
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
          <div style={{ fontSize: 15, fontWeight: 600 }}>{brand.flag} {brand.name}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={s.btn("primary")} onClick={buscar} disabled={loading}>
            {loading ? "⏳ Buscando..." : "🔍 Mostrar Descuentos Visuales"}
          </button>
          <button style={s.btn("secondary")} onClick={actualizarScraper}>🔄 Sincronizar Tienda</button>
        </div>
        {(loading || result) && (
          <div style={s.streamBox}>
            {loading && !result ? <span style={{ color: C.accent }}>● Generando visualización...</span> : <div dangerouslySetInnerHTML={{ __html: formatearTexto(result) }} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 2: Calculadora de Margen ─────────────────────────────────
function TabCalculadora() {
  const [compra, setCompra] = useState("");
  const [envio, setEnvio] = useState("");
  const [venta, setVenta] = useState("");

  const numCompra = parseFloat(compra) || 0;
  const numEnvio = parseFloat(envio) || 0;
  const numVenta = parseFloat(venta) || 0;

  const costoTotal = numCompra + numEnvio;
  const ganancia = numVenta - costoTotal;
  const margen = numVenta > 0 ? ((ganancia / numVenta) * 100).toFixed(1) : 0;

  return (
    <div style={s.card}>
      <p style={s.sectionTitle}>Calculadora de Rentabilidad (COP / USD)</p>
      
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 150px" }}>
          <label style={s.label}>Precio de Compra</label>
          <input type="number" style={s.input} value={compra} onChange={e => setCompra(e.target.value)} placeholder="Ej: 80000" />
        </div>
        <div style={{ flex: "1 1 150px" }}>
          <label style={s.label}>Costo Casillero / Envío</label>
          <input type="number" style={s.input} value={envio} onChange={e => setEnvio(e.target.value)} placeholder="Ej: 20000" />
        </div>
        <div style={{ flex: "1 1 150px" }}>
          <label style={s.label}>Precio Venta Público</label>
          <input type="number" style={s.input} value={venta} onChange={e => setVenta(e.target.value)} placeholder="Ej: 150000" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={s.statCard(C.textSecondary)}>
          <div style={s.statLabel}>Costo Total</div>
          <div style={s.statVal(C.textPrimary)}>${costoTotal.toLocaleString()}</div>
        </div>
        <div style={s.statCard(ganancia >= 0 ? C.green : C.red)}>
          <div style={s.statLabel}>Ganancia Neta</div>
          <div style={s.statVal(ganancia >= 0 ? C.green : C.red)}>${ganancia.toLocaleString()}</div>
        </div>
        <div style={s.statCard(C.accent)}>
          <div style={s.statLabel}>Margen</div>
          <div style={s.statVal(C.accent)}>{margen}%</div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Inventario ────────────────────────────────────────────
function TabInventario() {
  const [inventario, setInventario] = useState([
    { id: 1, modelo: "New Era NY Yankees Negra 59FIFTY", cant: 3, estado: "En Medellín" },
    { id: 2, modelo: "Hugo Boss Curved Cap Azul", cant: 2, estado: "En Tránsito (Casillero)" }
  ]);
  const [nuevoModelo, setNuevoModelo] = useState("");
  const [nuevaCant, setNuevaCant] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("En Medellín");

  function agregarItem() {
    if (!nuevoModelo) return;
    setInventario([...inventario, { id: Date.now(), modelo: nuevoModelo, cant: nuevaCant || 1, estado: nuevoEstado }]);
    setNuevoModelo("");
    setNuevaCant("");
  }

  function eliminarItem(id) {
    setInventario(inventario.filter(item => item.id !== id));
  }

  return (
    <div style={s.card}>
      <p style={s.sectionTitle}>Gestor de Stock</p>
      
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "2 1 200px" }}>
          <label style={s.label}>Modelo de Gorra</label>
          <input style={s.input} value={nuevoModelo} onChange={e => setNuevoModelo(e.target.value)} placeholder="Ej: New Era Dodgers" />
        </div>
        <div style={{ flex: "1 1 80px" }}>
          <label style={s.label}>Cant.</label>
          <input type="number" style={s.input} value={nuevaCant} onChange={e => setNuevaCant(e.target.value)} placeholder="1" />
        </div>
        <div style={{ flex: "1 1 120px" }}>
          <label style={s.label}>Ubicación</label>
          <select style={{...s.input, cursor: "pointer"}} value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
            <option>En Medellín</option>
            <option>En Tránsito (Casillero)</option>
          </select>
        </div>
        <button style={s.btn("primary")} onClick={agregarItem}>Agregar</button>
      </div>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        {inventario.map((item, i) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i === inventario.length - 1 ? "none" : `1px solid ${C.border}`, background: C.surface }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.modelo}</div>
              <div style={{ fontSize: 12, color: item.estado.includes("Tránsito") ? C.accent : C.green, marginTop: 4 }}>
                {item.estado.includes("Tránsito") ? "✈️" : "✅"} {item.estado}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>x{item.cant}</div>
              <button onClick={() => eliminarItem(item.id)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>🗑</button>
            </div>
          </div>
        ))}
        {inventario.length === 0 && (
          <div style={{ padding: "20px", textAlign: "center", color: C.textSecondary, fontSize: 13 }}>No hay gorras en el inventario.</div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 4: Asesor IA ─────────────────────────────────────────────
function TabAsesor() {
  const [msgs, setMsgs] = useState([{ role: "ai", text: "Hola, soy tu asesor. Pregúntame lo que sea sobre los descuentos o tu negocio." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function enviar() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    await preguntarAlBackend(userMsg, (txt) => {
      setMsgs(m => [...m.slice(0, -1), { role: "user", text: userMsg }, { role: "ai", text: txt }]);
    });
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", background: m.role === "user" ? C.accent : C.card, color: m.role === "user" ? "#0a0a0b" : C.textPrimary, padding: "10px 14px", borderRadius: "8px", fontSize: 13 }}>
            <div dangerouslySetInnerHTML={{ __html: formatearTexto(m.text) }} />
          </div>
        ))}
        {loading && <div style={{ color: C.accent, fontSize: 13 }}>● Pensando...</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input style={s.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && enviar()} placeholder="Escribe tu pregunta..." />
        <button style={s.btn("primary")} onClick={enviar}>Enviar</button>
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
            <button key={t.id} style={s.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={s.main}><Comp /></div>
    </div>
  );
}
