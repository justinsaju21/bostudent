import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminToken } from '@/lib/adminAuth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
    try {
        if (!ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, message: 'Admin password not configured on server' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { password } = body;

        if (!password || password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, message: 'Invalid password' },
                { status: 401 }
            );
        }

        // Create signed token
        const token = createAdminToken();

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60, // 8 hours
            path: '/',
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');
    return NextResponse.json({ success: true });
}
