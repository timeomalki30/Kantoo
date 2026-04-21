import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/clients',
  '/factures',
  '/paiements',
  '/compte',
  '/onboarding',
]

// /devis/[token] (app/devis/[token]/page.tsx) is the public client-facing view — not protected.
function isProtectedRoute(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) return true
  if (pathname === '/devis') return true
  if (pathname.startsWith('/devis/nouveau')) return true
  return false
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      supabaseResponse = NextResponse.next({ request })
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      )
    },
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Not authenticated → login
  if (isProtectedRoute(pathname) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Authenticated but profile incomplete → onboarding
  //    (skip if already on /onboarding to avoid infinite redirect)
  if (user && isProtectedRoute(pathname) && pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nom_entreprise')
      .eq('id', user.id)
      .single()

    if (!profile?.nom_entreprise) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
