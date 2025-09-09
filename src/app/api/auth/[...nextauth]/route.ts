import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pkg from 'pg';

const { Pool } = pkg;

// PostgreSQL 연결 설정
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Supabase 또는 Postgres 연결 URL
});

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Admin Login',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;

                const client = await pool.connect();
                try {
                    const res = await client.query('SELECT * FROM admins WHERE email = $1 LIMIT 1', [
                        credentials.email,
                    ]);

                    if (res.rows.length === 0) return null;

                    const admin = res.rows[0];

                    // 평문 비밀번호 확인
                    if (credentials.password !== admin.password) return null;

                    return {
                        id: String(admin.id),
                        email: admin.email,
                    };
                } finally {
                    client.release();
                }
            },
        }),
    ],
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
