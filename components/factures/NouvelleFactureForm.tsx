'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Send, Save, FileCheck, ChevronLeft, AlertCircle, Lock, Paperclip } from 'lucide-react'
import { nanoid } from 'nanoid'

import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ClientSection } from '@/components/devis/ClientSection'
import { PrestationRow, PrestationCard } from '@/components/devis/PrestationRow'
import { TotauxPanel } from '@/components/devis/TotauxPanel'
import { MobileFactureWizard } from './MobileFactureWizard'
import { DevisPreviewModal } from '@/components/devis/DevisPreviewModal'
import { DocumentsAnnexes } from '@/components/devis/DocumentsAnnexes'
import { createClient } from '@/lib/supabase/client'

import {
  calculerTotaux,
  genererNumeroFacture,
  dateAujourdhui,
  dateValidite,
} from '@/lib/devis'
import type { DevisForm, FactureForm, Prestation, ConditionsPaiement, DocumentAnnexe } from '@/types/devis'

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_ARTISAN = {
  name: 'Votre nom', email: '', phone: '', address: '',
  siret: '', tva_intracom: '', statut_juridique: '',
}

// ─── SHA-256 helper (Web Crypto API) ─────────────────────────────────────────

async function sha256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const CONDITIONS_OPTIONS = [
  { value: 'comptant', label: 'Comptant à réception' },
  { value: '30j',      label: '30 jours fin de mois' },
  { value: '45j',      label: '45 jours fin de mois' },
  { value: '60j',      label: '60 jours fin de mois' },
]

const MENTION_LEGALE =
  "En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal " +
  "en vigueur seront appliquées, auxquelles s'ajoutera une indemnité forfaitaire " +
  "de recouvrement de 40 €."

function prestationVide(): Prestation {
  return { id: nanoid(), description: '', quantite: 1, unite: 'forfait', prixHT: 0, tva: 10 }
}

const INITIAL_STATE: FactureForm = {
  numero:             genererNumeroFacture(1),
  titre:              '',
  date:               dateAujourdhui(),
  echeanceDate:       dateValidite(30),
  conditionsPaiement: '30j',
  messageClient:      '',
  client:             { nom: '', telephone: '', email: '', adresse: '' },
  prestations:        [prestationVide()],
}

