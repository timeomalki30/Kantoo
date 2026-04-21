'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { Client } from '@/types/devis'
import { User, Phone, Mail, MapPin } from 'lucide-react'

interface ClientSectionProps {
  client: Client
  onChange: (client: Client) => void
}

export function ClientSection({ client, onChange }: ClientSectionProps) {
  function set<K extends keyof Client>(key: K, value: Client[K]) {
    onChange({ ...client, [key]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client</CardTitle>
        <span className="text-xs text-gray-400">Rechercher ou créer</span>
      </CardHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nom complet"
          placeholder="Jean Dupont"
          value={client.nom}
          onChange={(e) => set('nom', e.target.value)}
          prefix={<User className="h-4 w-4" />}
          required
        />
        <Input
          label="Téléphone"
          placeholder="06 12 34 56 78"
          type="tel"
          value={client.telephone}
          onChange={(e) => set('telephone', e.target.value)}
          prefix={<Phone className="h-4 w-4" />}
        />
        <Input
          label="Email"
          placeholder="client@exemple.fr"
          type="email"
          value={client.email}
          onChange={(e) => set('email', e.target.value)}
          prefix={<Mail className="h-4 w-4" />}
        />
        <Input
          label="Adresse"
          placeholder="12 rue des Artisans, 75011 Paris"
          value={client.adresse}
          onChange={(e) => set('adresse', e.target.value)}
          prefix={<MapPin className="h-4 w-4" />}
        />
      </div>
    </Card>
  )
}
