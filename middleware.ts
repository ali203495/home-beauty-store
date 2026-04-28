export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export default function middleware(request: Request) {
  const url = new URL(request.url)
  const country = request.headers.get('x-vercel-ip-country') || 'MA'
  
  // 1. Simple Bot Protection at the Edge
  const ua = request.headers.get('user-agent') || ''
  if (ua.includes('HeadlessChrome')) {
     return new Response('Access Denied', { status: 403 })
  }

  // 2. Performance & Context Headers
  const response = new Response(null, {
    headers: {
      'x-edge-location': country,
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
  
  // We return null / undefined to signify 'continue' in some Vercel versions, 
  // or a Response with headers to append. In Nuxt/Vercel Middleware, 
  // returning nothing or a Response with the 'x-middleware-next' header is preferred.
  response.headers.set('x-middleware-next', '1')
  return response
}
