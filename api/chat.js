export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { pregunta } = req.body;

  try {
    // Aquí hacemos la llamada REAL a la Inteligencia Artificial (Claude)
    const respuestaIA = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY, // Tu clave secreta protegida en Vercel
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", // El modelo más reciente y rápido de Claude
        max_tokens: 1000,
        messages: [{ role: "user", content: pregunta }],
      }),
    });

    const data = await respuestaIA.json();

    // Verificamos si hubo un error con tu API Key
    if (data.error) {
      console.error(data.error);
      return res.status(500).json({ respuesta: `Error de la IA: ${data.error.message}` });
    }

    // Extraemos el texto de la respuesta de Claude
    const textoFinal = data.content[0].text;

    // Enviamos la respuesta real a tu página web
    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ respuesta: "Hubo un problema de red al intentar contactar a la IA." });
  }
}
