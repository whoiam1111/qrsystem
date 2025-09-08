import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
    await requireAdmin();
    const result = await pool.query('SELECT * FROM students ORDER BY created_at ASC');
    return Response.json(result.rows);
}
