'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Check, ChevronLeft, ChevronRight,
  Building2, Receipt, Palette, Rocket,
  ArrowRight,
} from 'lucide-react'
import { cn }            from '@/lib/utils'
import { Button }        from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { createClient }  from '@/lib/supabase/client'
import confetti from 'canvas-confetti'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Entreprise',  icon: Building2 },
  { n: 2, label: 'Facturation', icon: Receipt    },
  { n: 3, label: 'Devis',       icon: Palette    },
  { n: 4, label: "C'est parti", icon: Rocket     },
] as const

const STATUT_OPTIONS = [
  { value: '',                label: 'Choisissez votre statut' },
  { value: 'auto-entrepreneur', label: 'Auto-entrepreneur'     },
  { value: 'sarl',            label: 'SARL'                   },
  { value: 'sas',             label: 'SAS'                    },
  { value: 'ei',              label: 'Entreprise Individuelle' },
  { value: 'autre',           label: 'Autre'                  },
]

const LEGAL_MENTIONS: Record<string, string> = {
  'auto-entrepreneur': 'Auto-entrepreneur — TVA non applicable, art. 293B du CGI.',
  'sarl': 'SARL au capital de _____ € — RCS [Ville] [numéro] — SIRET [numéro].',
  'sas':  'SAS au capital de _____ € — RCS [Ville] [numéro] — SIRET [numéro].',
  'ei':   'Entreprise Individuelle — SIRET [numéro] — RCS [Ville] [numéro].',
  'autre': '',
}

const CONDITIONS_OPTIONS = [
  { value: 'comptant',  label: 'Comptant à réception'  },
  { value: '30',        label: '30 jours fin de mois'  },
  { value: '45',        label: '45 jours fin de mois'  },
  { value: '60',        label: '60 jours fin de mois'  },
]

const COLOR_OPTIONS = [
  { hex: '#F97316', name: 'Orange' },
  { hex: '#3B82F6', name: 'Bleu'   },
  { hex: '#22C55E', name: 'Vert'   },
  { hex: '#8B5CF6', name: 'Violet' },
  { hex: '#EF4444', name: 'Rouge'  },
  { hex: '#6B7280', name: 'Gris'   },
]

const DEFAULT_MESSAGE =
  "Merci pour votre confiance ! N'hésitez pas à nous contacter pour toute question concernant ce devis."

// ─── Form state ───────────────────────────────────────────────────────────────

interface OnboardingData {
  // Step 1
  nomEntreprise: string
  siret: string
  adresse: string
  // Step 2
  statut: string
  iban: string
  numeroTVA: string
  // Step 3
  couleur: string
  message: string
  conditions: string
}

