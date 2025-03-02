import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware

const isPublicRoute = createRouteMatcher([
    '/api/uploadthing',
])

const isProtectedRoute = createRouteMatcher(['/'])

export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) auth().protect()
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
