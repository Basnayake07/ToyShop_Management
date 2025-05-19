import dotenv from 'dotenv';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;

    // Map items to Stripe's line_items format
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'lkr',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/PaymentSuccessful', 
      cancel_url: 'http://localhost:3000/Checkout', 
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
};