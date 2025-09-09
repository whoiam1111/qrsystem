import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

declare global {
    var pgPool: Pool | undefined;
}

const pool: Pool =
    global.pgPool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

if (!global.pgPool) global.pgPool = pool;

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email?.trim() || !password?.trim())
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });

        const client = await pool.connect();
        try {
            const res = await client.query('SELECT * FROM admins WHERE email=$1 LIMIT 1', [email]);
            if (res.rows.length === 0) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

            const admin = res.rows[0];
            if (password !== admin.password)
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

            // JWT 생성
            const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET || 'secretkey', {
                expiresIn: '7d',
            });

            // HTTP Only 쿠키에 저장
            const response = NextResponse.json({ success: true });
            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7일
            });

            return response;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
