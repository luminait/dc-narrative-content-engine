import { type NextRequest } from 'next/server';
import { updateSession } from '@/src/server/supabase/middleware';

export async function middleware(request: NextRequest) {
    // Allow test routes without authentication in development
    if (process.env.NODE_ENV === 'development') {
        const testRoutes = ['/test-campaigns', '/api/test-campaigns'];
        if (testRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
            return;
        }
    }

    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
