export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      respuesta: "Error: Vercel no está leyendo la clave." 
    });
  }

  const { pregunta } = req.body;

  // Función interna para llamar a la IA según el modelo que le pidamos
  const llamarGoogle = async (nombreModelo) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${nombreModelo}:generateContent?key=${apiKey}`;
    const respuesta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: pregunta }] }] }),
    });
    return await respuesta.json();
  };

  try {
    // 1. Primer intento: El modelo más reciente
    let data = await llamarGoogle('gemini-2.5-flash');

    // 2. Si está saturado (high demand), activamos el Plan B automáticamente
    if (data.error && data.error.message.includes("high demand")) {
      console.log("Modelo 2.5 saturado. Intentando con el modelo 2.0 de respaldo...");
      data = await llamarGoogle('gemini-2.0-flash');
    }

    // Si ambos fallan o hay otro tipo de error
    if (data.error) {
      console.error(data.error);
      return res.status(500).json({ 
        respuesta: "Los servidores gratuitos de Google están al máximo de capacidad en este segundo. ¡Intenta preguntar de nuevo!" 
      });
    }

    // Extraemos la respuesta final y la enviamos
    const textoFinal = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ respuesta: "Hubo un problema de red al intentar contactar a la IA." });
  }
}
