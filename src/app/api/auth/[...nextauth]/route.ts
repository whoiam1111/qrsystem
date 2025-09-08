import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Admin Login',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const allow = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map((s) => s.trim());
                const adminPassword = process.env.ADMIN_PASSWORD || '';

                if (
                    credentials?.email &&
                    credentials.password &&
                    allow.includes(credentials.email) &&
                    credentials.password === adminPassword
                ) {
                    // authorize 함수는 반드시 user 객체를 반환해야 함
                    return { id: '1', email: credentials.email };
                }
                return null;
            },
        }),
    ],
    session: { strategy: 'jwt' }, // ✅ AuthOptions 타입과 일치
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// App Router에서는 GET/POST export 필수
export { handler as GET, handler as POST };
