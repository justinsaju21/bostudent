import { NextRequest, NextResponse } from 'next/server';
import { getDeadline, setDeadline } from '@/lib/googleSheets';
import { verifyAdminToken } from '@/lib/adminAuth';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !verifyAdminToken(token)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const deadline = await getDeadline();
        return NextResponse.json({ deadline });
    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !verifyAdminToken(token)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { deadline } = body;

        if (typeof deadline !== 'string') {
            return NextResponse.json({ error: 'Deadline must be a string' }, { status: 400 });
        }

        const success = await setDeadline(deadline);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
        }
    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
