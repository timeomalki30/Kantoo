import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe/helpers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { priceId } = await request.json() as { priceId: string }
    const origin = new URL(request.url).origin

    const session = await createCheckoutSession({
      priceId,
      userId: user.id,
      userEmail: user.email!,
      successUrl: `${origin}/dashboard?payment=success`,
      cancelUrl: `${origin}/dashboard?payment=canceled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