const INITIAL: OnboardingData = {
  nomEntreprise: '',
  siret:         '',
  adresse:       '',
  statut:        '',
  iban:          '',
  numeroTVA:     '',
  couleur:       '#F97316',
  message:       DEFAULT_MESSAGE,
  conditions:    'comptant',
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map(({ n, label, icon: Icon }, i) => {
        const done   = step > n
        const active = step === n
        return (
          <div key={n} className="flex flex-1 flex-col items-center">
            {/* Connector + circle row */}
            <div className="flex w-full items-center">
              {/* Left connector */}
              <div
                className={cn(
                  'h-0.5 flex-1 transition-colors duration-300',
                  i === 0 ? 'invisible' : done || active ? 'bg-orange-400' : 'bg-gray-200'
                )}
              />
              {/* Circle */}
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                  done   ? 'border-orange-500 bg-orange-500 text-white'         : '',
                  active ? 'border-orange-500 bg-white text-orange-500 shadow-sm' : '',
                  !done && !active ? 'border-gray-200 bg-white text-gray-300'   : ''
                )}
              >
                {done
                  ? <Check className="h-4 w-4" strokeWidth={2.5} />
                  : <Icon className="h-4 w-4" />}
              </div>
              {/* Right connector */}
              <div
                className={cn(
                  'h-0.5 flex-1 transition-colors duration-300',
                  i === STEPS.length - 1 ? 'invisible' : done ? 'bg-orange-400' : 'bg-gray-200'
                )}
              />
            </div>
            {/* Label */}
            <p
              className={cn(
                'mt-1.5 text-[10px] font-semibold tracking-wide',
                active ? 'text-orange-500' : done ? 'text-orange-400' : 'text-gray-300'
              )}
            >
              {label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1 — Entreprise ──────────────────────────────────────────────────────

function Step1({
  data, set,
}: {
  data: OnboardingData
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void
}) {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-kantoo-text">Ton entreprise</h2>
        <p className="mt-1 text-sm text-gray-500">Ces informations apparaîtront sur tes devis.</p>
      </div>

      <Input
        id="nomEntreprise"
        label="Nom de l'entreprise"
        placeholder="Dupont Plomberie"
        required
        value={data.nomEntreprise}
        onChange={(e) => set('nomEntreprise', e.target.value)}
      />
      <Input
        id="siret"
        label="SIRET"
        placeholder="123 456 789 00012"
        hint="Optionnel — affiché sur vos devis"
        value={data.siret}
        onChange={(e) => set('siret', e.target.value)}
      />
      <Textarea
        id="adresse"
        label="Adresse complète"
        placeholder={"12 rue des Artisans\n75011 Paris"}
        rows={3}
        value={data.adresse}
        onChange={(e) => set('adresse', e.target.value)}
      />
    </div>
  )
}

// ─── Step 2 — Facturation ─────────────────────────────────────────────────────

function Step2({
  data, set,
}: {
  data: OnboardingData
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void
}) {
  const mention = data.statut ? (LEGAL_MENTIONS[data.statut] ?? '') : ''

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-kantoo-text">Facturation</h2>
        <p className="mt-1 text-sm text-gray-500">Informations légales et bancaires.</p>
      </div>

      <Select
        id="statut"
        label="Statut juridique"
        options={STATUT_OPTIONS}
        value={data.statut}
        onChange={(e) => set('statut', e.target.value)}
      />

      {/* Auto-generated legal mention */}
      {mention && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-400">
            Mention légale générée
          </p>
          <p className="text-xs leading-relaxed text-blue-700">{mention}</p>
        </div>
      )}

      <Input
        id="iban"
        label="IBAN"
        placeholder="FR76 3000 6000 0112 3456 7890 189"
        hint="Optionnel — pour faciliter les paiements"
        value={data.iban}
        onChange={(e) => set('iban', e.target.value)}
      />
      <Input
        id="tva"
        label="Numéro de TVA intracommunautaire"
        placeholder="FR12 345678901"
        hint="Optionnel — si assujetti à la TVA"
        value={data.numeroTVA}
        onChange={(e) => set('numeroTVA', e.target.value)}
      />
    </div>
  )
}

// ─── Step 3 — Personnalisation ────────────────────────────────────────────────

function Step3({
  data, set,
}: {
  data: OnboardingData
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void
}) {
  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-kantoo-text">Personnalise tes devis</h2>
        <p className="mt-1 text-sm text-gray-500">Choisis l&apos;apparence de tes documents.</p>
      </div>

      {/* Color picker */}
      <div>
        <p className="mb-2 text-sm font-medium text-kantoo-text">Couleur principale</p>
        <div className="flex flex-wrap gap-3">
          {COLOR_OPTIONS.map(({ hex, name }) => {
            const selected = data.couleur === hex
            return (
              <button
                key={hex}
                type="button"
                title={name}
                onClick={() => set('couleur', hex)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl ring-offset-2 transition-all',
                  selected ? 'ring-2 ring-offset-white' : 'hover:scale-110'
                )}
                style={{
                  backgroundColor: hex,
                  ...(selected ? { outline: `2px solid ${hex}`, outlineOffset: '2px' } : {}),
                }}
                aria-pressed={selected}
                aria-label={name}
              >
                {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </button>
            )
          })}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          {COLOR_OPTIONS.find((c) => c.hex === data.couleur)?.name ?? ''}
        </p>
      </div>

      {/* Default message */}
      <Textarea
        id="message"
        label="Message de remerciement par défaut"
        hint="Affiché en bas de chaque devis"
        rows={3}
        value={data.message}
        onChange={(e) => set('message', e.target.value)}
      />

      {/* Payment conditions */}
      <Select
        id="conditions"
        label="Conditions de paiement"
        options={CONDITIONS_OPTIONS}
        value={data.conditions}
        onChange={(e) => set('conditions', e.target.value)}
      />
    </div>
  )
}

