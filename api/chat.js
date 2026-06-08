export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 1. Verificamos que Vercel sí esté leyendo tu clave
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      respuesta: "Error: Vercel no está leyendo la clave GEMINI_API_KEY. Asegúrate de haberla guardado en las Environment Variables de Vercel y hacer un Redeploy." 
    });
  }

  const { pregunta } = req.body;

  try {
    // 2. Usamos la versión oficial (v1) y el modelo más rápido y actual (gemini-1.5-flash)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const respuestaIA = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: pregunta }]
        }]
      }),
    });

    const data = await respuestaIA.json();

    // 3. Capturamos cualquier error específico que envíe Google
    if (data.error) {
      console.error(data.error);
      return res.status(500).json({ respuesta: `Error de Google: ${data.error.message}` });
    }

    // 4. Extraemos y enviamos la respuesta real
    const textoFinal = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ respuesta: "Hubo un problema de red al intentar contactar a la IA de Google." });
  }
}
