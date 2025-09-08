import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim());
    if (!adminEmails.includes(session.user.email)) {
        throw new Error('Unauthorized');
    }

    return session;
}
