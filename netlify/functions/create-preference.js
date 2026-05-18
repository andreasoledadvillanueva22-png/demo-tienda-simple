const { MercadoPagoConfig, Preference } = require('mercadopago');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error('❌ ACCESS_TOKEN no configurada');
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurada');
    }

    console.log('✅ Token encontrada, creando cliente...');
    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const preference = new Preference(client);

    const { items, customer } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No hay items en el carrito' })
      };
    }

    console.log('📦 Creando preferencia con items:', items);

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

    console.log('🚀 Enviando a Mercado Pago...');
    const response = await preference.create({ body: preferenceBody });

    console.log('✅ Preferencia creada:', response.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        init_point: response.init_point,
        id: response.id
      })
    };

  } catch (error) {
    console.error('❌ Error en create-preference:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error al crear el pago',
        message: error.message 
      })
    };
  }
};