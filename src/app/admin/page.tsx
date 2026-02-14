import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllStudents } from '@/lib/googleSheets';
import { rankStudents } from '@/lib/ranking';
import { RankedStudent } from '@/lib/types';
import { StudentApplication } from '@/lib/types';
import { verifyAdminToken } from '@/lib/adminAuth';
import AdminClient from './AdminClient';

export const metadata = {
    title: 'Faculty Dashboard | Best Outgoing Student',
    description: 'Evaluate and rank Best Outgoing Student candidates',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token || !verifyAdminToken(token)) {
        redirect('/admin/login');
    }

    let rankedStudents: RankedStudent[];
    let allStudents: StudentApplication[] = [];
    let error = '';

    try {
        const students = await getAllStudents();
        allStudents = students;
        rankedStudents = rankStudents(students);
    } catch (err: any) {
        console.error('Admin error:', err);
        error = err?.message || 'An unexpected error occurred while fetching or ranking students.';
        if (error.includes('credentials not configured')) {
            error = 'Google Sheets is not configured yet. Please set up .env.local credentials.';
        }
        rankedStudents = [];
    }

    return <AdminClient students={rankedStudents} fullStudents={allStudents} error={error} />;
}
