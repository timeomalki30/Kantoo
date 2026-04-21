import { NextResponse }       from 'next/server'
import { createAdminClient }  from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { token, signatureImage } = await request.json() as {
      token: string
      signatureImage: string
    }

    if (!token || !signatureImage) {
      return NextResponse.json({ error: 'token et signatureImage requis' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Vérifier que le devis existe et est en attente
    const { data: devis } = await supabase
      .from('devis')
      .select('id, statut')
      .eq('token', token)
      .single()

    if (!devis) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    if (devis.statut !== 'en_attente') {
      return NextResponse.json({ error: 'Ce devis a déjà été traité' }, { status: 409 })
    }

    const { error } = await supabase
      .from('devis')
      .update({
        signature_image: signatureImage,
        statut:          'accepte',
        signe_le:        new Date().toISOString(),
      })
      .eq('id', devis.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
