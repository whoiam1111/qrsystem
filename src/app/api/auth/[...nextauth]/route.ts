import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pool } from 'pg';

// --------------------
// 글로벌 타입 확장 (TS7017 오류 방지)
// --------------------
declare global {
    // eslint-disable-next-line no-var
    var pgPool: Pool | undefined;
}

// --------------------
// Vercel Serverless 환경에서 Pool 재사용
// --------------------
const pool =
    global.pgPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
    });

if (!global.pgPool) {
    global.pgPool = pool;
}

// --------------------
// NextAuth 설정
// --------------------
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
                console.log('credentials:', credentials);
                console.log('DATABASE_URL:', process.env.DATABASE_URL);
                try {
                    const client = await pool.connect();
                    try {
                        const res = await client.query('SELECT * FROM admins WHERE email = $1 LIMIT 1', [
                            credentials.email,
                        ]);

                        if (res.rows.length === 0) return null;

                        const admin = res.rows[0];

                        // 평문 비밀번호 비교 (보안상 권장 X)
                        if (credentials.password !== admin.password) return null;

                        return {
                            id: String(admin.id),
                            email: admin.email,
                        };
                    } finally {
                        client.release();
                    }
                } catch (err) {
                    console.error('DB 연결 실패:', err);
                    return null;
                }
            },
        }),
    ],
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
