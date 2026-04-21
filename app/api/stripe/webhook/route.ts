import { NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe/helpers'
import { createClient } from '@/lib/supabase/server'
import { sendPaymentConfirmationEmail } from '@/lib/resend/emails'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId

      if (userId && session.subscription) {
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id:     session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status:    'active',
            updated_at:             new Date().toISOString(),
          })
          .eq('id', userId)

        if (session.customer_email) {
          await sendPaymentConfirmationEmail({
            to:     session.customer_email,
            name:   session.customer_details?.name ?? 'Client',
            amount: session.amount_total ?? 0,
          })
        }
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            updated_at:          new Date().toISOString(),
          })
          .eq('id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
