import type { Metadata } from 'next'
import { NouvelleFactureForm } from '@/components/factures/NouvelleFactureForm'

export const metadata: Metadata = { title: 'Nouvelle facture' }

export default function NouvelleFacturePage() {
  return <NouvelleFactureForm />
}