// ─── Step 4 — Done ────────────────────────────────────────────────────────────

function Step4() {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
        <Rocket className="h-10 w-10 text-orange-500" />
      </div>

      <h2 className="text-2xl font-bold text-kantoo-text">C&apos;est parti !</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
        Tu peux maintenant créer des devis professionnels, les envoyer à tes clients et les faire
        signer en ligne en quelques clics.
      </p>

      <ul className="mt-6 space-y-2 text-left">
        {[
          'Créer et envoyer des devis en 2 minutes',
          'Signature électronique en ligne',
          'Suivi des paiements en temps réel',
          'Relances automatiques',
        ].map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <Link
        href="/devis/nouveau"
        className="mt-8 flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98]"
      >
        Créer mon premier devis
        <ArrowRight className="h-5 w-5" />
      </Link>

      <Link
        href="/dashboard"
        className="mt-3 text-sm text-gray-400 hover:text-gray-600 hover:underline"
      >
        Aller au tableau de bord
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep]     = useState(1)
  const [data, setData]     = useState<OnboardingData>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function set<K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [k]: v }))
  }

  const fireConfetti = useCallback(() => {
    const burst = (opts: confetti.Options) =>
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, ...opts })
    burst({})
    setTimeout(() => burst({ origin: { x: 0.2, y: 0.6 } }), 150)
    setTimeout(() => burst({ origin: { x: 0.8, y: 0.6 } }), 300)
  }, [])

  useEffect(() => {
    if (step === 4) fireConfetti()
  }, [step, fireConfetti])

  async function saveProfile() {
    setSaving(true)
    setSaveError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }

      const { error } = await supabase.from('profiles').upsert({
        id:                  user.id,
        nom_entreprise:      data.nomEntreprise || null,
        siret:               data.siret         || null,
        adresse:             data.adresse       || null,
        statut_juridique:    data.statut        || null,
        iban:                data.iban          || null,
        tva:                 data.numeroTVA     || null,
        couleur_principale:  data.couleur,
        message_remerciement: data.message      || null,
        conditions_paiement: data.conditions    || null,
      })

      if (error) {
        setSaveError(error.message)
        setSaving(false)
        return false
      }
      setSaving(false)
      return true
    } catch {
      setSaveError('Une erreur est survenue. Réessayez.')
      setSaving(false)
      return false
    }
  }

  async function next() {
    // Save profile when leaving step 3
    if (step === 3) {
      if (!data.nomEntreprise) {
        setSaveError("Le nom de l'entreprise est obligatoire.")
        return
      }
      const ok = await saveProfile()
      if (!ok) return
    }
    setStep((s) => Math.min(s + 1, 4))
  }

  function prev() { setStep((s) => Math.max(s - 1, 1)) }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Step indicator */}
        <ProgressBar step={step} />

        {/* Card */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-card">
          {step === 1 && <Step1 data={data} set={set} />}
          {step === 2 && <Step2 data={data} set={set} />}
          {step === 3 && <Step3 data={data} set={set} />}
          {step === 4 && <Step4 />}
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="mt-5 flex items-center justify-between">
            {/* Back */}
            {step > 1 ? (
              <button
                onClick={prev}
                className="flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </button>
            ) : (
              <div />
            )}

            {/* Skip + Next */}
            <div className="flex items-center gap-3">
              {step < 3 && (
                <button
                  onClick={() => setStep((s) => Math.min(s + 1, 4))}
                  className="text-sm text-gray-400 transition-colors hover:text-gray-600"
                >
                  Passer cette étape
                </button>
              )}
              <Button
                onClick={next}
                size="md"
                loading={saving}
                icon={<ChevronRight className="h-4 w-4" />}
              >
                {step === 3 ? 'Terminer' : 'Suivant'}
              </Button>
            </div>
          </div>
        )}

        {/* Step counter */}
        <p className="mt-4 text-center text-xs text-gray-300">
          Étape {step} sur 4
        </p>
      </div>
    </div>
  )
}
