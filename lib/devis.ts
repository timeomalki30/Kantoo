import type { Prestation, TotauxDevis, TVARate } from '@/types/devis'

export function calculerTotaux(prestations: Prestation[]): TotauxDevis {
  const tvaMap = new Map<TVARate, { base: number; montant: number }>()

  let totalHT = 0

  for (const p of prestations) {
    const ht = p.quantite * p.prixHT
    const tvaAmount = ht * (p.tva / 100)
    totalHT += ht

    const existing = tvaMap.get(p.tva) ?? { base: 0, montant: 0 }
    tvaMap.set(p.tva, {
      base:    existing.base + ht,
      montant: existing.montant + tvaAmount,
    })
  }

  const tvaDetails = Array.from(tvaMap.entries())
    .filter(([, v]) => v.base > 0)
    .map(([taux, v]) => ({ taux, ...v }))
    .sort((a, b) => a.taux - b.taux)

  const totalTVA = tvaDetails.reduce((s, t) => s + t.montant, 0)

  return { totalHT, totalTVA, totalTTC: totalHT + totalTVA, tvaDetails }
}

export function genererNumeroDevis(index: number): string {
  const year = new Date().getFullYear()
  return `DEV-${year}-${String(index).padStart(3, '0')}`
}

export function dateAujourdhui(): string {
  return new Date().toISOString().split('T')[0]
}

export function dateValidite(jours: number): string {
  const d = new Date()
  d.setDate(d.getDate() + jours)
  return d.toISOString().split('T')[0]
}

export function formatEuros(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

export function genererNumeroFacture(index: number): string {
  const year = new Date().getFullYear()
  return `FAC-${year}-${String(index).padStart(3, '0')}`
}
