import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Stripe requires the raw body — disable body parsing
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Retrieve full subscription to get period end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await updateSubscription(supabase, customerId, {
          status: subscription.status === 'trialing' ? 'active' : subscription.status,
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const isActive = ['active', 'trialing'].includes(subscription.status);
        await updateSubscription(supabase, customerId, {
          status: isActive ? 'active' : subscription.status,
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await updateSubscription(supabase, subscription.customer, {
          status: 'inactive',
          subscription_end: new Date(subscription.ended_at * 1000).toISOString(),
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await updateSubscription(supabase, invoice.customer, {
          status: 'inactive',
        });
        break;
      }

      default:
        // Unhandled event type — log and ignore
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function updateSubscription(supabase, stripeCustomerId, data) {
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: data.status,
      ...(data.subscription_end && { subscription_end: data.subscription_end }),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', stripeCustomerId);

  if (error) console.error('Failed to update profile subscription:', error);
}
