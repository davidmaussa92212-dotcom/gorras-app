export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      respuesta: "Error: Vercel no está leyendo la clave GEMINI_API_KEY." 
    });
  }

  const { pregunta } = req.body;

  try {
    // Intentamos hacer la petición normal
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

    // SI HAY UN ERROR DE GOOGLE, ACTIVAMOS EL DIAGNÓSTICO
    if (data.error) {
      console.error("Error original:", data.error.message);
      
      // Le preguntamos a Google: "¿A qué modelos SÍ tengo acceso?"
      const urlModelos = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const resModelos = await fetch(urlModelos);
      const dataModelos = await resModelos.json();

      let modelosPermitidos = "No se pudo obtener la lista de modelos.";
      
      if (dataModelos && dataModelos.models) {
        // Filtramos solo los modelos que sirven para generar texto
        modelosPermitidos = dataModelos.models
          .filter(m => m.supportedGenerationMethods.includes("generateContent"))
          .map(m => m.name)
          .join(", ");
      }

      // Devolvemos el diagnóstico directamente a tu pantalla
      return res.status(200).json({ 
        respuesta: `🚨 ERROR: ${data.error.message}\n\n🛠️ DIAGNÓSTICO: Tu clave es válida, pero solo te permite usar estos modelos exactamente:\n${modelosPermitidos}\n\nPor favor, revisa esta lista para ver qué nombre debemos usar en el código.` 
      });
    }

    // Si por milagro funciona, extraemos la respuesta
    const textoFinal = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ respuesta: "Hubo un problema de red al intentar contactar a la IA." });
  }
}
