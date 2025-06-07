import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Token keys in cookies
const TOKEN_KEY = "eve-care-auth-token"
const USER_KEY = "eve-care-auth-user"
const EXPIRY_KEY = "eve-care-auth-expiry"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    // Get the pathname of the request
    const path = request.nextUrl.pathname
    
    // Create a response to modify
    const res = NextResponse.next()
    
    // Debug information
    console.log(`Middleware processing path: ${path}`)
    
    // Check for custom token in cookies
    const hasToken = request.cookies.has(TOKEN_KEY)
    const hasUser = request.cookies.has(USER_KEY)
    const hasExpiry = request.cookies.has(EXPIRY_KEY)
    const customAuthActive = hasToken && hasUser && hasExpiry
    
    // If we have custom token auth data, verify it
    let isAuthenticated = false
    
    if (customAuthActive) {
      const expiryStr = request.cookies.get(EXPIRY_KEY)?.value
      
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10)
        const isValid = Date.now() < expiry
        
        if (isValid) {
          console.log('Valid custom token found, user is authenticated')
          isAuthenticated = true
        } else {
          console.log('Custom token expired')
        }
      }
    }
    
    // If not authenticated with custom token, try Supabase session
    if (!isAuthenticated) {
      // Create a Supabase client configured for the middleware
      const supabase = createMiddlewareClient({ req: request, res })
      
      // Check if we have a session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      isAuthenticated = !!session
      console.log(`Supabase session exists: ${isAuthenticated}`)
    }

    // If the user is not authenticated and the requested path is protected, redirect to login
    if (!isAuthenticated && isProtectedRoute(path)) {
      console.log(`Redirecting unauthenticated user from ${path} to login`)
      // Create the URL for the login page
      const redirectUrl = new URL('/login', request.url)
      
      // Add the original URL as a query parameter for later redirection
      redirectUrl.searchParams.set('redirectTo', path)
      
      // Redirect to the login page
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && isAuthRoute(path)) {
      console.log(`Redirecting authenticated user from ${path} to dashboard`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // For all other cases, return the response
    return res
  } catch (error) {
    // Log the error but don't block the request
    console.error('Authentication middleware error:', error)
    return NextResponse.next()
  }
}

// Define which routes are protected (require authentication)
function isProtectedRoute(path: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/products',
    '/orders',
    '/sales',
    '/settings',
    '/inventory',
    '/reports',
    '/prescriptions',
  ]
  
  return protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  )
}

// Define which routes are auth routes (login, register, etc.)
function isAuthRoute(path: string): boolean {
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  return authPaths.includes(path)
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Match all protected routes
    '/dashboard/:path*',
    '/products/:path*',
    '/orders/:path*',
    '/sales/:path*',
    '/settings/:path*',
    '/inventory/:path*',
    '/reports/:path*',
    '/prescriptions/:path*',
    // Match auth routes
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
}
