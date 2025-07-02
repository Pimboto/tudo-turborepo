// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// Lista de idiomas soportados
export const locales = ['en', 'es'];
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/',
  '/sign-in',
  '/sign-up',
  '/login',
  '/register',
  '/signup',
  '/sso-callback',
  '/about',
  '/pricing',
  '/business',
  '/search',
  '/test-clerk'
];

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  let languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  if (!languages || languages.length === 0) {
    languages = [defaultLocale];
  }

  return match(languages, locales, defaultLocale);
}

function isPublicPath(pathname: string): boolean {
  // Remover el prefijo de idioma si existe
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  
  // Verificar si es una ruta pública
  return publicPaths.some((path) => {
    if (path === '/') {
      return pathWithoutLocale === '/';
    }
    return pathWithoutLocale.startsWith(path);
  });
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  console.log("🛣️ Middleware processing:", pathname);
  
  // Verificar si la solicitud es para archivos estáticos o API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Archivos como imágenes, CSS, etc.
  ) {
    console.log("📁 Static file or API route, skipping middleware");
    return NextResponse.next();
  }

  // Verificar si la URL ya tiene un locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Si no hay locale, redirigir con locale
  if (!pathnameHasLocale) {
    const locale = getLocale(req);
    const newPath = `/${locale}${pathname}`;
    
    console.log("🌐 Adding locale:", locale, "New path:", newPath);
    
    const url = new URL(newPath, req.url);
    const response = NextResponse.redirect(url);
    response.cookies.set('NEXT_LOCALE', locale);
    return response;
  }

  // Proteger rutas privadas con Clerk
  const isPublic = isPublicPath(pathname);
  console.log("🔒 Is public path?", isPublic, "Path:", pathname);
  
  if (!isPublic) {
    const authObject = await auth();
    console.log("👤 Auth object:", { userId: authObject.userId, sessionId: authObject.sessionId });
    
    if (!authObject.userId) {
      // Si el usuario no está autenticado, redirigir al login manteniendo el idioma
      const locale = pathname.split('/')[1] || defaultLocale;
      const signInUrl = new URL(`/${locale}/login`, req.url);
      console.log("🚫 Not authenticated, redirecting to login:", signInUrl.href);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  console.log("✅ Middleware passed, continuing...");
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
