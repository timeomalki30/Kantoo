export type TVARate = 0 | 10 | 20

export type Unite = 'h' | 'm²' | 'forfait' | 'u' | 'm' | 'm³'

export interface Prestation {
  id: string
  description: string
  quantite: number
  unite: Unite
  prixHT: number
  tva: TVARate
}

export interface Client {
  nom: string
  telephone: string
  email: string
  adresse: string
}

export interface DevisForm {
  numero: string
  titre: string
  date: string
  validiteJours: number
  messageClient: string
  client: Client
  prestations: Prestation[]
}

export interface TotauxDevis {
  totalHT: number
  totalTVA: number
  totalTTC: number
  tvaDetails: { taux: TVARate; base: number; montant: number }[]
}

export type ConditionsPaiement = 'comptant' | '30j' | '45j' | '60j'

export interface FactureForm {
  numero: string
  titre: string
  date: string
  echeanceDate: string
  conditionsPaiement: ConditionsPaiement
  messageClient: string
  client: Client
  prestations: Prestation[]
}
