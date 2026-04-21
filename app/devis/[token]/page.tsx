import type { Metadata } from 'next'
import { notFound }          from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { DevisPublicClient } from '@/components/devis/DevisPublicClient'
import type { Prestation }   from '@/types/devis'

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const supabase  = createAdminClient()
  const { data }  = await supabase
    .from('devis')
    .select('numero, titre')
    .eq('token', token)
    .single()

  if (!data) return { title: 'Devis introuvable · Kantoo' }
  return {
    title:       `${data.numero ?? 'Devis'} · Kantoo`,
    description: data.titre ?? 'Consultez et signez votre devis en ligne.',
    robots:      { index: false, follow: false },
  }
}

export default async function DevisTokenPage({ params }: Props) {
  const { token } = await params
  const supabase  = createAdminClient()

  const { data: devis } = await supabase
    .from('devis')
    .select('*')
    .eq('token', token)
    .single()

  if (!devis) notFound()

  const [artisanRes, clientRes] = await Promise.all([
    devis.user_id
      ? supabase.from('profiles').select('prenom, nom, nom_entreprise, email, telephone, adresse, siret').eq('id', devis.user_id).single()
      : Promise.resolve({ data: null }),
    devis.client_id
      ? supabase.from('clients').select('prenom, nom, email, telephone, adresse, nom_entreprise').eq('id', devis.client_id).single()
      : Promise.resolve({ data: null }),
  ])

  return (
    <DevisPublicClient
      token={token}
      devis={{
        id:              devis.id,
        numero:          devis.numero,
        titre:           devis.titre,
        statut:          devis.statut,
        date_emission:   devis.date_emission,
        date_validite:   devis.date_validite,
        message_client:  devis.message_client,
        total_ht:        devis.total_ht,
        total_tva:       devis.total_tva,
        total_ttc:       devis.total_ttc,
        prestations:     (devis.prestations as Prestation[]) ?? [],
        signe_le:        devis.signe_le,
        signature_image: devis.signature_image,
      }}
      artisan={artisanRes.data ?? null}
      client={clientRes.data ?? null}
    />
  )
}
