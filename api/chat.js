export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { pregunta } = req.body;

  try {
    // Aquí hacemos la llamada REAL a la IA gratuita de Google (Gemini 1.5 Flash)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

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

    // Verificamos si hubo un error con tu API Key
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
