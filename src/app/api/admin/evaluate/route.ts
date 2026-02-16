import { NextRequest, NextResponse } from 'next/server';
import { updateStudentEvaluation, batchUpdateStudentEvaluations } from '@/lib/googleSheets';
import { verifyAdminToken } from '@/lib/adminAuth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !verifyAdminToken(token)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Handle Batch Updates
        if (body.updates && Array.isArray(body.updates)) {
            const success = await batchUpdateStudentEvaluations(body.updates);
            if (success) {
                return NextResponse.json({ success: true });
            } else {
                return NextResponse.json({ error: 'Failed to update sheets' }, { status: 500 });
            }
        }

        // Handle Single Update (Backward Compatibility)
        const { regNo, facultyScore, discardedItems } = body;

        if (!regNo) {
            return NextResponse.json({ error: 'Register number is required' }, { status: 400 });
        }

        const success = await updateStudentEvaluation(regNo, facultyScore, discardedItems);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to update sheet' }, { status: 500 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
