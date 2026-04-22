'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Send, Save, FileText, ChevronLeft, Copy, Check, Mail, X, CheckCircle2 } from 'lucide-react'
import { nanoid } from 'nanoid'

import { Button }                        from '@/components/ui/Button'
import { Card, CardHeader, CardTitle }   from '@/components/ui/Card'
import { Input, Textarea }               from '@/components/ui/Input'
import { Badge }                         from '@/components/ui/Badge'
import { ClientSection }                 from './ClientSection'
import { PrestationRow, PrestationCard } from './PrestationRow'
import { TotauxPanel }                   from './TotauxPanel'
import { MobileDevisWizard }             from './MobileDevisWizard'
import { DevisPreviewModal }             from './DevisPreviewModal'
import { DocumentsAnnexes }             from './DocumentsAnnexes'
import { createClient }                  from '@/lib/supabase/client'

import {
  calculerTotaux, genererNumeroDevis,
  dateAujourdhui, dateValidite,
} from '@/lib/devis'
import type { DevisForm, Prestation, DocumentAnnexe } from '@/types/devis'

// ─── Fallback artisan (while profile loads) ───────────────────────────────────

const FALLBACK_ARTISAN = {
  name:             'Votre nom',
  email:            '',
  phone:            '',
  address:          '',
  siret:            '',
  tva_intracom:     '',
  statut_juridique: '',
}

function prestationVide(): Prestation {
  return {
    id:          nanoid(),
    description: '',
    quantite:    1,
    unite:       'forfait',
    prixHT:      0,
    tva:         10,
  }
}

