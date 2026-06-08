export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificamos que la clave exista
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      respuesta: "Error: Vercel no está leyendo la clave GEMINI_API_KEY." 
    });
  }

  const { pregunta } = req.body;

  try {
    // LA COMBINACIÓN EXACTA: v1beta + gemini-1.5-flash
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

    // Capturamos cualquier error de Google
    if (data.error) {
      console.error(data.error);
      return res.status(500).json({ respuesta: `Error de Google: ${data.error.message}` });
    }

    // Extraemos el texto de la respuesta
    const textoFinal = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ respuesta: "Hubo un problema de red al intentar contactar a la IA." });
  }
}
