'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, ChevronRight, Send, Save, Plus,
  User, Phone, Mail, MapPin, Hammer, FileText,
} from 'lucide-react'
import { nanoid } from 'nanoid'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MobileProgressBar } from './MobileProgressBar'
import { PrestationCard } from './PrestationRow'
import { TotauxPanel } from './TotauxPanel'

import { calculerTotaux, dateValidite, formatEuros } from '@/lib/devis'
import type { Client, DevisForm, Prestation } from '@/types/devis'

// ─── Touch-sized input primitives ────────────────────────────────────────────
// We define local inline styles so desktop Input.tsx stays unchanged.

const touchInput =
  'block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base ' +
  'text-kantoo-text placeholder:text-gray-400 shadow-sm min-h-[48px] ' +
  'hover:border-gray-300 focus:border-orange-400 focus:outline-none ' +
  'focus:ring-2 focus:ring-orange-500/20 transition-all duration-150'

const touchSelect =
  touchInput +
  ' cursor-pointer appearance-none ' +
  'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")] ' +
  'bg-[right_14px_center] bg-no-repeat pr-10'

function TField({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-kantoo-text">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── Step views ───────────────────────────────────────────────────────────────

function StepChantier({
  form,
  setField,
}: {
  form: DevisForm
  setField: <K extends keyof DevisForm>(k: K, v: DevisForm[K]) => void
}) {
  // Local string state so the user can clear and retype freely
  const [validiteStr, setValiditeStr] = useState(String(form.validiteJours || 30))

  // Keep in sync if the parent value changes (e.g. on mount after profile load)
  useEffect(() => {
    setValiditeStr(String(form.validiteJours || 30))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const jours = parseInt(validiteStr, 10)
  const validJours = !isNaN(jours) && jours > 0

  const dateExp = useMemo(
    () =>
      validJours
        ? new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }).format(new Date(dateValidite(jours)))
        : '',
    [jours, validJours]
  )

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-500">
          Étape 1 / 3
        </p>
        <h2 className="text-2xl font-bold text-kantoo-text">Le chantier</h2>
        <p className="mt-1 text-sm text-gray-400">Décrivez le projet à réaliser.</p>
      </div>

      <TField label="Titre du chantier" icon={<Hammer className="h-4 w-4" />}>
        <input
          className={touchInput}
          placeholder="Ex : Rénovation cuisine — 12 rue Voltaire"
          value={form.titre}
          onChange={(e) => setField('titre', e.target.value)}
        />
      </TField>

      <div className="grid grid-cols-2 gap-4">
        <TField label="Date du devis">
          <input
            className={touchInput}
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
          />
        </TField>

        <TField label="Validité (jours)">
          <input
            className={touchInput}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="30"
            value={validiteStr}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              setValiditeStr(raw)
              const parsed = parseInt(raw, 10)
              if (!isNaN(parsed) && parsed > 0 && parsed <= 365) {
                setField('validiteJours', parsed)
              }
            }}
            onBlur={() => {
              const parsed = parseInt(validiteStr, 10)
              if (isNaN(parsed) || parsed <= 0) {
                setValiditeStr('30')
                setField('validiteJours', 30)
              }
            }}
          />
        </TField>
      </div>

      {validJours && dateExp && (
        <p className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
          Ce devis expire le <strong>{dateExp}</strong>
        </p>
      )}

      <TField label="Message au client">
        <textarea
          className={touchInput + ' min-h-[120px] resize-none leading-relaxed'}
          placeholder="Ex : Ce devis inclut la fourniture de tous les matériaux..."
          value={form.messageClient}
          onChange={(e) => setField('messageClient', e.target.value)}
        />
      </TField>
    </div>
  )
}

