import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Stripe non configuré' },
    { status: 503 }
  )
}
