import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json({ error: 'id가 없습니다' }, { status: 400 });
        }

        const result = await pool.query(
            `SELECT s.id, s.name, s.region, s.role
       FROM students s
       LEFT JOIN checkins c
         ON c.student_id = s.id AND c.event_id = $1
       WHERE c.id IS NULL
       ORDER BY s.region, s.name`,
            [id]
        );

        return NextResponse.json(result.rows, { status: 200 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message || '미출석 명단 불러오기 실패' }, { status: 500 });
    }
}
