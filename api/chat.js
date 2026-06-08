export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { pregunta } = req.body;

  try {
    // Usaremos 'gemini-pro', que es la versión universal y más estable
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

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

    // Verificamos si hubo un error de Google
    if (data.error) {
      console.error(data.error);
      return res.status(500).json({ respuesta: `Error de la IA: ${data.error.message}` });
    }

    // Extraemos el texto de la respuesta de Gemini
    const textoFinal = data.candidates[0].content.parts[0].text;

    // Enviamos la respuesta real a tu página web
    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ respuesta: "Hubo un problema de red al intentar contactar a la IA." });
  }
}
