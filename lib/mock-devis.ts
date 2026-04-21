import { calculerTotaux } from './devis'
import type { DevisForm } from '@/types/devis'

export const MOCK_FORM: DevisForm = {
  numero:        'DEV-2026-004',
  titre:         'Rénovation cuisine complète',
  date:          '2026-04-19',
  validiteJours: 30,
  messageClient:
    "Ce devis comprend la fourniture de tous les matériaux et la main-d'œuvre. " +
    "Les travaux débuteront dans un délai de 2 semaines après validation. " +
    "Un acompte de 30 % sera demandé au démarrage.",
  client: {
    nom:       'Jean Dupont',
    telephone: '06 12 34 56 78',
    email:     'jean.dupont@exemple.fr',
    adresse:   '25 avenue Victor Hugo, 75016 Paris',
  },
  prestations: [
    {
      id:          '1',
      description: 'Dépose et évacuation ancienne cuisine',
      quantite:    1,
      unite:       'forfait',
      prixHT:      450,
      tva:         10,
    },
    {
      id:          '2',
      description: 'Fourniture et pose meubles bas',
      quantite:    3.6,
      unite:       'm²',
      prixHT:      320,
      tva:         10,
    },
    {
      id:          '3',
      description: 'Fourniture et pose meubles hauts',
      quantite:    2.4,
      unite:       'm²',
      prixHT:      280,
      tva:         10,
    },
    {
      id:          '4',
      description: 'Plan de travail stratifié',
      quantite:    3.2,
      unite:       'm',
      prixHT:      185,
      tva:         10,
    },
    {
      id:          '5',
      description: 'Carrelage sol (fourniture + pose)',
      quantite:    12,
      unite:       'm²',
      prixHT:      65,
      tva:         10,
    },
    {
      id:          '6',
      description: 'Peinture murs',
      quantite:    28,
      unite:       'm²',
      prixHT:      18,
      tva:         20,
    },
  ],
}

export const MOCK_ARTISAN = {
  name:    'Timéo Dev',
  email:   'dev@kantoo.fr',
  phone:   '06 00 00 00 00',
  address: '12 rue des Artisans, 75011 Paris',
  siret:   '123 456 789 00012',
}

export const MOCK_TOTAUX = calculerTotaux(MOCK_FORM.prestations)
