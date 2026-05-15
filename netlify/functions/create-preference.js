// ✅ Código corregido para Mercado Pago SDK v2.x
const { MercadoPagoConfig, Preference } = require('mercadopago');

exports.handler = async (event, context) => {
  // Solo permitir método POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Obtener token de variable de entorno
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurada');
    }

    // ✅ Configurar cliente con la sintaxis correcta para SDK v2
    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const preference = new Preference(client);

    // Parsear datos del request
    const { items, customer } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No hay items en el carrito' })
      };
    }

    // Crear cuerpo de la preferencia
    const preferenceBody = {
      items: items.map(item => ({
        title: item.name,
        unit_price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        currency_id: 'ARS'
      })),
      payer: {
        name: customer.name,
        email: customer.email || undefined
      },
      back_urls: {
        success: 'https://andreatiendaonline.com/success',
        failure: 'https://andreatiendaonline.com/failure',
        pending: 'https://andreatiendaonline.com/pending'
      },
      auto_return: 'approved'
    };

    // ✅ Crear preferencia con la sintaxis correcta
    const response = await preference.create({ body: preferenceBody });

    return {
      statusCode: 200,
      body: JSON.stringify({
        init_point: response.init_point,
        id: response.id
      })
    };

  } catch (error) {
    console.error('Error creando preferencia:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error al crear el pago',
        message: error.message 
      })
    };
  }
};