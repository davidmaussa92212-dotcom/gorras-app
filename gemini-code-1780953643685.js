export default function handler(req, res) {
  // Solo permitimos que el frontend envíe datos (POST)
  if (req.method === 'POST') {
    const { pregunta } = req.body;
    
    // Aquí es donde en el futuro pegaremos el código de tu IA (Claude, OpenAI, etc.)
    const respuestaSimulada = `¡Hola! Recibí tu mensaje: "${pregunta}". Tu backend en Vercel está funcionando a la perfección.`;

    // Devolvemos la respuesta al frontend
    return res.status(200).json({ respuesta: respuestaSimulada });
  } else {
    // Si alguien intenta acceder de otra forma, le da error
    return res.status(405).json({ error: 'Método no permitido' });
  }
}