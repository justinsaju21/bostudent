import { NextResponse } from 'next/server';
import { getDeadline } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const deadline = await getDeadline();
        return NextResponse.json({ deadline });
    } catch (error) {
        console.error('Error fetching deadline:', error);
        return NextResponse.json({ error: 'Failed to fetch deadline' }, { status: 500 });
    }
}