const INITIAL_STATE: DevisForm = {
  numero:        genererNumeroDevis(1),
  titre:         '',
  date:          dateAujourdhui(),
  validiteJours: 30,
  messageClient: '',
  client:        { nom: '', telephone: '', email: '', adresse: '' },
  prestations:   [prestationVide()],
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function NouveauDevisForm() {
  const router = useRouter()
  const [form, setForm]               = useState<DevisForm>(INITIAL_STATE)
  const [saving, setSaving]           = useState(false)
  const [sending, setSending]         = useState(false)
  const [saved, setSaved]             = useState(false)
  const [previewOpen, setPreview]     = useState(false)
  const [devisDbId, setDevisDbId]     = useState<string | null>(null)
  const [artisan, setArtisan]         = useState(FALLBACK_ARTISAN)
  const [sentResult, setSentResult]   = useState<{ token: string; numero: string } | null>(null)
  const [copiedLink, setCopiedLink]   = useState(false)
  const [tvaNonApplicable, setTvaNonApplicable] = useState(false)
  const [sendError, setSendError]     = useState('')
  const [documents, setDocuments]     = useState<DocumentAnnexe[]>([])

  const totaux = useMemo(() => calculerTotaux(form.prestations), [form.prestations])

  // ─── Load user profile + devis count on mount ────────────────────────────

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile for artisan info + devis count for numero
      const [profileRes, countRes] = await Promise.all([
        supabase.from('profiles').select('prenom,nom,email,telephone,adresse,siret,tva,statut_juridique,message_remerciement,tva_non_applicable').eq('id', user.id).single(),
        supabase.from('devis').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      if (profileRes.data) {
        const p = profileRes.data as typeof profileRes.data & {
          siret?: string | null
          tva?: string | null
          statut_juridique?: string | null
          tva_non_applicable?: boolean | null
        }
        const fullName = [p.prenom, p.nom].filter(Boolean).join(' ') || user.email || 'Artisan'
        setArtisan({
          name:             fullName,
          email:            p.email            ?? user.email ?? '',
          phone:            p.telephone        ?? '',
          address:          p.adresse          ?? '',
          siret:            p.siret            ?? '',
          tva_intracom:     p.tva              ?? '',
          statut_juridique: p.statut_juridique ?? '',
        })
        if (p.message_remerciement) {
          setForm((f) => ({ ...f, messageClient: p.message_remerciement ?? '' }))
        }
        setTvaNonApplicable(!!p.tva_non_applicable)
      }

      const count = countRes.count ?? 0
      setForm((f) => ({ ...f, numero: genererNumeroDevis(count + 1) }))
    }

    init()
  }, [])

  // ─── State helpers ────────────────────────────────────────────────────────

  function setField<K extends keyof DevisForm>(key: K, value: DevisForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const updatePrestation = useCallback((id: string, updated: Prestation) => {
    setForm((f) => ({ ...f, prestations: f.prestations.map((p) => p.id === id ? updated : p) }))
  }, [])

  const removePrestation = useCallback((id: string) => {
    setForm((f) => ({ ...f, prestations: f.prestations.filter((p) => p.id !== id) }))
  }, [])

  function addPrestation() {
    setForm((f) => ({ ...f, prestations: [...f.prestations, prestationVide()] }))
  }

  // ─── Core save logic ──────────────────────────────────────────────────────

  async function persistDevis(statut: 'brouillon' | 'en_attente'): Promise<string | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const t = calculerTotaux(form.prestations)

    // Auto-create or find client by email
    let clientId: string | null = null
    if (form.client.email) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('email', form.client.email)
        .maybeSingle()

      if (existing) {
        clientId = existing.id
      } else if (form.client.nom) {
        const parts  = form.client.nom.trim().split(/\s+/)
        const prenom = parts[0] ?? ''
        const nom    = parts.slice(1).join(' ')
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            user_id:   user.id,
            prenom,
            nom:       nom || null,
            email:     form.client.email,
            telephone: form.client.telephone || null,
            adresse:   form.client.adresse   || null,
          })
          .select('id')
          .single()
        clientId = newClient?.id ?? null
      }
    }

    // Generate a token when first sending
    const token = statut === 'en_attente' ? nanoid(16) : undefined

    const payload = {
      user_id:        user.id,
      client_id:      clientId,
      numero:         form.numero,
      titre:          form.titre   || null,
      statut,
      date_emission:  form.date,
      date_validite:  dateValidite(form.validiteJours),
      prestations:    form.prestations,
      total_ht:       t.totalHT,
      total_tva:      t.totalTVA,
      total_ttc:      t.totalTTC,
      message_client: form.messageClient || null,
      ...(token ? { token } : {}),
    }

    if (devisDbId) {
      await supabase.from('devis').update(payload).eq('id', devisDbId)
      return token ?? null
    } else {
      const { data: inserted } = await supabase
        .from('devis').insert(payload).select('id, token').single()
      if (inserted) setDevisDbId(inserted.id)
      return (inserted?.token as string | null) ?? token ?? null
    }
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    setSaving(true)
    try {
      await persistDevis('brouillon')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  async function handleCopyLink(publicUrl: string) {
    await navigator.clipboard.writeText(publicUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleOpenPreview() {
    if (!form.client.nom) {
      setSendError('Veuillez renseigner le nom du client avant d\'envoyer le devis.')
      return
    }
    setSendError('')
    setPreview(true)
  }

  async function handleSend() {
    setSending(true)
    try {
      const token = await persistDevis('en_attente')
      setPreview(false)
      if (token) {
        setSentResult({ token, numero: form.numero })
      } else {
        router.push('/devis')
      }
    } finally {
      setSending(false)
    }
  }

  const dateExpiration = useMemo(() => dateValidite(form.validiteJours), [form.validiteJours])

  const sharedProps = {
    form, setField, updatePrestation, removePrestation, addPrestation,
    saving, sending, saved,
    onSave: handleSaveDraft,
    onSend: handleOpenPreview,
    onBack: () => router.back(),
  }

  return (
    <>
      {/* ════ MOBILE ════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <MobileDevisWizard {...sharedProps} />
      </div>

      {/* ════ DESKTOP ═══════════════════════════════════════════════════════ */}
      <div className="hidden min-h-screen bg-kantoo-bg lg:block">

        {/* Topbar */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold text-kantoo-text">{form.numero}</span>
                  <Badge status="brouillon" />
                </div>
                <p className="text-xs text-gray-400">Nouveau devis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-xs font-medium text-green-600">✓ Brouillon sauvegardé</span>
              )}
              <Button variant="secondary" size="sm" icon={<Save className="h-4 w-4" />}
                loading={saving} onClick={handleSaveDraft}
              >
                Sauvegarder
              </Button>
              {sendError && (
                <span className="text-xs font-medium text-red-500">{sendError}</span>
              )}
              <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={handleOpenPreview}>
                Envoyer au client
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-[1fr_340px] gap-6">

            <div className="space-y-6">
              {/* Chantier */}
              <Card>
                <CardHeader><CardTitle>Informations du chantier</CardTitle></CardHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input label="Titre du chantier"
                      placeholder="Ex : Rénovation cuisine — 12 rue Voltaire"
                      value={form.titre}
                      onChange={(e) => setField('titre', e.target.value)}
                      required
                    />
                  </div>
                  <Input label="Date du devis" type="date" value={form.date}
                    onChange={(e) => setField('date', e.target.value)}
                  />
                  <Input label="Validité (jours)" type="number" min={1} max={365}
                    value={form.validiteJours}
                    onChange={(e) => setField('validiteJours', parseInt(e.target.value) || 30)}
                    hint={`Expire le ${new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateExpiration))}`}
                  />
                </div>
              </Card>

              {/* Client */}
              <ClientSection client={form.client} onChange={(client) => setField('client', client)} />

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
                          canRemove={form.prestations.length > 1}
                          tvaNonApplicable={tvaNonApplicable}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-gray-100 p-4">
                  <Button type="button" variant="ghost" size="sm"
                    icon={<Plus className="h-4 w-4" />} onClick={addPrestation}
                    className="w-full justify-center text-orange-500 hover:bg-orange-50"
                  >
                    Ajouter une prestation
                  </Button>
                </div>
              </Card>

              {/* Message client */}
              <Card>
                <CardHeader>
                  <CardTitle>Message au client</CardTitle>
                  <span className="text-xs text-gray-400">Optionnel</span>
                </CardHeader>
                <Textarea
                  placeholder="Ex : Ce devis inclut la fourniture de tous les matériaux..."
                  value={form.messageClient}
                  onChange={(e) => setField('messageClient', e.target.value)}
                  className="min-h-[120px]"
                />
              </Card>

              {/* Documents annexes */}
              <DocumentsAnnexes
                documents={documents}
                onChange={setDocuments}
              />
            </div>

            {/* Sidebar */}
            <div>
              <div className="sticky top-20 space-y-4">
                <TotauxPanel totaux={totaux} tvaNonApplicable={tvaNonApplicable} />
                <div className="space-y-2">
                  <Button variant="secondary" size="lg" icon={<Save className="h-5 w-5" />}
                    loading={saving} onClick={handleSaveDraft} className="w-full"
                  >
                    Sauvegarder brouillon
                  </Button>
                  <Button size="lg" icon={<Send className="h-5 w-5" />}
                    onClick={handleOpenPreview} className="w-full"
                  >
                    Envoyer au client
                  </Button>
                </div>
                {saved && (
                  <p className="text-center text-xs font-medium text-green-600">✓ Brouillon sauvegardé</p>
                )}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs leading-relaxed text-gray-400">
                    En envoyant ce devis, votre client recevra un email avec un lien pour l&apos;accepter ou le refuser en ligne.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <DevisPreviewModal
          form={form}
          totaux={totaux}
          artisan={artisan}
          sending={sending}
          onClose={() => setPreview(false)}
          onConfirm={handleSend}
          tvaNonApplicable={tvaNonApplicable}
          documents={documents}
        />
      )}

      {/* ── Sent confirmation modal ──────────────────────────────────── */}
      {sentResult && (() => {
        const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/devis/${sentResult.token}`
        const mailtoHref = `mailto:${form.client.email}?subject=Votre devis ${sentResult.numero}&body=Bonjour ${form.client.nom},%0A%0AVeuillez trouver ci-dessous le lien pour consulter et signer votre devis :%0A%0A${encodeURIComponent(publicUrl)}%0A%0ACordialement`

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
              {/* Icon */}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>

              <h2 className="text-xl font-bold text-kantoo-text">Devis envoyé !</h2>
              <p className="mt-2 text-sm text-gray-500">
                {sentResult.numero} est maintenant en attente de signature.
              </p>

              {/* Public link */}
              <div className="mt-5 rounded-xl bg-gray-50 p-3 text-left">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Lien public du devis
                </p>
                <p className="break-all text-xs font-mono text-gray-600">{publicUrl}</p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => handleCopyLink(publicUrl)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98]"
                >
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedLink ? 'Lien copié !' : 'Copier le lien'}
                </button>

                {form.client.email && (
                  <a
                    href={mailtoHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    Envoyer par email
                  </a>
                )}

                <button
                  onClick={() => router.push('/devis')}
                  className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                  Voir tous mes devis
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
