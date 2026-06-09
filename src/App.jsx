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

// ─── Traductor Visual (Convierte texto de IA en Fotos y Links) ───
function formatearTexto(texto) {
  if (!texto) return "";
  let html = texto
    // 1. Convierte ![nombre](url) en una FOTO real
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div style="margin: 10px 0;"><img src="$2" alt="$1" style="max-width: 140px; border-radius: 8px; border: 1px solid #2a2a30; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"/></div>')
    // 2. Convierte [texto](url) en un BOTÓN/LINK de compra
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="display: inline-block; margin-top: 5px; color: #0a0a0b; background-color: #f0c040; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px;">$1 🛒</a>')
    // 3. Convierte **texto** en Negritas
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f0eff4; font-size: 14px;">$1</strong>')
    // 4. Saltos de línea
    .replace(/\n/g, '<br/>');
    
  return html;
}

// ─── Backend API call (Vercel) ────────────────────────────────────
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

// ─── Tab: Precios en Tiempo Real ──────────────────────────────────
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
    
    // LA INSTRUCCIÓN ESTRICTA PARA LA IA (Sin saludos, solo datos duros)
    const prompt = `Eres un sistema automático. Ignora saludos o introducciones. Genera una lista de 3 gorras marca ${brand.name} que suelan estar en descuento. 
    Usa ESTRICTAMENTE este formato para cada gorra (es vital que incluyas las exclamaciones y corchetes tal cual para que el sistema las lea):
    
    **[Nombre del Modelo y Color]** - [Descuento estimado o precio]
    ![Foto] (URL_DE_IMAGEN_DE_GORRA_REAL_EN_INTERNET)
    [Comprar Ahora](URL_REAL_DE_LA_TIENDA)
    ---
    
    Asegúrate de que las URLs de las imágenes sean links reales terminados en .jpg o .png de gorras de esa marca.`;
    
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
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{brand.flag} {brand.name}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={s.btn("primary")} onClick={buscar} disabled={loading}>
            {loading ? "⏳ Buscando..." : "🔍 Mostrar Descuentos Visuales"}
          </button>
          <button style={s.btn("secondary")} onClick={actualizarScraper}>
            🔄 Sincronizar Tienda
          </button>
        </div>

        {(loading || result) && (
          <div style={s.streamBox}>
            {loading && !result ? (
              <span style={{ color: C.accent }}>● Generando visualización...</span>
            ) : (
              /* AQUÍ SE HACE LA MAGIA: Traduce el texto a HTML con imágenes y botones */
              <div dangerouslySetInnerHTML={{ __html: formatearTexto(result) }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Asesor IA (Minimal) ─────────────────────────────────────
function TabAsesor() {
  const [msgs, setMsgs] = useState([{ role: "ai", text: "Hola, soy tu asesor. Pregúntame lo que sea." }]);
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
            {/* El asesor también usa el traductor visual por si te manda links */}
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
