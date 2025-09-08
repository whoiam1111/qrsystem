import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
    await requireAdmin();
    const { date } = await req.json();

    const result = await pool.query('INSERT INTO events (date) VALUES ($1) RETURNING *', [date]);

    return Response.json(result.rows[0]);
}
