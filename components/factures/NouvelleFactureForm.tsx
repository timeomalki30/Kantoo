'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Send, Save, FileCheck, ChevronLeft, AlertCircle } from 'lucide-react'
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

import {
  calculerTotaux,
  genererNumeroFacture,
  dateAujourdhui,
  dateValidite,
} from '@/lib/devis'
import type { DevisForm, FactureForm, Prestation, ConditionsPaiement } from '@/types/devis'

// ─── Constants ────────────────────────────────────────────────────────────────

const DEV_ARTISAN = {
  name:    'Timéo Dev',
  email:   'dev@kantoo.fr',
  phone:   '06 00 00 00 00',
  address: '12 rue des Artisans, 75011 Paris',
}

const MOCK_FACTURE_COUNT = 5

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
  return {
    id:          nanoid(),
    description: '',
    quantite:    1,
    unite:       'forfait',
    prixHT:      0,
    tva:         10,
  }
}

const INITIAL_STATE: FactureForm = {
  numero:             genererNumeroFacture(MOCK_FACTURE_COUNT + 1),
  titre:              '',
  date:               dateAujourdhui(),
  echeanceDate:       dateValidite(30),
  conditionsPaiement: '30j',
  messageClient:      '',
  client:             { nom: '', telephone: '', email: '', adresse: '' },
  prestations:        [prestationVide()],
}

// ─── Adapter — FactureForm → DevisForm (for modal / document) ────────────────

function toDevisForm(f: FactureForm): DevisForm {
  return { ...f, validiteJours: 0 }
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function NouvelleFactureForm() {
  const router = useRouter()
  const [form, setForm]           = useState<FactureForm>(INITIAL_STATE)
  const [saving, setSaving]       = useState(false)
  const [sending, setSending]     = useState(false)
  const [saved, setSaved]         = useState(false)
  const [previewOpen, setPreview] = useState(false)

  const totaux      = useMemo(() => calculerTotaux(form.prestations), [form.prestations])
  const devisForm   = useMemo(() => toDevisForm(form), [form])

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function setField<K extends keyof FactureForm>(key: K, value: FactureForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const updatePrestation = useCallback((id: string, updated: Prestation) => {
    setForm((f) => ({
      ...f,
      prestations: f.prestations.map((p) => (p.id === id ? updated : p)),
    }))
  }, [])

  const removePrestation = useCallback((id: string) => {
    setForm((f) => ({
      ...f,
      prestations: f.prestations.filter((p) => p.id !== id),
    }))
  }, [])

  function addPrestation() {
    setForm((f) => ({ ...f, prestations: [...f.prestations, prestationVide()] }))
  }

  // ─── Actions ────────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleOpenPreview() {
    if (!form.client.email) {
      alert("Veuillez renseigner l'email du client pour envoyer la facture.")
      return
    }
    setPreview(true)
  }

  async function handleSend() {
    setSending(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSending(false)
    setPreview(false)
    router.push('/factures?facture=envoyee')
  }

  // ─── Shared props ────────────────────────────────────────────────────────────

  const sharedProps = {
    form,
    setField,
    updatePrestation,
    removePrestation,
    addPrestation,
    saving,
    sending,
    saved,
    onSave: handleSaveDraft,
    onSend: handleOpenPreview,
    onBack: () => router.back(),
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
              <button
                onClick={() => router.back()}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold text-kantoo-text">{form.numero}</span>
                  <Badge status="brouillon" />
                </div>
                <p className="text-xs text-gray-400">Nouvelle facture</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-xs font-medium text-green-600">✓ Brouillon sauvegardé</span>
              )}
              <Button
                variant="secondary"
                size="sm"
                icon={<Save className="h-4 w-4" />}
                loading={saving}
                onClick={handleSaveDraft}
              >
                Sauvegarder
              </Button>
              <Button
                size="sm"
                icon={<Send className="h-4 w-4" />}
                onClick={handleOpenPreview}
              >
                Envoyer la facture
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-[1fr_340px] gap-6">

            {/* ── Main column ─────────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* Informations */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de la facture</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="Objet de la facture"
                      placeholder="Ex : Rénovation cuisine — 12 rue Voltaire"
                      value={form.titre}
                      onChange={(e) => setField('titre', e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Date d'émission"
                    type="date"
                    value={form.date}
                    onChange={(e) => setField('date', e.target.value)}
                  />
                  <Input
                    label="Date d'échéance"
                    type="date"
                    value={form.echeanceDate}
                    onChange={(e) => setField('echeanceDate', e.target.value)}
                    hint={`Échéance le ${new Intl.DateTimeFormat('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    }).format(new Date(form.echeanceDate))}`}
                  />
                  <div className="col-span-2">
                    <Select
                      label="Conditions de paiement"
                      options={CONDITIONS_OPTIONS}
                      value={form.conditionsPaiement}
                      onChange={(e) =>
                        setField('conditionsPaiement', e.target.value as ConditionsPaiement)
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Client */}
              <ClientSection
                client={form.client}
                onChange={(client) => setField('client', client)}
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
                        {['#', 'Description', 'Qté', 'Unité', 'Prix HT', 'TVA', 'Total HT', ''].map((h) => (
                          <th key={h} className="px-2 py-2.5 text-left text-xs font-medium text-gray-400 last:w-10">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.prestations.map((p, i) => (
                        <PrestationRow
                          key={p.id}
                          prestation={p}
                          index={i}
                          onChange={(updated) => updatePrestation(p.id, updated)}
                          onRemove={() => removePrestation(p.id)}
                          canRemove={form.prestations.length > 1}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-100 p-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={addPrestation}
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
                  placeholder="Ex : Merci pour votre confiance. N'hésitez pas à nous contacter..."
                  value={form.messageClient}
                  onChange={(e) => setField('messageClient', e.target.value)}
                  className="min-h-[100px]"
                />
              </Card>

              {/* Mention légale */}
              <Card>
                <CardHeader>
                  <CardTitle>Mention légale</CardTitle>
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    Obligatoire
                  </span>
                </CardHeader>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs leading-relaxed text-amber-800">{MENTION_LEGALE}</p>
                </div>
              </Card>
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <div>
              <div className="sticky top-20 space-y-4">
                <TotauxPanel totaux={totaux} />

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<Save className="h-5 w-5" />}
                    loading={saving}
                    onClick={handleSaveDraft}
                    className="w-full"
                  >
                    Sauvegarder brouillon
                  </Button>
                  <Button
                    size="lg"
                    icon={<Send className="h-5 w-5" />}
                    onClick={handleOpenPreview}
                    className="w-full"
                  >
                    Envoyer la facture
                  </Button>
                </div>

                {saved && (
                  <p className="text-center text-xs font-medium text-green-600">
                    ✓ Brouillon sauvegardé
                  </p>
                )}

                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs leading-relaxed text-amber-700">
                    {MENTION_LEGALE}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ════ PREVIEW MODAL ══════════════════════════════════════════════════ */}
      {previewOpen && (
        <DevisPreviewModal
          form={devisForm}
          totaux={totaux}
          artisan={DEV_ARTISAN}
          sending={sending}
          onClose={() => setPreview(false)}
          onConfirm={handleSend}
          factureMode
          echeanceDate={form.echeanceDate}
          conditionsPaiement={form.conditionsPaiement}
        />
      )}
    </>
  )
}
