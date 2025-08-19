// netlify/functions/create-checkout-session.js

// Importa la librería de Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context) {
    // Solo permite peticiones POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parseamos el body recibido
        const { priceId } = JSON.parse(event.body);

        // Validación básica del priceId
        if (!priceId || typeof priceId !== "string" || !priceId.startsWith("price_")) {
            console.error("❌ priceId inválido o ausente:", priceId);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "El priceId enviado no es válido." }),
            };
        }

        console.log("📦 Price ID recibido:", priceId);

        // Obtenemos info del price desde Stripe para saber si es one-time o recurring
        const price = await stripe.prices.retrieve(priceId);

        if (!price) {
            console.error("❌ Stripe no encontró el price:", priceId);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Stripe no encontró el priceId enviado." }),
            };
        }

        // Decidimos el modo según el tipo de price
        const mode = price.recurring ? "subscription" : "payment";
        console.log(`⚙️ Modo elegido para ${priceId}:`, mode);

        // Define las URLs de redirección
        const baseUrl = process.env.URL || "http://localhost:8888";
        const success_url = `${baseUrl}/pago-exitoso.html`;
        const cancel_url = `${baseUrl}/pago-cancelado.html`;

        console.log("🔗 success_url:", success_url);
        console.log("🔗 cancel_url:", cancel_url);

        // Crea la sesión de Checkout en Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: mode,
            success_url: success_url,
            cancel_url: cancel_url,
        });

        console.log("✅ Sesión creada:", session.id);

        // Devuelve el ID de la sesión al frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ sessionId: session.id }),
        };

    } catch (error) {
        console.error("❌ Error creando la sesión de Stripe:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};