const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Only POST requests are allowed' }),
        };
    }

    let body;

    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid request body' }),
        };
    }

    const cart = Array.isArray(body.cart) ? body.cart : [];

    if (!cart.length) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'El carrito está vacío' }),
        };
    }

    const line_items = cart.map((item) => ({
        price_data: {
            currency: 'pen',
            product_data: {
                name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
    }));

    const baseUrl = process.env.URL || 'http://localhost:8888';

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${baseUrl}/?success=true`,
            cancel_url: `${baseUrl}/?canceled=true`,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url }),
        };
    } catch (error) {
        console.error('Stripe create checkout session error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'No se pudo crear la sesión de pago' }),
        };
    }
};
