export default function handler(req, res) {
  if (req.method === 'POST') {
    // Aquí irá el código que busca ofertas en Lids, New Era, etc.
    return res.status(200).json({ 
      mensaje: 'Búsqueda de descuentos iniciada correctamente desde Vercel.' 
    });
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
}
