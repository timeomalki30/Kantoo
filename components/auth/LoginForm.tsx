'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

interface LoginFields {
  email:    string
  password: string
}

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError]   = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ mode: 'onTouched' })

  async function onSubmit(data: LoginFields) {
    setServerError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email:    data.email,
      password: data.password,
    })

    if (error) {
      setServerError('Identifiants invalides. Vérifiez votre email et mot de passe.')
      return
    }

    router.push('/dashboard')
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
        {/* Server error */}
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

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

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-kantoo-text">
              Mot de passe
            </label>
            <Link
              href="/reset-password"
              className="mb-1.5 text-xs font-medium text-orange-500 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
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
              minLength: { value: 6, message: 'Au moins 6 caractères requis' },
            })}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full"
        >
          Se connecter
        </Button>
      </form>
    </div>
  )
}
