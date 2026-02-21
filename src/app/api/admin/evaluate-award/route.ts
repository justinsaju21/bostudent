import { NextResponse } from 'next/server';
import { updateCustomAwardEvaluation } from '@/lib/awardSheets';
import { AwardSlug } from '@/lib/awards';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slug, updates } = body;

        if (!slug || !updates || !Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Process all updates concurrently
        const promises = updates.map(async (update) => {
            const { regNo, facultyScore, discardedItems, isVerified } = update;
            if (!regNo) return; // Skip invalid entries

            await updateCustomAwardEvaluation(
                slug as AwardSlug,
                regNo,
                facultyScore || 0,
                discardedItems || [],
                !!isVerified
            );
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true, message: 'Evaluations updated successfully' });
    } catch (error) {
        console.error('Error saving custom award evaluations:', error);
        return NextResponse.json({ error: 'Failed to save evaluations' }, { status: 500 });
    }
}
