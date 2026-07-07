import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  
  // Define protected routes (routes that require authentication)
  const protectedRoutes = [
    '/',
    '/account-page',
    '/approved-status-page',
    '/file-page',
    '/dashboard',
    '/project-page',
  ];
  
  // Define public routes
  const publicRoutes = ['/login-page'];
  
  const isProtectedRoute = protectedRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Redirect authenticated users from login page to province page
  if (isPublicRoute && token) {
     console.log('✅ Auth user trying to access login -> redirect to province-page');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect unauthenticated users from protected routes to login page
  if (isProtectedRoute && !token) {
    console.log('❌ Unauth user trying to access protected route -> redirect to login');
    const loginUrl = new URL('/login-page', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/account-page/:path*',
    '/approved-status-page/:path*',
    '/file-page/:path*',
    '/login-page/:path*',
    '/dashboard/:path*',
    '/project-page/:path*',
  ],
};