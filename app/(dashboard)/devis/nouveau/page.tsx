import type { Metadata } from 'next'
import { NouveauDevisForm } from '@/components/devis/NouveauDevisForm'

export const metadata: Metadata = { title: 'Nouveau devis' }

export default function NouveauDevisPage() {
  return <NouveauDevisForm />
}