function StepClient({
  client,
  onChange,
}: {
  client: Client
  onChange: (c: Client) => void
}) {
  function set<K extends keyof Client>(key: K, value: Client[K]) {
    onChange({ ...client, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-500">
          Étape 2 / 3
        </p>
        <h2 className="text-2xl font-bold text-kantoo-text">Le client</h2>
        <p className="mt-1 text-sm text-gray-400">À qui adresser ce devis ?</p>
      </div>

      <TField label="Nom complet" icon={<User className="h-4 w-4" />}>
        <input
          className={touchInput}
          placeholder="Jean Dupont"
          value={client.nom}
          onChange={(e) => set('nom', e.target.value)}
          autoComplete="name"
        />
      </TField>

      <TField label="Téléphone" icon={<Phone className="h-4 w-4" />}>
        <input
          className={touchInput}
          type="tel"
          placeholder="06 12 34 56 78"
          value={client.telephone}
          onChange={(e) => set('telephone', e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
      </TField>

      <TField label="Email" icon={<Mail className="h-4 w-4" />}>
        <input
          className={touchInput}
          type="email"
          placeholder="client@exemple.fr"
          value={client.email}
          onChange={(e) => set('email', e.target.value)}
          autoComplete="email"
          inputMode="email"
        />
      </TField>

      <TField label="Adresse" icon={<MapPin className="h-4 w-4" />}>
        <input
          className={touchInput}
          placeholder="12 rue des Artisans, 75011 Paris"
          value={client.adresse}
          onChange={(e) => set('adresse', e.target.value)}
          autoComplete="street-address"
        />
      </TField>
    </div>
  )
}

function StepPrestations({
  prestations,
  onUpdate,
  onRemove,
  onAdd,
}: {
  prestations: Prestation[]
  onUpdate: (id: string, p: Prestation) => void
  onRemove: (id: string) => void
  onAdd: () => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-500">
          Étape 3 / 3
        </p>
        <h2 className="text-2xl font-bold text-kantoo-text">Les prestations</h2>
        <p className="mt-1 text-sm text-gray-400">
          {prestations.length} prestation{prestations.length > 1 ? 's' : ''} — ajoutez-en autant que nécessaire.
        </p>
      </div>

      <div className="space-y-3">
        {prestations.map((p, i) => (
          <PrestationCard
            key={p.id}
            prestation={p}
            index={i}
            onChange={(updated) => onUpdate(p.id, updated)}
            onRemove={() => onRemove(p.id)}
            canRemove={prestations.length > 1}
            touch
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/50 py-4 text-sm font-semibold text-orange-500 transition-colors hover:border-orange-300 hover:bg-orange-50 active:scale-[0.98]"
      >
        <Plus className="h-5 w-5" />
        Ajouter une prestation
      </button>
    </div>
  )
}

// ─── Bottom bars ──────────────────────────────────────────────────────────────

function BottomNav({
  step,
  totaux,
  onPrev,
  onNext,
  onSave,
  onSend,
  saving,
  sending,
  saved,
}: {
  step: number
  totaux: ReturnType<typeof calculerTotaux>
  onPrev: () => void
  onNext: () => void
  onSave: () => void
  onSend: () => void
  saving: boolean
  sending: boolean
  saved: boolean
}) {
  const isLast = step === 2

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white/95 backdrop-blur-md">
      {/* TTC strip */}
      <div
        className={`flex items-center justify-between px-4 py-3 transition-all ${
          isLast ? 'bg-orange-500' : 'bg-gray-50'
        }`}
      >
        <span className={`text-xs font-semibold uppercase tracking-wide ${isLast ? 'text-orange-100' : 'text-gray-400'}`}>
          Total TTC
        </span>
        <span className={`text-xl font-bold tabular-nums ${isLast ? 'text-white' : 'text-kantoo-text'}`}>
          {formatEuros(totaux.totalTTC)}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 px-4 pb-safe pb-4 pt-2">
        {step > 0 ? (
          <button
            type="button"
            onClick={onPrev}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm active:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-12 shrink-0" />
        )}

        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 text-base font-semibold text-white shadow-sm shadow-orange-200 active:bg-orange-600"
          >
            Suivant
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex flex-1 gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm active:bg-gray-50 disabled:opacity-50"
            >
              {saving ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <Save className="h-4 w-4" />}
              Brouillon
            </button>
            <button
              type="button"
              onClick={onSend}
              disabled={sending}
              className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-orange-500 text-base font-bold text-white shadow-sm shadow-orange-200 active:bg-orange-600 disabled:opacity-50"
            >
              {sending ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <Send className="h-4 w-4" />}
              Envoyer
            </button>
          </div>
        )}
      </div>

      {saved && (
        <p className="pb-2 text-center text-xs font-medium text-green-600">
          ✓ Brouillon sauvegardé
        </p>
      )}
    </div>
  )
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

export interface MobileDevisWizardProps {
  form: DevisForm
  setField: <K extends keyof DevisForm>(k: K, v: DevisForm[K]) => void
  updatePrestation: (id: string, p: Prestation) => void
  removePrestation: (id: string) => void
  addPrestation: () => void
  saving: boolean
  sending: boolean
  saved: boolean
  onSave: () => void
  onSend: () => void
  onBack: () => void
}

export function MobileDevisWizard({
  form,
  setField,
  updatePrestation,
  removePrestation,
  addPrestation,
  saving,
  sending,
  saved,
  onSave,
  onSend,
  onBack,
}: MobileDevisWizardProps) {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const totaux = useMemo(() => calculerTotaux(form.prestations), [form.prestations])

  function goNext() { setStep((s) => Math.min(s + 1, 2)) }
  function goPrev() {
    if (step === 0) onBack()
    else setStep((s) => s - 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-kantoo-bg">

      {/* ── Sticky topbar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => step === 0 ? router.back() : setStep(s => s - 1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-bold text-kantoo-text">{form.numero}</span>
            <Badge status="brouillon" />
          </div>
        </div>

        {/* Progress bar */}
        <MobileProgressBar currentStep={step} />
      </div>

      {/* ── Step content ──────────────────────────────────────────────────── */}
      {/* pb-[160px] to clear the fixed bottom bar (TTC strip ~52px + nav ~72px + safe area) */}
      <div className="flex-1 overflow-y-auto px-4 pb-[160px] pt-6">
        {step === 0 && (
          <StepChantier form={form} setField={setField} />
        )}
        {step === 1 && (
          <StepClient
            client={form.client}
            onChange={(c) => setField('client', c)}
          />
        )}
        {step === 2 && (
          <StepPrestations
            prestations={form.prestations}
            onUpdate={updatePrestation}
            onRemove={removePrestation}
            onAdd={addPrestation}
          />
        )}
      </div>

      {/* ── Fixed bottom bar ──────────────────────────────────────────────── */}
      <BottomNav
        step={step}
        totaux={totaux}
        onPrev={goPrev}
        onNext={goNext}
        onSave={onSave}
        onSend={onSend}
        saving={saving}
        sending={sending}
        saved={saved}
      />
    </div>
  )
}
