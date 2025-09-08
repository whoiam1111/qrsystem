import { pool } from '@/lib/db';

export async function POST(req: Request) {
    const { eventId, name } = await req.json();

    // 학생 확인
    const student = await pool.query('SELECT * FROM students WHERE name = $1', [name]);
    if (student.rows.length === 0) return new Response('학생 없음', { status: 400 });

    const studentId = student.rows[0].id;

    // 중복 확인
    const existing = await pool.query('SELECT * FROM checkins WHERE event_id = $1 AND student_id = $2', [
        eventId,
        studentId,
    ]);
    if (existing.rows.length > 0) return Response.json(existing.rows[0]);

    // 출석 저장
    const result = await pool.query('INSERT INTO checkins (event_id, student_id) VALUES ($1, $2) RETURNING *', [
        eventId,
        studentId,
    ]);

    return Response.json(result.rows[0]);
}
