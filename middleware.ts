import { next } from '@vercel/edge'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export default function middleware(request: Request) {
  const response = next()
  
  // 1. Geography-based Optimization
  const country = request.headers.get('x-vercel-ip-country') || 'MA'
  
  // 2. Add performance headers
  response.headers.set('x-edge-location', country)
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  
  // 3. Simple Bot Protection at the Edge
  const ua = request.headers.get('user-agent') || ''
  if (ua.includes('HeadlessChrome')) {
     return new Response('Access Denied', { status: 403 })
  }

  return response
}
