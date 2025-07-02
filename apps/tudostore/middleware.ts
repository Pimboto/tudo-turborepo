//middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

// Lista de idiomas soportados
export const locales = ["en", "es"]
export const defaultLocale = "en"

// Define the Locale type
export type Locale = (typeof locales)[number]

// Función para obtener el idioma preferido del usuario
function getLocale(request: NextRequest): string {
  // Para simular headers en el cliente ya que Negotiator espera un objeto headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // Usar Negotiator y intl-localematcher para determinar el mejor idioma
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  // Si no hay idiomas en la cabecera, usar el idioma por defecto
  if (!languages || languages.length === 0) {
    languages = [defaultLocale]
  }

  return match(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  // Verificar si la solicitud es para archivos estáticos o API
  const { pathname } = request.nextUrl

  // Ignorar archivos estáticos y rutas de API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // Archivos como imágenes, CSS, etc.
  ) {
    return NextResponse.next()
  }

  // Verificar si la URL ya tiene un locale
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) return NextResponse.next()

  // Redirigir a la URL con el locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  // También podemos guardar el locale en una cookie para futuras visitas
  const response = NextResponse.redirect(request.nextUrl)
  response.cookies.set("NEXT_LOCALE", locale)

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
