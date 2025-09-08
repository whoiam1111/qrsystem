import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
    await requireAdmin();
    const { name } = await req.json();

    const result = await pool.query('INSERT INTO students (name) VALUES ($1) RETURNING *', [name]);

    return Response.json(result.rows[0]);
}