function toDevisForm(f: FactureForm): DevisForm {
  return { ...f, validiteJours: 0 }
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function NouvelleFactureForm({ factureId }: { factureId?: string }) {
  const router = useRouter()
  const [form, setForm]           = useState<FactureForm>(INITIAL_STATE)
  const [saving, setSaving]       = useState(false)
  const [sending, setSending]     = useState(false)
  const [saved, setSaved]         = useState(false)
  const [previewOpen, setPreview] = useState(false)
  const [factureDbId, setFactureDbId] = useState<string | null>(factureId ?? null)
  const [artisan, setArtisan]     = useState(FALLBACK_ARTISAN)
  const [tvaNonApplicable, setTvaNonApplicable] = useState(false)
  const [isEnvoyee, setIsEnvoyee] = useState(false)
  const [sendError, setSendError] = useState('')
  const [loading, setLoading]     = useState(!!factureId)
  const [documents, setDocuments] = useState<DocumentAnnexe[]>([])

  const totaux    = useMemo(() => calculerTotaux(form.prestations), [form.prestations])
  const devisForm = useMemo(() => toDevisForm(form), [form])

  // ─── Load profile + facture (edit mode) ────────────────────────────────────

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const profilePromise = supabase
        .from('profiles')
        .select('prenom,nom,email,telephone,adresse,siret,tva,statut_juridique,tva_non_applicable')
        .eq('id', user.id)
        .single()

      const countPromise = factureId
        ? supabase.from('factures')
            .select('*, clients(prenom,nom,telephone,email,adresse)')
            .eq('id', factureId)
            .eq('user_id', user.id)
            .single()
        : supabase.from('factures')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

      const [profileRes, dataRes] = await Promise.all([profilePromise, countPromise])

      // Artisan info
      if (profileRes.data) {
        const p = profileRes.data as typeof profileRes.data & {
          tva?: string | null
          statut_juridique?: string | null
          tva_non_applicable?: boolean | null
        }
        const fullName = [p.prenom, p.nom].filter(Boolean).join(' ') || user.email || 'Artisan'
        setArtisan({
          name:              fullName,
          email:             p.email             ?? user.email ?? '',
          phone:             p.telephone         ?? '',
          address:           p.adresse           ?? '',
          siret:             p.siret             ?? '',
          tva_intracom:      p.tva               ?? '',
          statut_juridique:  p.statut_juridique  ?? '',
        })
        setTvaNonApplicable(!!p.tva_non_applicable)
      }

      if (factureId) {
        // Edit mode — load existing facture
        const f = (dataRes as { data: Record<string, unknown> | null }).data
        if (f) {
          setFactureDbId(f.id as string)
          const envoyee = f.statut === 'envoyee'
          setIsEnvoyee(envoyee)

          const clientData = f.clients as { prenom?: string; nom?: string; telephone?: string; email?: string; adresse?: string } | null

          setForm({
            numero:             (f.numero as string) ?? genererNumeroFacture(1),
            titre:              (f.titre as string)  ?? '',
            date:               (f.date_emission as string) ?? dateAujourdhui(),
            echeanceDate:       (f.date_echeance as string) ?? dateValidite(30),
            conditionsPaiement: ((f.conditions_paiement as ConditionsPaiement) ?? '30j'),
            messageClient:      (f.message_client as string) ?? '',
            client: clientData ? {
              nom:       [clientData.prenom, clientData.nom].filter(Boolean).join(' '),
              telephone: clientData.telephone ?? '',
              email:     clientData.email     ?? '',
              adresse:   clientData.adresse   ?? '',
            } : { nom: '', telephone: '', email: '', adresse: '' },
            prestations: (f.prestations as Prestation[]) ?? [prestationVide()],
          })
        }
        setLoading(false)
      } else {
        // New facture — use count for numero
        const count = (dataRes as { count: number | null }).count ?? 0
        setForm((prev) => ({ ...prev, numero: genererNumeroFacture(count + 1) }))
      }
    }
    init()
  }, [factureId])

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function setField<K extends keyof FactureForm>(key: K, value: FactureForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const updatePrestation = useCallback((id: string, updated: Prestation) => {
    setForm((f) => ({ ...f, prestations: f.prestations.map((p) => (p.id === id ? updated : p)) }))
  }, [])

  const removePrestation = useCallback((id: string) => {
    setForm((f) => ({ ...f, prestations: f.prestations.filter((p) => p.id !== id) }))
  }, [])

  function addPrestation() {
    setForm((f) => ({ ...f, prestations: [...f.prestations, prestationVide()] }))
  }

  // ─── Core save logic ──────────────────────────────────────────────────────

  async function persistFacture(statut: 'brouillon' | 'envoyee'): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const t = calculerTotaux(form.prestations)

    // Auto-create or find client
    let clientId: string | null = null
    if (form.client.email) {
      const { data: existing } = await supabase
        .from('clients').select('id')
        .eq('user_id', user.id).eq('email', form.client.email).maybeSingle()

      if (existing) {
        clientId = existing.id
      } else if (form.client.nom) {
        const parts = form.client.nom.trim().split(/\s+/)
        const { data: newClient } = await supabase
          .from('clients').insert({
            user_id: user.id, prenom: parts[0] ?? '', nom: parts.slice(1).join(' ') || null,
            email: form.client.email, telephone: form.client.telephone || null,
            adresse: form.client.adresse || null,
          }).select('id').single()
        clientId = newClient?.id ?? null
      }
    }

    const payload = {
      user_id:             user.id,
      client_id:           clientId,
      numero:              form.numero,
      titre:               form.titre               || null,
      statut,
      date_emission:       form.date,
      date_echeance:       form.echeanceDate,
      conditions_paiement: form.conditionsPaiement,
      prestations:         form.prestations,
      total_ht:            t.totalHT,
      total_tva:           t.totalTVA,
      total_ttc:           t.totalTTC,
      message_client:      form.messageClient        || null,
    }

    if (factureDbId) {
      const { error } = await supabase.from('factures').update(payload).eq('id', factureDbId)
      return !error
    } else {
      // Calcul du hash d'inaltérabilité à la création
      const hashInput = JSON.stringify({
        numero:        form.numero,
        date_emission: form.date,
        client_nom:    form.client.nom,
        client_email:  form.client.email,
        prestations:   form.prestations,
        total_ht:      t.totalHT,
        total_ttc:     t.totalTTC,
      })
      const created_hash = await sha256(hashInput)

      const { data: inserted, error } = await supabase
        .from('factures').insert({ ...payload, created_hash }).select('id').single()
      if (inserted) setFactureDbId(inserted.id)
      return !error
    }
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    setSaving(true)
    try {
      await persistFacture('brouillon')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  function handleOpenPreview() {
    if (!form.client.nom) {
      setSendError('Veuillez renseigner le nom du client avant d\'envoyer.')
      return
    }
    setSendError('')
    setPreview(true)
  }

  async function handleSend() {
    setSending(true)
    try {
      const ok = await persistFacture('envoyee')
      setPreview(false)
      if (ok) router.push('/factures')
    } finally {
      setSending(false)
    }
  }

  // ─── Shared props ─────────────────────────────────────────────────────────

  const sharedProps = {
    form, setField, updatePrestation, removePrestation, addPrestation,
    saving, sending, saved,
    onSave: handleSaveDraft,
    onSend: handleOpenPreview,
    onBack: () => router.back(),
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      {/* ════ MOBILE ════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <MobileFactureWizard {...sharedProps} />
      </div>

      {/* ════ DESKTOP ═══════════════════════════════════════════════════════ */}
      <div className="hidden min-h-screen bg-kantoo-bg lg:block">

        {/* Topbar */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold text-kantoo-text">{form.numero}</span>
                  <Badge status={isEnvoyee ? 'en_attente' : 'brouillon'} />
                  {isEnvoyee && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                </div>
                <p className="text-xs text-gray-400">
                  {factureId ? 'Détail de la facture' : 'Nouvelle facture'}
                </p>
              </div>
            </div>

            {!isEnvoyee && (
              <div className="flex items-center gap-2">
                {sendError && <span className="text-xs font-medium text-red-500">{sendError}</span>}
                {saved && <span className="text-xs font-medium text-green-600">✓ Sauvegardé</span>}
                <Button variant="secondary" size="sm" icon={<Save className="h-4 w-4" />}
                  loading={saving} onClick={handleSaveDraft}>
                  Sauvegarder
                </Button>
                <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={handleOpenPreview}>
                  Envoyer la facture
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Bannière facture envoyée ─────────────────────────────────────── */}
        {isEnvoyee && (
          <div className="border-b border-orange-400 bg-orange-500 px-6 py-3">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <Lock className="h-5 w-5 shrink-0 text-white" />
              <p className="text-sm font-medium text-white">
                Cette facture a été envoyée et ne peut plus être modifiée.
                Créez un avoir si nécessaire.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-[1fr_340px] gap-6">

            {/* ── Main column ─────────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* Informations */}
              <Card>
                <CardHeader><CardTitle>Informations de la facture</CardTitle></CardHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input label="Objet de la facture"
                      placeholder="Ex : Rénovation cuisine — 12 rue Voltaire"
                      value={form.titre} disabled={isEnvoyee}
                      onChange={(e) => setField('titre', e.target.value)} required />
                  </div>
                  <Input label="Date d'émission" type="date" value={form.date} disabled={isEnvoyee}
                    onChange={(e) => setField('date', e.target.value)} />
                  <Input label="Date d'échéance" type="date" value={form.echeanceDate} disabled={isEnvoyee}
                    onChange={(e) => setField('echeanceDate', e.target.value)}
                    hint={`Échéance le ${new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(form.echeanceDate))}`}
                  />
                  <div className="col-span-2">
                    <Select label="Conditions de paiement" options={CONDITIONS_OPTIONS}
                      value={form.conditionsPaiement} disabled={isEnvoyee}
                      onChange={(e) => setField('conditionsPaiement', e.target.value as ConditionsPaiement)}
                    />
                  </div>
                </div>
              </Card>

              {/* Client */}
              <ClientSection
                client={form.client}
                onChange={(client) => setField('client', client)}
                disabled={isEnvoyee}
              />

              {/* Prestations */}
              <Card padding="none">
                <div className="p-6 pb-4">
                  <CardHeader className="mb-0">
                    <CardTitle>Prestations</CardTitle>
                    <span className="text-xs text-gray-400">
                      {form.prestations.length} ligne{form.prestations.length > 1 ? 's' : ''}
                    </span>
                  </CardHeader>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-y border-gray-100 bg-gray-50/60">
                        {['#', 'Description', 'Qté', 'Unité', 'Prix HT', ...(tvaNonApplicable ? [] : ['TVA']), 'Total HT', ''].map((h) => (
                          <th key={h} className="px-2 py-2.5 text-left text-xs font-medium text-gray-400 last:w-10">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.prestations.map((p, i) => (
                        <PrestationRow key={p.id} prestation={p} index={i}
                          onChange={(updated) => updatePrestation(p.id, updated)}
                          onRemove={() => removePrestation(p.id)}
                          canRemove={form.prestations.length > 1 && !isEnvoyee}
                          tvaNonApplicable={tvaNonApplicable}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                {!isEnvoyee && (
                  <div className="border-t border-gray-100 p-4">
                    <Button type="button" variant="ghost" size="sm"
                      icon={<Plus className="h-4 w-4" />} onClick={addPrestation}
                      className="w-full justify-center text-orange-500 hover:bg-orange-50">
                      Ajouter une prestation
                    </Button>
                  </div>
                )}
              </Card>

              {/* Message client */}
              <Card>
                <CardHeader>
                  <CardTitle>Message au client</CardTitle>
                  <span className="text-xs text-gray-400">Optionnel</span>
                </CardHeader>
                <Textarea placeholder="Ex : Merci pour votre confiance…"
                  value={form.messageClient} disabled={isEnvoyee}
                  onChange={(e) => setField('messageClient', e.target.value)}
                  className="min-h-[100px]"
                />
              </Card>

              {/* Mention légale */}
              <Card>
                <CardHeader>
                  <CardTitle>Mention légale</CardTitle>
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" /> Obligatoire
                  </span>
                </CardHeader>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs leading-relaxed text-amber-800">{MENTION_LEGALE}</p>
                </div>
              </Card>

              {/* Documents annexes */}
              <DocumentsAnnexes
                documents={documents}
                onChange={setDocuments}
                disabled={isEnvoyee}
              />
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <div>
              <div className="sticky top-20 space-y-4">
                <TotauxPanel totaux={totaux} tvaNonApplicable={tvaNonApplicable} />

                {!isEnvoyee && (
                  <div className="space-y-2">
                    <Button variant="secondary" size="lg" icon={<Save className="h-5 w-5" />}
                      loading={saving} onClick={handleSaveDraft} className="w-full">
                      Sauvegarder brouillon
                    </Button>
                    <Button size="lg" icon={<Send className="h-5 w-5" />}
                      onClick={handleOpenPreview} className="w-full">
                      Envoyer la facture
                    </Button>
                  </div>
                )}

                {saved && (
                  <p className="text-center text-xs font-medium text-green-600">✓ Brouillon sauvegardé</p>
                )}

                {isEnvoyee && (
                  <div className="rounded-xl bg-orange-50 p-4 text-center">
                    <Lock className="mx-auto mb-2 h-5 w-5 text-orange-400" />
                    <p className="text-xs font-medium text-orange-700">Facture verrouillée</p>
                    <p className="mt-1 text-xs text-orange-500">Envoyée au client — non modifiable</p>
                  </div>
                )}

                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs leading-relaxed text-amber-700">{MENTION_LEGALE}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <DevisPreviewModal
          form={devisForm}
          totaux={totaux}
          artisan={artisan}
          sending={sending}
          onClose={() => setPreview(false)}
          onConfirm={handleSend}
          factureMode
          echeanceDate={form.echeanceDate}
          conditionsPaiement={form.conditionsPaiement}
          tvaNonApplicable={tvaNonApplicable}
          documents={documents}
        />
      )}
    </>
  )
}
