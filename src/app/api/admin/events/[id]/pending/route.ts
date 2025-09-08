import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params; // ✅ await 필요
        const eventId = Number(id);

        if (isNaN(eventId)) {
            return NextResponse.json({ error: '유효하지 않은 event id' }, { status: 400 });
        }

        const result = await pool.query(
            `SELECT s.id, s.name, s.region, s.role
       FROM students s
       LEFT JOIN checkins c
         ON c.student_id = s.id AND c.event_id = $1
       WHERE c.id IS NULL
       ORDER BY s.region, s.name`,
            [eventId]
        );

        return NextResponse.json(result.rows, { status: 200 });
    } catch (err: any) {
        console.error('❌ pending API error:', err);
        return NextResponse.json({ error: err.message || '미출석 명단 불러오기 실패' }, { status: 500 });
    }
}
