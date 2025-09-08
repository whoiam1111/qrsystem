import { withAuth } from 'next-auth/middleware';

export default withAuth({
    pages: {
        signIn: '/admin/login',
    },
    callbacks: {
        authorized: ({ token, req }) => {
            // /admin, /api/admin 아래만 보호
            const path = req.nextUrl.pathname;
            const needsAdmin = path.startsWith('/admin') || path.startsWith('/api/admin');
            if (!needsAdmin) return true;

            const email = token?.email as string | undefined;
            if (!email) return false;

            const allow = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map((s) => s.trim());
            return allow.includes(email);
        },
    },
});

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
