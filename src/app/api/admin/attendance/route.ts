import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const client = await pool.connect();
        try {
            // 모든 학생
            const studentsRes = await client.query('SELECT id, name, region FROM students ORDER BY name ASC');
            const students = studentsRes.rows;

            // 모든 이벤트 날짜
            const eventsRes = await client.query('SELECT id, date FROM events ORDER BY date ASC');
            const events = eventsRes.rows;

            // 출석 데이터 + 학생의 region 포함
            const attendanceRes = await client.query(
                `SELECT c.student_id, c.event_id, c.created_at, s.region
         FROM checkins c
         JOIN students s ON c.student_id = s.id`
            );
            const attendanceData = attendanceRes.rows;

            return NextResponse.json({ students, events, attendanceData }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (err: any) {
        console.error('❌ attendance API error:', err);
        return NextResponse.json({ error: err.message || '출석 데이터 불러오기 실패' }, { status: 500 });
    }
}
