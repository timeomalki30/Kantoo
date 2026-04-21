'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { Client } from '@/types/devis'
import { User, Phone, Mail, MapPin } from 'lucide-react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

interface ClientResult {
  id:        string
  prenom:    string | null
  nom:       string | null
  telephone: string | null
  email:     string | null
  adresse:   string | null
}

interface ClientSectionProps {
  client:   Client
  onChange: (client: Client) => void
  disabled?: boolean
}

export function ClientSection({ client, onChange, disabled = false }: ClientSectionProps) {
  const [suggestions, setSuggestions] = useState<ClientResult[]>([])
  const [showDrop,    setShowDrop]    = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  function set<K extends keyof Client>(key: K, value: Client[K]) {
    if (disabled) return
    onChange({ ...client, [key]: value })
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const searchClients = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setShowDrop(false); return }
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('clients')
      .select('id, prenom, nom, telephone, email, adresse')
      .eq('user_id', user.id)
      .or(`prenom.ilike.%${q}%,nom.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(6)

    if (data && data.length > 0) {
      setSuggestions(data as ClientResult[])
      setShowDrop(true)
    } else {
      setSuggestions([])
      setShowDrop(false)
    }
  }, [])

  function selectClient(c: ClientResult) {
    onChange({
      nom:       [c.prenom, c.nom].filter(Boolean).join(' '),
      telephone: c.telephone ?? '',
      email:     c.email     ?? '',
      adresse:   c.adresse   ?? '',
    })
    setSuggestions([])
    setShowDrop(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client</CardTitle>
        <span className="text-xs text-gray-400">Rechercher ou créer</span>
      </CardHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Nom complet + autocomplete */}
        <div className="relative sm:col-span-2" ref={dropRef}>
          <Input
            label="Nom complet"
            placeholder="Jean Dupont — tapez pour chercher un client existant"
            value={client.nom}
            disabled={disabled}
            onChange={(e) => {
              set('nom', e.target.value)
              searchClients(e.target.value)
            }}
            onFocus={() => { if (suggestions.length > 0) setShowDrop(true) }}
            prefix={<User className="h-4 w-4" />}
            required
          />

          {/* Dropdown suggestions */}
          {showDrop && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-gray-100">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={() => selectClient(c)}
                  className="flex w-full flex-col border-b border-gray-100 px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-orange-50"
                >
                  <span className="text-sm font-semibold text-kantoo-text">
                    {[c.prenom, c.nom].filter(Boolean).join(' ')}
                  </span>
                  {c.email && (
                    <span className="text-xs text-gray-400">{c.email}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Téléphone"
          placeholder="06 12 34 56 78"
          type="tel"
          value={client.telephone}
          disabled={disabled}
          onChange={(e) => set('telephone', e.target.value)}
          prefix={<Phone className="h-4 w-4" />}
        />
        <Input
          label="Email"
          placeholder="client@exemple.fr"
          type="email"
          value={client.email}
          disabled={disabled}
          onChange={(e) => set('email', e.target.value)}
          prefix={<Mail className="h-4 w-4" />}
        />
        <div className="sm:col-span-2">
          <Input
            label="Adresse"
            placeholder="12 rue des Artisans, 75011 Paris"
            value={client.adresse}
            disabled={disabled}
            onChange={(e) => set('adresse', e.target.value)}
            prefix={<MapPin className="h-4 w-4" />}
          />
        </div>
      </div>
    </Card>
  )
}
