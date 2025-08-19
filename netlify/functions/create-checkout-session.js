// Importamos la herramienta de Stripe y la configuramos con tu clave secreta
// que está guardada de forma segura en Netlify.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Por seguridad, solo permitimos que esta función se llame con el método POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Leemos el ID del precio que nos envía el Script.js desde la página web
    const { priceId } = JSON.parse(event.body);

    // Si por alguna razón no llega el ID del precio, devolvemos un error
    if (!priceId) {
        return { statusCode: 400, body: JSON.stringify({ error: "Falta el ID del precio (priceId)." }) };
    }

    // Detectamos automáticamente si el precio es para una suscripción o un pago único
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.type === 'recurring' ? 'subscription' : 'payment';

    // Creamos la sesión de pago en Stripe con toda la información
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode, // Usamos el modo detectado ('payment' o 'subscription')
      success_url: `${process.env.URL}/pago-exitoso.html`, // Página de éxito
      cancel_url: `${process.env.URL}/`, // Vuelve a la página principal si cancelan
    });

    // Si todo va bien, le devolvemos el ID de la sesión a la página web
    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    // Si algo falla, lo registramos y devolvemos un error
    console.error("Error en la función de Stripe:", error);
    return { 
        statusCode: 500, 
        body: JSON.stringify({ error: error.message }) 
    };
  }
};
