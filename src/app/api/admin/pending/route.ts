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

// JWT 검증 미들웨어
async function verifyToken(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        return payload;
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const user = await verifyToken(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const eventId = url.searchParams.get('event');
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

    try {
        const client = await pool.connect();
        try {
            const res = await client.query(
                'SELECT id, name, region, role FROM students WHERE event_id=$1 AND attended=false',
                [eventId]
            );
            return NextResponse.json(res.rows);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
}
