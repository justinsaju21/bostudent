import { NextResponse } from 'next/server';
import { addStudentsBatch, clearAllStudents } from '@/lib/googleSheets';
import { generateMockStudents } from '@/lib/mockData';

export async function POST() {
    try {
        // 1. Clear existing test data (optional but recommended for clean start)
        // await clearAllStudents(); 

        // 2. Generate 700 students
        const students = generateMockStudents(700);

        // 3. Push to Google Sheets in batches (to avoid timeouts)
        // addStudentsBatch handles the sheets API call
        console.log('Seeding 700 students...');
        await addStudentsBatch(students);

        return NextResponse.json({
            success: true,
            message: '700 students seeded successfully'
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
