// API route to fetch applicants for any award category
import { NextRequest, NextResponse } from 'next/server';
import { AwardSlug } from '@/lib/awards';
import { getAllAwardApplications } from '@/lib/awardSheets';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token || !verifyAdminToken(token)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = request.nextUrl.searchParams.get('slug') as AwardSlug;
    if (!slug) {
        return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    try {
        const applications = await getAllAwardApplications(slug);
        return NextResponse.json({ applications });
    } catch (error: any) {
        console.error('Award fetch error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch applications' }, { status: 500 });
    }
}
