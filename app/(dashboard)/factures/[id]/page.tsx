import type { Metadata } from 'next'
import { NouvelleFactureForm } from '@/components/factures/NouvelleFactureForm'

export const metadata: Metadata = { title: 'Facture — Kantoo' }

export default function EditFacturePage({ params }: { params: { id: string } }) {
  return <NouvelleFactureForm factureId={params.id} />
}
