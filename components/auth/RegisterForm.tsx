'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

interface RegisterFields {
  prenom:    string
  nom:       string
  metier:    string
  telephone: string
  email:     string
  password:  string
}

const METIERS = [
  { value: '',            label: 'Choisissez votre métier' },
  { value: 'plombier',    label: 'Plombier'    },
  { value: 'electricien', label: 'Électricien' },
  { value: 'peintre',     label: 'Peintre'     },
  { value: 'macon',       label: 'Maçon'       },
  { value: 'menuisier',   label: 'Menuisier'   },
  { value: 'carreleur',   label: 'Carreleur'   },
  { value: 'autre',       label: 'Autre'       },
]

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError]   = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({ mode: 'onTouched' })

  async function onSubmit(data: RegisterFields) {
    setServerError('')
    const supabase = createClient()

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options: {
        data: {
          full_name: `${data.prenom} ${data.nom}`,
          prenom:    data.prenom,
          nom:       data.nom,
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setServerError('Un compte existe déjà avec cet email.')
      } else {
        setServerError(signUpError.message)
      }
      return
    }

    if (!authData.user) {
      setServerError('Erreur lors de la création du compte. Réessayez.')
      return
    }

    // 2. Create profile row
    await supabase.from('profiles').upsert({
      id:        authData.user.id,
      prenom:    data.prenom,
      nom:       data.nom,
      email:     data.email,
      telephone: data.telephone,
      metier:    data.metier,
    })

    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
    router.refresh()
  }

  async function handleDevAccess() {
    await new Promise((r) => setTimeout(r, 400))
    router.push('/dashboard')
  }

  return (
    <div className="space-y-5">
      {/* Dev bypass */}
      {IS_DEV && (
        <button
          type="button"
          onClick={handleDevAccess}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100"
        >
          <Zap className="h-4 w-4" />
          Accès dev rapide
        </button>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* Prénom + Nom */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="prenom"
            type="text"
            label="Prénom"
            placeholder="Jean"
            autoComplete="given-name"
            error={errors.prenom?.message}
            {...register('prenom', {
              required:  'Le prénom est obligatoire',
              minLength: { value: 2, message: 'Trop court' },
            })}
          />
          <Input
            id="nom"
            type="text"
            label="Nom"
            placeholder="Dupont"
            autoComplete="family-name"
            error={errors.nom?.message}
            {...register('nom', {
              required:  'Le nom est obligatoire',
              minLength: { value: 2, message: 'Trop court' },
            })}
          />
        </div>

        {/* Métier */}
        <Select
          id="metier"
          label="Métier"
          options={METIERS}
          error={errors.metier?.message}
          {...register('metier', {
            required: 'Sélectionnez votre métier',
            validate: (v) => v !== '' || 'Sélectionnez votre métier',
          })}
        />

        {/* Téléphone */}
        <Input
          id="telephone"
          type="tel"
          label="Téléphone"
          placeholder="06 12 34 56 78"
          autoComplete="tel"
          inputMode="tel"
          error={errors.telephone?.message}
          {...register('telephone', {
            required: 'Le téléphone est obligatoire',
            pattern: {
              value:   /^(\+33|0)[1-9](\s?\d{2}){4}$/,
              message: 'Numéro de téléphone invalide',
            },
          })}
        />

        {/* Email */}
        <Input
          id="email"
          type="email"
          label="Adresse email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email', {
            required: "L'email est obligatoire",
            pattern: {
              value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Format d'email invalide",
            },
          })}
        />

        {/* Mot de passe */}
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          label="Mot de passe"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          hint={!errors.password ? '8 caractères minimum' : undefined}
          suffix={
            <button
              type="button"
              className="pointer-events-auto cursor-pointer text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password', {
            required:  'Le mot de passe est obligatoire',
            minLength: { value: 8, message: 'Au moins 8 caractères requis' },
            validate:  (v) => /[A-Z]/.test(v) || 'Au moins une majuscule requise',
          })}
        />

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full"
        >
          Créer mon compte
        </Button>
      </form>
    </div>
  )
}
