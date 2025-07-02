// app/[lang]/sso-callback/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import {
  AuthenticateWithRedirectCallback,
  useSignIn,
  useSignUp,
  useClerk,
} from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'

export default function SSOCallbackPage() {
  const router = useRouter()

  /* Clerk hooks ----------------------------------------------------------- */
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { setActive } = useClerk() // <-- setActive para multi-session

  /* State ----------------------------------------------------------------- */
  const [showUsernameForm, setShowUsernameForm] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Obtener el idioma actual de la URL
  const lang = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en'

  /* 1.  Inicio de sesión con cuenta EXISTENTE ----------------------------- */
  useEffect(() => {
    if (!signInLoaded) return
    if (signIn?.status === 'complete' && signIn.createdSessionId) {
      setActive({ session: signIn.createdSessionId }) // activa la nueva sesión
      router.replace(`/${lang}`)
    }
  }, [signInLoaded, signIn, setActive, router, lang])

  /* 2.  Registro nuevo (faltan datos) o completado ------------------------ */
  useEffect(() => {
    if (!signUpLoaded) return

    // Falta username ⇒ mostramos formulario
    if (
      signUp?.status === 'missing_requirements' &&
      signUp.missingFields?.includes('username')
    ) {
      setShowUsernameForm(true)
      return
    }

    // Registro completo ⇒ activamos sesión y redirigimos
    if (signUp?.status === 'complete' && signUp.createdSessionId) {
      setActive({ session: signUp.createdSessionId }) // activa la nueva sesión
      router.replace(`/${lang}`)
    }
  }, [signUpLoaded, signUp, setActive, router, lang])

  /* 3.  Enviar username pendiente ---------------------------------------- */
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const updated = await signUp?.update({ username })

      if (updated?.status === 'complete' && updated.createdSessionId) {
        await setActive({ session: updated.createdSessionId })
        router.replace(`/${lang}`)
      } else if (updated?.status === 'missing_requirements') {
        setError('El nombre de usuario no es válido.')
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Error al completar el registro')
    } finally {
      setLoading(false)
    }
  }

  /* 4.  UI: formulario de username pendiente ------------------------------ */
  if (showUsernameForm) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Completa tu cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Nombre de usuario
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando cuenta…' : 'Completar registro'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* 5.  Spinner + callback mientras Clerk procesa ------------------------ */
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-lg font-medium">
        Completando inicio de sesión…
      </h1>
      <p className="text-sm text-gray-500 mt-2">Por favor espera</p>

      <AuthenticateWithRedirectCallback
        redirectUrl={`/${lang}`}
        afterSignInUrl={`/${lang}`}
        afterSignUpUrl={`/${lang}`}
      />
    </div>
  )
}
