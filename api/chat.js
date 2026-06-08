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

  // Función interna para llamar a la IA
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
    // Aquí está la magia: Nuestra lista de 3 modelos en orden de prioridad
    const modelosDeRespaldo = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    let data = null;

    // El servidor intentará con cada modelo de la lista
    for (const modelo of modelosDeRespaldo) {
      data = await llamarGoogle(modelo);

      // Si la IA responde bien, O si el error NO es por "alta demanda", detenemos el ciclo
      if (!data.error || !data.error.message.includes("high demand")) {
        break;
      }
      
      // Si está saturado, Vercel registrará esto y pasará al siguiente modelo en milisegundos
      console.log(`Modelo ${modelo} saturado. Pasando al siguiente respaldo...`);
    }

    // Si después de agotar los 3 intentos seguimos teniendo error, avisamos al usuario
    if (data.error) {
      console.error(data.error);
      return res.status(500).json({ 
        respuesta: "Todos nuestros servidores de Inteligencia Artificial están a máxima capacidad en este instante. ¡Por favor, intenta tu pregunta de nuevo en unos segundos!" 
      });
    }

    // Extraemos la respuesta final del modelo que haya funcionado y la enviamos
    const textoFinal = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ respuesta: "Hubo un problema de red al intentar contactar a la IA." });
  }
}
